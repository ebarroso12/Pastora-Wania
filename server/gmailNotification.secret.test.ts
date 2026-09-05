import { describe, expect, it } from "vitest";
import { hasGmailAppPassword } from "./leadNotification";

describe("configuração de e-mail de novos leads", () => {
  it("só permite a ativação externa quando há senha de aplicativo", () => {
    expect(hasGmailAppPassword("")).toBe(false);
    expect(hasGmailAppPassword("    ")).toBe(false);
    expect(hasGmailAppPassword("abcd efgh ijkl mnop")).toBe(true);
  });
});
