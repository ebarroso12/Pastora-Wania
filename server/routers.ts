import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { askMentoringAssistant, isWithinAssistantScope } from "./mentoringAssistant";
import { createCoupleMentoringInterest, createInteraEvaluationRequest } from "./db";
import { notifyInteraEvaluationTeam, notifyLeadTeam } from "./leadNotification";
import { getAdminBootstrapStatus } from "./adminBootstrap";

const assistantRequests = new Map<string, { count: number; resetAt: number }>();
const ASSISTANT_WINDOW_MS = 10 * 60 * 1000;
const ASSISTANT_MAX_REQUESTS = 8;
const interestRequests = new Map<string, { count: number; resetAt: number }>();
const INTEREST_WINDOW_MS = 60 * 60 * 1000;
const INTEREST_MAX_REQUESTS = 3;
const evaluationRequests = new Map<string, { count: number; resetAt: number }>();
const EVALUATION_WINDOW_MS = 60 * 60 * 1000;
const EVALUATION_MAX_REQUESTS = 3;

export const interaEvaluationInput = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome.").max(120),
  contactType: z.enum(["whatsapp", "email"]),
  contactValue: z.string().trim().min(5).max(320),
  fragmentedArea: z.enum(["emotional", "relationships", "family", "professional", "prosperity", "purpose", "faith"]),
  currentMoment: z.enum(["understand_method", "ready_to_start", "still_evaluating"]),
  consent: z.boolean().refine(value => value, { message: "É necessário autorizar o contato da equipe." }),
}).superRefine((value, context) => {
  if (value.contactType === "email" && !z.string().email().safeParse(value.contactValue).success) {
    context.addIssue({ code: "custom", path: ["contactValue"], message: "Informe um e-mail válido." });
  }
  if (value.contactType === "whatsapp" && value.contactValue.replace(/\D/g, "").length < 10) {
    context.addIssue({ code: "custom", path: ["contactValue"], message: "Informe um WhatsApp válido com DDD." });
  }
});

export const coupleInterestInput = z.object({
  fullName: z.string().trim().min(2, "Informe seu nome.").max(120),
  partnerName: z.string().trim().max(120).optional(),
  contactType: z.enum(["whatsapp", "email"]),
  contactValue: z.string().trim().min(5).max(320),
  interestStage: z.enum(["know_more", "talk_to_team"]),
  journeyFocus: z.enum(["understand_fit", "restore_dialogue", "renew_connection", "align_direction"]),
  consent: z.boolean().refine(value => value, { message: "É necessário autorizar o contato da equipe." }),
}).superRefine((value, context) => {
  if (value.contactType === "email" && !z.string().email().safeParse(value.contactValue).success) {
    context.addIssue({ code: "custom", path: ["contactValue"], message: "Informe um e-mail válido." });
  }
  if (value.contactType === "whatsapp" && value.contactValue.replace(/\D/g, "").length < 10) {
    context.addIssue({ code: "custom", path: ["contactValue"], message: "Informe um WhatsApp válido com DDD." });
  }
});

function getVisitorKey(forwardedFor: string | string[] | undefined) {
  if (Array.isArray(forwardedFor)) return forwardedFor[0] ?? "anonymous";
  return forwardedFor?.split(",")[0]?.trim() || "anonymous";
}

