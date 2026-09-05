import { beforeEach, describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createCoupleMentoringInterest: vi.fn(),
}));

vi.mock("./leadNotification", () => ({
  notifyLeadTeam: vi.fn().mockResolvedValue({ channel: "internal", delivered: true }),
}));

import { createCoupleMentoringInterest } from "./db";
import { notifyLeadTeam } from "./leadNotification";
import { appRouter } from "./routers";

const validInterest = {
  fullName: "Ana Martins",
  partnerName: "João Martins",
  contactType: "whatsapp" as const,
  contactValue: "(16) 99999-1234",
  interestStage: "know_more" as const,
  journeyFocus: "understand_fit" as const,
  consent: true as const,
};

function createPublicContext(): TrpcContext {
  return {
    user: null,
    req: { headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("coupleInterest.submit", () => {
  beforeEach(() => vi.clearAllMocks());

  it("salva somente os dados necessários após validar o consentimento", async () => {
    const caller = appRouter.createCaller(createPublicContext());
    const result = await caller.coupleInterest.submit(validInterest);

    expect(result).toEqual({ success: true });
    expect(createCoupleMentoringInterest).toHaveBeenCalledWith({
      ...validInterest,
      consent: 1,
    });
    expect(notifyLeadTeam).toHaveBeenCalledWith({
      fullName: validInterest.fullName,
      partnerName: "João Martins",
      contactType: validInterest.contactType,
      contactValue: validInterest.contactValue,
      interestStage: validInterest.interestStage,
      journeyFocus: validInterest.journeyFocus,
    });
  });

  it("confirma o cadastro mesmo se a notificação falhar", async () => {
    vi.mocked(notifyLeadTeam).mockRejectedValueOnce(new Error("Serviço indisponível"));
    const caller = appRouter.createCaller(createPublicContext());

    await expect(caller.coupleInterest.submit(validInterest)).resolves.toEqual({ success: true });
    expect(createCoupleMentoringInterest).toHaveBeenCalledTimes(1);
  });
});
