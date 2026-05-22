import {
  pgTable,
  serial,
  varchar,
  integer,
  text,
  boolean,
  timestamp,
  pgEnum,
} from "drizzle-orm/pg-core";

// ===== ENUM TYPES =====
export const transacaoTipo = pgEnum("transacao_tipo", ["receita", "despesa"]);
export const categoriaTipo = pgEnum("categoria_tipo", ["receita", "despesa"]);
export const metaTipo = pgEnum("meta_tipo", ["limite", "economia"]);
export const notificacaoTipo = pgEnum("notificacao_tipo", ["info", "warning", "error"]);

// ===== TABELAS =====

/**
 * Tabela de Usuários
 */
export const usuarios = pgTable("usuarios", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  senha: varchar("senha", { length: 255 }).notNull(),
  fotoPerfil: text("foto_perfil").default(""),
  moeda: varchar("moeda", { length: 3 }).default("BRL"),
  darkMode: boolean("dark_mode").default(false),
  ocultarValores: boolean("ocultar_valores").default(false),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
});

/**
 * Tabela de Categorias
 */
export const categorias = pgTable("categorias", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 255 }).notNull(),
  tipo: categoriaTipo("tipo").notNull(), // 'receita' ou 'despesa'
  cor: varchar("cor", { length: 7 }).default("#3B82F6"), // hex color
  icone: varchar("icone", { length: 50 }).default("Tag"), // nome do ícone
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
});

/**
 * Tabela de Transações
 */
export const transacoes = pgTable("transacoes", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  categoriaId: integer("categoria_id")
    .notNull()
    .references(() => categorias.id, { onDelete: "restrict" }),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  valor: integer("valor").notNull(), // em centavos
  data: timestamp("data").notNull(),
  tipo: transacaoTipo("tipo").notNull(), // 'receita' ou 'despesa'
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
});

/**
 * Tabela de Metas
 */
export const metas = pgTable("metas", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  descricao: varchar("descricao", { length: 255 }).notNull(),
  valor: integer("valor").notNull(), // em centavos
  mes: integer("mes").notNull(), // 1-12
  ano: integer("ano").notNull(),
  tipo: metaTipo("tipo").notNull(), // 'limite' ou 'economia'
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
  atualizadoEm: timestamp("atualizado_em").defaultNow().notNull(),
});

/**
 * Tabela de Notificações
 */
export const notificacoes = pgTable("notificacoes", {
  id: serial("id").primaryKey(),
  usuarioId: integer("usuario_id")
    .notNull()
    .references(() => usuarios.id, { onDelete: "cascade" }),
  texto: text("texto").notNull(),
  tipo: notificacaoTipo("tipo").notNull(), // 'info', 'warning', 'error'
  lida: boolean("lida").default(false),
  criadoEm: timestamp("criado_em").defaultNow().notNull(),
});

// ===== TIPOS TYPESCRIPT =====

export type Usuario = typeof usuarios.$inferSelect;
export type NovoUsuario = typeof usuarios.$inferInsert;

export type Categoria = typeof categorias.$inferSelect;
export type NovaCategoria = typeof categorias.$inferInsert;

export type Transacao = typeof transacoes.$inferSelect;
export type NovaTransacao = typeof transacoes.$inferInsert;

export type Meta = typeof metas.$inferSelect;
export type NovaMeta = typeof metas.$inferInsert;

export type Notificacao = typeof notificacoes.$inferSelect;
export type NovaNotificacao = typeof notificacoes.$inferInsert;
