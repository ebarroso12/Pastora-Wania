import { describe, expect, it } from "vitest";
import { analyzeCoupleInterest } from "./leadAnalysis";
import { formatLeadNotification } from "./leadNotification";

describe("guia de leitura do interesse em mentoria de casais", () => {
  const lead = {
    fullName: "Pessoa de Teste",
    partnerName: "Parceiro de Teste",
    contactType: "whatsapp" as const,
    contactValue: "(16) 99999-9999",
    interestStage: "talk_to_team" as const,
    journeyFocus: "restore_dialogue" as const,
  };

  it("prioriza um pedido declarado de conversa com a equipe", () => {
    expect(analyzeCoupleInterest(lead)).toMatchObject({
      priority: "priority",
      declaredFocus: expect.stringContaining("conversar"),
    });
  });

  it("gera uma notificação que explicita limites e próximo passo", () => {
    const content = formatLeadNotification(lead);
    expect(content).toContain("Prioridade operacional: Contato preferencial");
    expect(content).toContain("Próximo passo indicado:");
    expect(content).toContain("Não é diagnóstico do casal");
  });
});
