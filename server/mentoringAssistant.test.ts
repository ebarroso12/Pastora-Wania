import { describe, expect, it } from "vitest";
import { assistantUnavailableMessage, getCuratedAnswer, isWithinAssistantScope } from "./mentoringAssistant";

describe("Assistente de Presença", () => {
  it("aceita perguntas objetivas dentro do limite público", () => {
    expect(isWithinAssistantScope("Qual versículo posso ler para recomeçar?")).toBe(true);
    expect(isWithinAssistantScope("oração")).toBe(true);
  });

  it("recusa mensagens vazias, curtas demais ou extensas demais", () => {
    expect(isWithinAssistantScope("  ")).toBe(false);
    expect(isWithinAssistantScope("oi")).toBe(false);
    expect(isWithinAssistantScope("a".repeat(601))).toBe(false);
  });

  it("mantém um encaminhamento humano quando o modelo estiver indisponível", () => {
    expect(assistantUnavailableMessage).toContain("instagram.com/apwaniaarantes");
  });

  it("entrega recursos bíblicos e de fé verificados para perguntas recorrentes", () => {
    expect(getCuratedAnswer("Qual versículo ler para recomeçar?")).toContain("Isaías 43");
    expect(getCuratedAnswer("Você pode fazer uma oração breve?")).toContain("Senhor");
    expect(getCuratedAnswer("Indique uma mensagem da Wânia")).toContain("Viva com Propósito");
    expect(getCuratedAnswer("Como conhecer a Casa de Oração?")).toContain("Casa de Oração Franca");
    expect(getCuratedAnswer("Como a fé pode apoiar o casamento?")).toContain("Efésios 4:2-3");
  });
});
