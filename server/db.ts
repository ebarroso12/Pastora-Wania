import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { coupleMentoringInterests, InsertCoupleMentoringInterest, InsertInteraEvaluationRequest, InsertUser, interaEvaluationRequests, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;

/**
 * Conexão com o Postgres (Supabase).
 *
 * A API roda como função serverless na Vercel: cada requisição pode subir uma
 * instância nova, e cada instância abriria a própria conexão. Por isso a
 * DATABASE_URL deve apontar para o **pooler de transação** do Supabase
 * (Supavisor, porta 6543) e não para a conexão direta (5432) — senão o limite
 * de conexões do Postgres estoura assim que houver acesso simultâneo.
 *
 * Duas consequências dessa escolha, ambas tratadas aqui:
 *   prepare:false — em modo de transação o pooler não garante que a próxima
 *                   consulta caia na mesma sessão, então prepared statements
 *                   nomeados quebram;
 *   max:1         — uma conexão por instância; quem multiplexa é o pooler.
 */
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _client = postgres(process.env.DATABASE_URL, {
        prepare: false,
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
      });
      _db = drizzle(_client);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _client = null;
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // MySQL: ON DUPLICATE KEY UPDATE. Postgres: ON CONFLICT, e aqui o alvo
    // precisa ser dito explicitamente — a coluna única openId.
    await db.insert(users).values(values).onConflictDoUpdate({
      target: users.openId,
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function createCoupleMentoringInterest(input: InsertCoupleMentoringInterest): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(coupleMentoringInterests).values(input);
}

export async function createInteraEvaluationRequest(input: InsertInteraEvaluationRequest): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Banco de dados indisponível");
  await db.insert(interaEvaluationRequests).values(input);
}