function consumeAssistantRequest(visitorKey: string) {
  const now = Date.now();
  const current = assistantRequests.get(visitorKey);
  if (!current || current.resetAt <= now) {
    assistantRequests.set(visitorKey, { count: 1, resetAt: now + ASSISTANT_WINDOW_MS });
    return true;
  }

  if (current.count >= ASSISTANT_MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

function consumeRateLimit(store: Map<string, { count: number; resetAt: number }>, visitorKey: string, windowMs: number, maxRequests: number) {
  const now = Date.now();
  const current = store.get(visitorKey);
  if (!current || current.resetAt <= now) {
    store.set(visitorKey, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= maxRequests) return false;
  current.count += 1;
  return true;
}

function consumeInterestRequest(visitorKey: string) {
  return consumeRateLimit(interestRequests, visitorKey, INTEREST_WINDOW_MS, INTEREST_MAX_REQUESTS);
}

function consumeEvaluationRequest(visitorKey: string) {
  return consumeRateLimit(evaluationRequests, visitorKey, EVALUATION_WINDOW_MS, EVALUATION_MAX_REQUESTS);
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  adminBootstrap: router({
    status: publicProcedure.query(() => getAdminBootstrapStatus()),
  }),
  assistant: router({
    ask: publicProcedure
      .input(z.object({ message: z.string().trim().min(3).max(600) }))
      .mutation(async ({ ctx, input }) => {
        if (!isWithinAssistantScope(input.message)) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Envie uma pergunta entre 3 e 600 caracteres." });
        }

        const visitorKey = getVisitorKey(ctx.req.headers["x-forwarded-for"]);
        if (!consumeAssistantRequest(visitorKey)) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Para manter o atendimento disponível, aguarde alguns minutos antes de enviar outra pergunta.",
          });
        }

        try {
          const answer = await askMentoringAssistant(input.message);
          return { answer };
        } catch (error) {
          console.error("[Assistant] Gemini request failed", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "A assistente está indisponível neste instante. Tente novamente em alguns minutos.",
          });
        }
      }),
  }),
  coupleInterest: router({
    submit: publicProcedure.input(coupleInterestInput).mutation(async ({ ctx, input }) => {
      const visitorKey = getVisitorKey(ctx.req.headers["x-forwarded-for"]);
      if (!consumeInterestRequest(visitorKey)) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Recebemos seu interesse. Aguarde antes de enviar novamente." });
      }

      let savedToDb = false;
      try {
        await createCoupleMentoringInterest({
          fullName: input.fullName,
          partnerName: input.partnerName || null,
          contactType: input.contactType,
          contactValue: input.contactValue,
          interestStage: input.interestStage,
          journeyFocus: input.journeyFocus,
          consent: 1,
        });
        savedToDb = true;
      } catch (error) {
        console.warn("[Couple Interest] Não foi possível salvar no banco de dados; seguindo apenas com a notificação.", error);
      }

      let delivered = false;
      try {
        const notification = await notifyLeadTeam({
          fullName: input.fullName,
          partnerName: input.partnerName || null,
          contactType: input.contactType,
          contactValue: input.contactValue,
          interestStage: input.interestStage,
          journeyFocus: input.journeyFocus,
        });
        delivered = notification.delivered;
        if (!delivered) {
          console.warn("[Couple Interest] Nenhuma notificação foi entregue.");
        }
      } catch (notificationError) {
        console.warn("[Couple Interest] Falha na notificação.", notificationError);
      }

      if (!savedToDb && !delivered) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível registrar seu interesse agora. Tente novamente em alguns minutos." });
      }
      return { success: true } as const;
    }),
  }),
  interaEvaluation: router({
    submit: publicProcedure.input(interaEvaluationInput).mutation(async ({ ctx, input }) => {
      const visitorKey = getVisitorKey(ctx.req.headers["x-forwarded-for"]);
      if (!consumeEvaluationRequest(visitorKey)) {
        throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Recebemos sua solicitação. Aguarde antes de enviar novamente." });
      }

      let savedToDb = false;
      try {
        await createInteraEvaluationRequest({
          fullName: input.fullName,
          contactType: input.contactType,
          contactValue: input.contactValue,
          fragmentedArea: input.fragmentedArea,
          currentMoment: input.currentMoment,
          consent: 1,
        });
        savedToDb = true;
      } catch (error) {
        console.warn("[Intera Evaluation] Não foi possível salvar no banco de dados; seguindo apenas com a notificação.", error);
      }

      let delivered = false;
      try {
        const notification = await notifyInteraEvaluationTeam({
          fullName: input.fullName,
          contactType: input.contactType,
          contactValue: input.contactValue,
          fragmentedArea: input.fragmentedArea,
          currentMoment: input.currentMoment,
        });
        delivered = notification.delivered;
        if (!delivered) {
          console.warn("[Intera Evaluation] Nenhuma notificação foi entregue.");
        }
      } catch (notificationError) {
        console.warn("[Intera Evaluation] Falha na notificação.", notificationError);
      }

      if (!savedToDb && !delivered) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Não foi possível registrar sua solicitação agora. Tente novamente em alguns minutos." });
      }
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
