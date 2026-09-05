import { describe, expect, it } from "vitest";
import type { TrpcContext } from "./_core/context";
import { appRouter } from "./routers";

describe("adminBootstrap.status", () => {
  it("confirma pelo endpoint que as configurações seguras do painel foram injetadas", async () => {
    const caller = appRouter.createCaller({
      user: null,
      req: { headers: {} } as TrpcContext["req"],
      res: {} as TrpcContext["res"],
    });

    await expect(caller.adminBootstrap.status()).resolves.toEqual({
      initialAdminPasswordConfigured: true,
      leadRecipientConfigured: true,
    });
  });
});
