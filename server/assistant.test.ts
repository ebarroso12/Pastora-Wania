import { describe, expect, it } from "vitest";
import { assistantUnavailableMessage, isWithinAssistantScope } from "./mentoringAssistant";

describe("assistente de presença", () => {
  it("aceita perguntas curtas e limita mensagens excessivamente longas", () => {
    expect(isWithinAssistantScope("Como funciona a mentoria?")).toBe(true);
    expect(isWithinAssistantScope("oi")).toBe(false);
    expect(isWithinAssistantScope("a".repeat(601))).toBe(false);
  });

  it("mantém um encaminhamento humano quando a resposta não está disponível", () => {
    expect(assistantUnavailableMessage).toContain("instagram.com/apwaniaarantes");
  });
});
