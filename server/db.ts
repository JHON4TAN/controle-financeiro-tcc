import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

// Configurar conexão com PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });

// Testar conexão
export async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Conexão com PostgreSQL estabelecida:", result.rows[0]);
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar com PostgreSQL:", error);
    return false;
  }
}

// Fechar conexão
export async function closeConnection() {
  await pool.end();
  console.log("Conexão com PostgreSQL fechada");
}