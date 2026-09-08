import { integer, pgEnum, pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * Esquema em PostgreSQL.
 *
 * O projeto nasceu na infraestrutura do Manus, que servia MySQL. Fora dali o
 * banco passou a ser Postgres (Supabase), então os tipos mudaram:
 *   mysqlTable  -> pgTable
 *   int().autoincrement().primaryKey() -> serial().primaryKey()
 *   mysqlEnum inline -> pgEnum, que no Postgres é um tipo nomeado do banco
 *
 * Em MySQL cada enum vive dentro da coluna. No Postgres o enum é um tipo do
 * schema, com nome único no banco inteiro — por isso `contactType`, usado nas
 * duas tabelas de formulário, é declarado uma vez só e reaproveitado.
 */

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const contactTypeEnum = pgEnum("contactType", ["whatsapp", "email"]);
export const interestStageEnum = pgEnum("interestStage", ["know_more", "talk_to_team"]);
export const journeyFocusEnum = pgEnum("journeyFocus", [
  "understand_fit",
  "restore_dialogue",
  "renew_connection",
  "align_direction",
]);
export const fragmentedAreaEnum = pgEnum("fragmentedArea", [
  "emotional",
  "relationships",
  "family",
  "professional",
  "prosperity",
  "purpose",
  "faith",
]);
export const currentMomentEnum = pgEnum("currentMoment", [
  "understand_method",
  "ready_to_start",
  "still_evaluating",
]);

/**
 * Tabela de usuários do fluxo de autenticação.
 * Os nomes das colunas seguem camelCase, iguais aos do código.
 */
export const users = pgTable("users", {
  /** Chave primária numérica, gerada pelo banco. */
  id: serial("id").primaryKey(),
  /** Identificador do OAuth (openId) devolvido no callback. Único por usuário. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  /**
   * O Postgres não tem ON UPDATE CURRENT_TIMESTAMP como o MySQL: lá isso é
   * feito por trigger. Como só existe um ponto de escrita (upsertUser), o
   * carimbo fica a cargo do Drizzle, via $onUpdate.
   */
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
  lastSignedIn: timestamp("lastSignedIn", { withTimezone: true }).defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Interesses públicos enviados pelo formulário de mentoria de casais. */
export const coupleMentoringInterests = pgTable("coupleMentoringInterests", {
  id: serial("id").primaryKey(),
  fullName: varchar("fullName", { length: 120 }).notNull(),
  partnerName: varchar("partnerName", { length: 120 }),
  contactType: contactTypeEnum("contactType").notNull(),
  contactValue: varchar("contactValue", { length: 320 }).notNull(),
  interestStage: interestStageEnum("interestStage").notNull(),
  journeyFocus: journeyFocusEnum("journeyFocus").default("understand_fit").notNull(),
  /** 1 = autorizou o contato. Mantido como inteiro, igual ao que o router envia. */
  consent: integer("consent").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type CoupleMentoringInterest = typeof coupleMentoringInterests.$inferSelect;
export type InsertCoupleMentoringInterest = typeof coupleMentoringInterests.$inferInsert;

/** Pedidos de Avaliação INTEIRA enviados pelo formulário da Mentoria INTEIRA (Método ÁGUIA). */
export const interaEvaluationRequests = pgTable("interaEvaluationRequests", {
  id: serial("id").primaryKey(),
  fullName: varchar("fullName", { length: 120 }).notNull(),
  contactType: contactTypeEnum("contactType").notNull(),
  contactValue: varchar("contactValue", { length: 320 }).notNull(),
  fragmentedArea: fragmentedAreaEnum("fragmentedArea").notNull(),
  currentMoment: currentMomentEnum("currentMoment").default("still_evaluating").notNull(),
  consent: integer("consent").notNull(),
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type InteraEvaluationRequest = typeof interaEvaluationRequests.$inferSelect;
export type InsertInteraEvaluationRequest = typeof interaEvaluationRequests.$inferInsert;
