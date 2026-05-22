import { db } from "./db";
import { usuarios, categorias, transacoes, metas, notificacoes } from "./schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import type {
  Usuario,
  NovoUsuario,
  Categoria,
  NovaCategoria,
  Transacao,
  NovaTransacao,
  Meta,
  NovaMeta,
  Notificacao,
  NovaNotificacao,
} from "./schema";

// ===== USUÁRIOS =====

export async function criarUsuario(dados: NovoUsuario): Promise<Usuario> {
  const [usuario] = await db.insert(usuarios).values(dados).returning();
  return usuario;
}

export async function obterUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const [usuario] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, email));
  return usuario || null;
}

export async function obterUsuarioPorId(id: number): Promise<Usuario | null> {
  const [usuario] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id, id));
  return usuario || null;
}

export async function atualizarUsuario(
  id: number,
  dados: Partial<NovoUsuario>
): Promise<Usuario> {
  const [usuario] = await db
    .update(usuarios)
    .set({
        ...(dados.nome && { nome: dados.nome }),
        ...(dados.email && { email: dados.email }),
        ...(dados.senha && { senha: dados.senha }),
        ...(dados.fotoPerfil && { fotoPerfil: dados.fotoPerfil }),
        atualizadoEm: new Date(),
      })
    .where(eq(usuarios.id, id))
    .returning();
  return usuario;
}

export const deletarUsuario = async (
  id: number
) => {
  const [usuario] = await db
    .delete(usuarios)
    .where(eq(usuarios.id, id))
    .returning();

  return usuario;
};

// ===== CATEGORIAS =====

export async function criarCategoria(dados: NovaCategoria): Promise<Categoria> {
  const [categoria] = await db.insert(categorias).values(dados).returning();
  return categoria;
}

export async function listarCategorias(usuarioId: number): Promise<Categoria[]> {
  return db
    .select()
    .from(categorias)
    .where(eq(categorias.usuarioId, usuarioId))
    .orderBy(desc(categorias.criadoEm));
}

export async function obterCategoriaPorId(id: number): Promise<Categoria | null> {
  const [categoria] = await db
    .select()
    .from(categorias)
    .where(eq(categorias.id, id));
  return categoria || null;
}

export async function atualizarCategoria(
  id: number,
  dados: Partial<NovaCategoria>
): Promise<Categoria> {
  const [categoria] = await db
    .update(categorias)
    .set({ ...dados, atualizadoEm: new Date() })
    .where(eq(categorias.id, id))
    .returning();
  return categoria;
}

export async function deletarCategoria(id: number): Promise<boolean> {
  const resultado = await db
    .delete(categorias)
    .where(eq(categorias.id, id));
  return !!resultado;
}

// ===== TRANSAÇÕES =====

export async function criarTransacao(dados: NovaTransacao): Promise<Transacao> {
  const [transacao] = await db.insert(transacoes).values(dados).returning();
  return transacao;
}

export async function listarTransacoes(usuarioId: number): Promise<Transacao[]> {
  return db
    .select()
    .from(transacoes)
    .where(eq(transacoes.usuarioId, usuarioId))
    .orderBy(desc(transacoes.data));
}

export async function listarTransacoesPorPeriodo(
  usuarioId: number,
  dataInicio: Date,
  dataFim: Date
): Promise<Transacao[]> {
  return db
    .select()
    .from(transacoes)
    .where(
      and(
        eq(transacoes.usuarioId, usuarioId),
        gte(transacoes.data, dataInicio),
        lte(transacoes.data, dataFim)
      )
    )
    .orderBy(desc(transacoes.data));
}

export async function obterTransacaoPorId(id: number): Promise<Transacao | null> {
  const [transacao] = await db
    .select()
    .from(transacoes)
    .where(eq(transacoes.id, id));
  return transacao || null;
}

export async function atualizarTransacao(
  id: number,
  dados: Partial<NovaTransacao>
): Promise<Transacao> {
  const [transacao] = await db
    .update(transacoes)
    .set({ ...dados, atualizadoEm: new Date() })
    .where(eq(transacoes.id, id))
    .returning();
  return transacao;
}

export async function deletarTransacao(id: number): Promise<boolean> {
  const resultado = await db
    .delete(transacoes)
    .where(eq(transacoes.id, id));
  return !!resultado;
}

// ===== METAS =====

export async function criarMeta(dados: NovaMeta): Promise<Meta> {
  const [meta] = await db.insert(metas).values(dados).returning();
  return meta;
}

export async function listarMetas(usuarioId: number): Promise<Meta[]> {
  return db
    .select()
    .from(metas)
    .where(eq(metas.usuarioId, usuarioId))
    .orderBy(desc(metas.criadoEm));
}

export async function obterMetaPorId(id: number): Promise<Meta | null> {
  const [meta] = await db
    .select()
    .from(metas)
    .where(eq(metas.id, id));
  return meta || null;
}

export async function atualizarMeta(
  id: number,
  dados: Partial<NovaMeta>
): Promise<Meta> {
  const [meta] = await db
    .update(metas)
    .set({ ...dados, atualizadoEm: new Date() })
    .where(eq(metas.id, id))
    .returning();
  return meta;
}

export async function deletarMeta(id: number): Promise<boolean> {
  const resultado = await db
    .delete(metas)
    .where(eq(metas.id, id));
  return !!resultado;
}

// ===== NOTIFICAÇÕES =====

export async function criarNotificacao(
  dados: NovaNotificacao
): Promise<Notificacao> {
  const [notificacao] = await db
    .insert(notificacoes)
    .values(dados)
    .returning();
  return notificacao;
}

export async function listarNotificacoes(usuarioId: number): Promise<Notificacao[]> {
  return db
    .select()
    .from(notificacoes)
    .where(eq(notificacoes.usuarioId, usuarioId))
    .orderBy(desc(notificacoes.criadoEm));
}

export async function marcarNotificacaoComoLida(id: number): Promise<Notificacao> {
  const [notificacao] = await db
    .update(notificacoes)
    .set({ lida: true })
    .where(eq(notificacoes.id, id))
    .returning();
  return notificacao;
}

export async function deletarNotificacao(id: number): Promise<boolean> {
  const resultado = await db
    .delete(notificacoes)
    .where(eq(notificacoes.id, id));
  return !!resultado;
}
