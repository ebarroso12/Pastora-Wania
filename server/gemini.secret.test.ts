/**
 * Valida, sem expor o segredo, que a credencial da Gemini permite uma chamada leve de catálogo.
 */
import { describe, expect, it } from "vitest";

describe("GEMINI_API_KEY", () => {
  it("autoriza a leitura do catálogo público de modelos", async () => {
    const apiKey = process.env.GEMINI_API_KEY;

    expect(apiKey).toBeTruthy();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey ?? "")}`,
    );

    expect(response.ok).toBe(true);
    const payload = (await response.json()) as { models?: unknown[] };
    expect(Array.isArray(payload.models)).toBe(true);
  }, 15_000);
});
