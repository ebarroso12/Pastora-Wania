import { describe, expect, it } from "vitest";
import { coupleInterestInput } from "./routers";

describe("Formulário de interesse para casais", () => {
  const validInterest = {
    fullName: "Ana Martins",
    partnerName: "João Martins",
    contactType: "whatsapp" as const,
    contactValue: "(16) 99999-1234",
    interestStage: "know_more" as const,
    journeyFocus: "understand_fit" as const,
    consent: true as const,
  };

  it("aceita os dados mínimos com consentimento", () => {
    expect(coupleInterestInput.safeParse(validInterest).success).toBe(true);
  });

  it("rejeita contato inválido e ausência de consentimento", () => {
    expect(coupleInterestInput.safeParse({ ...validInterest, contactValue: "123" }).success).toBe(false);
    expect(coupleInterestInput.safeParse({ ...validInterest, consent: false }).success).toBe(false);
  });
});
