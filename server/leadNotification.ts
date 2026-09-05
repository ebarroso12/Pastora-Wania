import { notifyOwner } from "./_core/notification";
import nodemailer from "nodemailer";
import {
  analyzeCoupleInterest,
  type CoupleInterestForAnalysis,
  type LeadGuidance,
} from "./leadAnalysis";

const RECIPIENTS = [
  "meularfelizoficial@gmail.com",
  "edson.barroso@gmail.com",
] as const;

export type LeadNotificationInput = CoupleInterestForAnalysis & {
  guidance?: LeadGuidance;
};

export function formatLeadNotification(input: LeadNotificationInput): string {
  const guidance = input.guidance ?? analyzeCoupleInterest(input);
  const partner = input.partnerName?.trim()
    ? `\nCônjuge/parceiro(a) informado: ${input.partnerName.trim()}`
    : "";
  const contactLabel = input.contactType === "whatsapp" ? "WhatsApp" : "E-mail";
  const stage =
    input.interestStage === "talk_to_team"
      ? "Deseja conversar com a equipe sobre o próximo passo"
      : "Deseja entender como funciona a mentoria";
  const priorityLabel =
    guidance.priority === "priority" ? "Contato preferencial" : "Acolhimento inicial";

  return `NOVO INTERESSE — MENTORIA DE CASAIS

Lead: ${input.fullName.trim()}${partner}
Canal preferido: ${contactLabel} — ${input.contactValue.trim()}
Etapa declarada: ${stage}

GUIA DE LEITURA DO LEAD
Prioridade operacional: ${priorityLabel}
Foco declarado: ${guidance.declaredFocus}
O que esta pessoa pode esperar: ${guidance.whatToExpect}
Postura recomendada: ${guidance.pastoralPosture}
Próximo passo indicado: ${guidance.nextStep}
Mensagem inicial sugerida: ${guidance.suggestedOpening.replace("[nome]", input.fullName.trim())}

Nota de cuidado: esta leitura usa somente as escolhas declaradas no formulário. Não é diagnóstico do casal e não substitui escuta humana ou suporte especializado quando necessário.`;
}

const GMAIL_SENDER = "edson.barroso@gmail.com";

export function hasGmailAppPassword(value = process.env.GMAIL_SMTP_APP_PASSWORD): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

async function sendWithGmail(content: string): Promise<boolean> {
  const appPassword = process.env.GMAIL_SMTP_APP_PASSWORD?.trim();
  if (!hasGmailAppPassword(appPassword)) return false;

  try {
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_SENDER,
        pass: appPassword,
      },
    });
    await transport.sendMail({
      from: `Wânia Arantes — Mentoria <${GMAIL_SENDER}>`,
      to: RECIPIENTS.join(", "),
      subject: "Novo interesse | Mentoria de Casais — Wânia Arantes",
      text: content,
    });
    return true;
  } catch (error) {
    console.warn("[Lead notification] Falha ao enviar e-mail pelo Gmail", error);
    return false;
  }
}

/**
 * O cadastro é independente da notificação. Se o Gmail ainda não estiver
 * configurado, a equipe recebe o alerta interno do projeto como contingência.
 */
export async function notifyLeadTeam(
  input: LeadNotificationInput
): Promise<{ channel: "email" | "internal" | "unavailable"; delivered: boolean }> {
  const content = formatLeadNotification(input);
  if (await sendWithGmail(content)) {
    return { channel: "email", delivered: true };
  }

  const internalDelivered = await notifyOwner({
    title: "Novo interesse — Mentoria de Casais",
    content,
  });
  return {
    channel: internalDelivered ? "internal" : "unavailable",
    delivered: internalDelivered,
  };
}
