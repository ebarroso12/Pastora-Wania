/**
 * Aplicacao Express usada pela funcao serverless da Vercel.
 *
 * Reaproveita exatamente o mesmo app Express de `server/_core/index.ts`,
 * sem o `listen` e sem o Vite: na Vercel o front é servido como arquivo
 * estático a partir de `dist/public`, e só as rotas de API passam por aqui.
 *
 * O arquivo se chama `[...path].ts` para que a Vercel encaminhe todo
 * `/api/**` para esta função preservando a URL original — que é o que o
 * Express precisa para casar as rotas.
 */
import "dotenv/config";
import express from "express";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { createContext } from "./_core/context";
import { registerOAuthRoutes } from "./_core/oauth";
import { registerStorageProxy } from "./_core/storageProxy";
import { appRouter } from "./routers";

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

/**
 * O proxy de imagens responde em `/manus-storage/*`, fora de `/api`.
 * O rewrite do vercel.json traz essas requisições para cá como
 * `/api/manus-storage/*`; aqui devolvemos a URL ao formato que o
 * `registerStorageProxy` já espera, sem alterar o código do servidor.
 */
app.use((req, _res, next) => {
  if (req.url.startsWith("/api/manus-storage/")) {
    req.url = req.url.slice("/api".length);
  }
  next();
});

registerStorageProxy(app);
registerOAuthRoutes(app);

app.use(
  "/api/trpc",
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

export default app;
