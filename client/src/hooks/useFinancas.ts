import { useState, useEffect, useCallback } from "react";
import { transacaoAPI, categoriaAPI, metaAPI, notificacaoAPI } from "../services/api";

/**
 * Hook customizado para gerenciar todas as operações financeiras
 * Integra com o backend via API
 */
export function useFinancas() {
  // ===== ESTADO =====
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);
  const [metas, setMetas] = useState<any[]>([]);
  const [notificacoes, setNotificacoes] = useState<any[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // ===== TRANSAÇÕES =====
  const carregarTransacoes = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await transacaoAPI.listar();
      setTransacoes(dados);
      setErro(null);
    } catch (err: any) {
      setErro(err.message);
      console.error("Erro ao carregar transações:", err);
    } finally {
      setCarregando(false);
    }
  }, []);

  const criarTransacao = useCallback(async (dados: any) => {
    try {
      const novaTransacao = await transacaoAPI.criar(dados);
      setTransacoes((prev) => [...prev, novaTransacao]);
      return novaTransacao;
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  }, []);

  const atualizarTransacao = useCallback(async (id: number, dados: any) => {
    try {
      const transacaoAtualizada = await transacaoAPI.atualizar(id, dados);
      setTransacoes((prev) =>
        prev.map((t) => (t.id === id ? transacaoAtualizada : t))
      );
      return transacaoAtualizada;
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  }, []);

  const deletarTransacao = useCallback(async (id: number) => {
    try {
      await transacaoAPI.deletar(id);
      setTransacoes((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  }, []);

  // ===== CATEGORIAS =====
  const carregarCategorias = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await categoriaAPI.listar();
      setCategorias(dados);
      setErro(null);
    } catch (err: any) {
      setErro(err.message);
      console.error("Erro ao carregar categorias:", err);
    } finally {
      setCarregando(false);
    }
  }, []);

  const criarCategoria = useCallback(async (dados: any) => {
    try {
      const novaCategoria = await categoriaAPI.criar(dados);
      setCategorias((prev) => [...prev, novaCategoria]);
      return novaCategoria;
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  }, []);

  const atualizarCategoria = useCallback(async (id: number, dados: any) => {
    try {
      const categoriaAtualizada = await categoriaAPI.atualizar(id, dados);
      setCategorias((prev) =>
        prev.map((c) => (c.id === id ? categoriaAtualizada : c))
      );
      return categoriaAtualizada;
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  }, []);

  const deletarCategoria = useCallback(async (id: number) => {
    try {
      await categoriaAPI.deletar(id);
      setCategorias((prev) => prev.filter((c) => c.id !== id));
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  }, []);

  // ===== METAS =====
  const carregarMetas = useCallback(async () => {
    try {
      setCarregando(true);
      const dados = await metaAPI.listar();
      setMetas(dados);
      setErro(null);
    } catch (err: any) {
      setErro(err.message);
      console.error("Erro ao carregar metas:", err);
    } finally {
      setCarregando(false);
    }
  }, []);

  const criarMeta = useCallback(async (dados: any) => {
    try {
      const novaMeta = await metaAPI.criar(dados);
      setMetas((prev) => [...prev, novaMeta]);
      return novaMeta;
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  }, []);

  const deletarMeta = useCallback(async (id: number) => {
    try {
      await metaAPI.deletar(id);
      setMetas((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  }, []);

  // ===== NOTIFICAÇÕES =====
  const carregarNotificacoes = useCallback(async () => {
    try {
      const dados = await notificacaoAPI.listar();
      setNotificacoes(dados);
      setErro(null);
    } catch (err: any) {
      setErro(err.message);
      console.error("Erro ao carregar notificações:", err);
    }
  }, []);

  const marcarNotificacaoComoLida = useCallback(async (id: number) => {
    try {
      await notificacaoAPI.marcarComoLida(id);
      setNotificacoes((prev) =>
        prev.map((n) => (n.id === id ? { ...n, lida: true } : n))
      );
    } catch (err: any) {
      setErro(err.message);
      throw err;
    }
  }, []);

  // ===== EFEITOS =====
  useEffect(() => {
    carregarTransacoes();
    carregarCategorias();
    carregarMetas();
    carregarNotificacoes();
  }, [
    carregarTransacoes,
    carregarCategorias,
    carregarMetas,
    carregarNotificacoes,
  ]);

  return {
    // Estado
    transacoes,
    categorias,
    metas,
    notificacoes,
    carregando,
    erro,

    // Transações
    carregarTransacoes,
    criarTransacao,
    atualizarTransacao,
    deletarTransacao,

    // Categorias
    carregarCategorias,
    criarCategoria,
    atualizarCategoria,
    deletarCategoria,

    // Metas
    carregarMetas,
    criarMeta,
    deletarMeta,

    // Notificações
    carregarNotificacoes,
    marcarNotificacaoComoLida,
  };
}
