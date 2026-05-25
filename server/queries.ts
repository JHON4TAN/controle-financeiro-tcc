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

// Cria um novo usuário no banco de dados
export async function criarUsuario(dados: NovoUsuario): Promise<Usuario> {
  const [usuario] = await db.insert(usuarios).values(dados).returning();
  return usuario;
}

// Busca usuário pelo e-mail para autenticação
export async function obterUsuarioPorEmail(email: string): Promise<Usuario | null> {
  const [usuario] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.email, email));
  return usuario || null;
}

// Busca um usuário através do ID
export async function obterUsuarioPorId(id: number): Promise<Usuario | null> {
  const [usuario] = await db
    .select()
    .from(usuarios)
    .where(eq(usuarios.id, id));
  return usuario || null;
}

// Atualiza os dados do usuário
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

// Remove usuário e seus dados relacionados
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

// Cria uma nova categoria personalizada
export async function criarCategoria(dados: NovaCategoria): Promise<Categoria> {
  const [categoria] = await db.insert(categorias).values(dados).returning();
  return categoria;
}

// Lista todas as categorias cadastradas pelo usuário
export async function listarCategorias(usuarioId: number): Promise<Categoria[]> {
  return db
    .select()
    .from(categorias)
    .where(eq(categorias.usuarioId, usuarioId))
    .orderBy(desc(categorias.criadoEm));
}

// Busca categoria através do ID
export async function obterCategoriaPorId(id: number): Promise<Categoria | null> {
  const [categoria] = await db
    .select()
    .from(categorias)
    .where(eq(categorias.id, id));
  return categoria || null;
}

// Atualiza as informações da categoria
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

// Remove categoria do sistema
export async function deletarCategoria(id: number): Promise<boolean> {
  const resultado = await db
    .delete(categorias)
    .where(eq(categorias.id, id));
  return !!resultado;
}

// ===== TRANSAÇÕES =====

// Registra uma nova transação financeira
export async function criarTransacao(dados: NovaTransacao): Promise<Transacao> {
  const [transacao] = await db.insert(transacoes).values(dados).returning();
  return transacao;
}

// Lista todas as transações do usuário ordenadas por data
export async function listarTransacoes(usuarioId: number): Promise<Transacao[]> {
  return db
    .select()
    .from(transacoes)
    .where(eq(transacoes.usuarioId, usuarioId))
    .orderBy(desc(transacoes.data));
}

// Filtra transações por período específico
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

// Busca transação pelo ID
export async function obterTransacaoPorId(id: number): Promise<Transacao | null> {
  const [transacao] = await db
    .select()
    .from(transacoes)
    .where(eq(transacoes.id, id));
  return transacao || null;
}

// Atualiza os dados de uma transação financeira
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

// Remove transação financeira do sistema
export async function deletarTransacao(id: number): Promise<boolean> {
  const resultado = await db
    .delete(transacoes)
    .where(eq(transacoes.id, id));
  return !!resultado;
}

// ===== METAS =====

// Cria uma nova meta financeira
export async function criarMeta(dados: NovaMeta): Promise<Meta> {
  const [meta] = await db.insert(metas).values(dados).returning();
  return meta;
}

// Lista metas cadastradas pelo usuário
export async function listarMetas(usuarioId: number): Promise<Meta[]> {
  return db
    .select()
    .from(metas)
    .where(eq(metas.usuarioId, usuarioId))
    .orderBy(desc(metas.criadoEm));
}

// Busca meta financeira através do ID
export async function obterMetaPorId(id: number): Promise<Meta | null> {
  const [meta] = await db
    .select()
    .from(metas)
    .where(eq(metas.id, id));
  return meta || null;
}

// Atualiza informações da meta financeira
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

// Remove meta financeira cadastrada
export async function deletarMeta(id: number): Promise<boolean> {
  const resultado = await db
    .delete(metas)
    .where(eq(metas.id, id));
  return !!resultado;
}

// ===== NOTIFICAÇÕES =====

// Cria uma nova notificação para o usuário
export async function criarNotificacao(
  dados: NovaNotificacao
): Promise<Notificacao> {
  const [notificacao] = await db
    .insert(notificacoes)
    .values(dados)
    .returning();
  return notificacao;
}

// Lista notificações do usuário
export async function listarNotificacoes(usuarioId: number): Promise<Notificacao[]> {
  return db
    .select()
    .from(notificacoes)
    .where(eq(notificacoes.usuarioId, usuarioId))
    .orderBy(desc(notificacoes.criadoEm));
}

// Marca notificação como visualizada
export async function marcarNotificacaoComoLida(id: number): Promise<Notificacao> {
  const [notificacao] = await db
    .update(notificacoes)
    .set({ lida: true })
    .where(eq(notificacoes.id, id))
    .returning();
  return notificacao;
}

// Remove notificação do sistema
export async function deletarNotificacao(id: number): Promise<boolean> {
  const resultado = await db
    .delete(notificacoes)
    .where(eq(notificacoes.id, id));
  return !!resultado;
}
