import { db } from "./db";
import { sql } from "drizzle-orm";

// Executa a criação das estruturas do banco de dados
async function migrate() {
  console.log("⏳ Iniciando migração...");
  
  try {
    // Criação dos tipos ENUM utilizados pelo sistema
    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE transacao_tipo AS ENUM ('receita', 'despesa');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE categoria_tipo AS ENUM ('receita', 'despesa');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE meta_tipo AS ENUM ('limite', 'economia');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    await db.execute(sql`DO $$ BEGIN
      CREATE TYPE notificacao_tipo AS ENUM ('info', 'warning', 'error');
    EXCEPTION
      WHEN duplicate_object THEN null;
    END $$;`);

    // Criação das Tabelas
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        foto_perfil TEXT DEFAULT '',
        moeda VARCHAR(3) DEFAULT 'BRL',
        dark_mode BOOLEAN DEFAULT false,
        ocultar_valores BOOLEAN DEFAULT false,
        criado_em TIMESTAMP DEFAULT NOW() NOT NULL,
        atualizado_em TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      ALTER TABLE usuarios
      ADD COLUMN IF NOT EXISTS foto_perfil TEXT DEFAULT '';
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categorias (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        tipo categoria_tipo NOT NULL,
        cor VARCHAR(7) DEFAULT '#3B82F6',
        icone VARCHAR(50) DEFAULT 'Tag',
        criado_em TIMESTAMP DEFAULT NOW() NOT NULL,
        atualizado_em TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS transacoes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        categoria_id INTEGER NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
        descricao VARCHAR(255) NOT NULL,
        valor INTEGER NOT NULL,
        data TIMESTAMP NOT NULL,
        tipo transacao_tipo NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW() NOT NULL,
        atualizado_em TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS metas (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        descricao VARCHAR(255) NOT NULL,
        valor INTEGER NOT NULL,
        mes INTEGER NOT NULL,
        ano INTEGER NOT NULL,
        tipo meta_tipo NOT NULL,
        criado_em TIMESTAMP DEFAULT NOW() NOT NULL,
        atualizado_em TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS notificacoes (
        id SERIAL PRIMARY KEY,
        usuario_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        texto TEXT NOT NULL,
        tipo notificacao_tipo NOT NULL,
        lida BOOLEAN DEFAULT false,
        criado_em TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);

    console.log("✅ Migração concluída com sucesso!");
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    process.exit(1);
  }
}

migrate();
