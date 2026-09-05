import { describe, expect, it } from "vitest";
import { askMentoringAssistant } from "./mentoringAssistant";

describe("assistente de presença — integração Gemini", () => {
  it("responde a uma dúvida institucional sem expor instruções internas", async () => {
    const answer = await askMentoringAssistant("Como funciona a mentoria da Wânia?");

    expect(answer.length).toBeGreaterThan(30);
    expect(answer.length).toBeLessThan(1_400);
    expect(answer.toLocaleLowerCase("pt-BR")).toContain("mentoria");
    expect(answer).not.toContain("BASE DE CONHECIMENTO");
  }, 30_000);
});
