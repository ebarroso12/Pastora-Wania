import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/** Interesses públicos enviados pelo formulário de mentoria de casais. */
export const coupleMentoringInterests = mysqlTable("coupleMentoringInterests", {
  id: int("id").autoincrement().primaryKey(),
  fullName: varchar("fullName", { length: 120 }).notNull(),
  partnerName: varchar("partnerName", { length: 120 }),
  contactType: mysqlEnum("contactType", ["whatsapp", "email"]).notNull(),
  contactValue: varchar("contactValue", { length: 320 }).notNull(),
  interestStage: mysqlEnum("interestStage", ["know_more", "talk_to_team"]).notNull(),
  journeyFocus: mysqlEnum("journeyFocus", ["understand_fit", "restore_dialogue", "renew_connection", "align_direction"]).default("understand_fit").notNull(),
  consent: int("consent").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CoupleMentoringInterest = typeof coupleMentoringInterests.$inferSelect;
export type InsertCoupleMentoringInterest = typeof coupleMentoringInterests.$inferInsert;
