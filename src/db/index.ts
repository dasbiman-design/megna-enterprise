import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
const { Pool } = pg;
import * as schema from "./schema.ts";

export const createPool = () => {
  const host = process.env.SQL_HOST;
  const user = process.env.SQL_USER;
  const password = process.env.SQL_PASSWORD;
  const databaseName = process.env.SQL_DB_NAME;

  if (!host || !user || !password || !databaseName) {
    console.warn("SQL connection variables not fully set. Database helper will run in memory fallback mode.");
    return null;
  }

  return new Pool({
    host,
    user,
    password,
    database: databaseName,
    connectionTimeoutMillis: 15000,
  });
};

const pool = createPool();

if (pool) {
  pool.on("error", (err) => {
    console.error("Unexpected error on idle SQL pool client:", err);
  });
}

export const db = pool ? drizzle(pool, { schema }) : null;
