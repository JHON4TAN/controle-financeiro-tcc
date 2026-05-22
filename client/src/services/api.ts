/**
 * Serviço de API para comunicação com o backend
 * Centraliza todas as chamadas HTTP para transações, categorias, metas e notificações
 */

const API_BASE_URL = ""; // Usar caminhos relativos já que o Express serve o front

const getHeaders = () => {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (usuarioLogado) {
    const usuario = JSON.parse(usuarioLogado);
    if (usuario && usuario.id) {
      headers["x-usuario-id"] = usuario.id.toString();
    }
  }

  return headers;
};

// ===== AUTENTICAÇÃO =====

export const authAPI = {
  login: async (dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao fazer login");
    }
    return response.json();
  },

  register: async (dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao cadastrar");
    }
    return response.json();
  },
};


export const usuarioAPI = {
  deletar: async (id: number) => {
    const response = await fetch(
      `${API_BASE_URL}/api/usuarios/${id}`,
      {
        method: "DELETE",
        headers: getHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error("Erro ao excluir conta");
    }

    return response.json();
  },
};

// ===== TRANSAÇÕES =====

export const transacaoAPI = {
  listar: async () => {
    const response = await fetch(`${API_BASE_URL}/api/transacoes`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao listar transações");
    return response.json();
  },

  criar: async (dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/transacoes`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Erro ao criar transação");
    return response.json();
  },

  atualizar: async (id: number, dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/transacoes/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Erro ao atualizar transação");
    return response.json();
  },

  deletar: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/transacoes/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao deletar transação");
    return response.json();
  },
};

// ===== CATEGORIAS =====

export const categoriaAPI = {
  listar: async () => {
    const response = await fetch(`${API_BASE_URL}/api/categorias`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao listar categorias");
    return response.json();
  },

  criar: async (dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/categorias`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Erro ao criar categoria");
    return response.json();
  },

  atualizar: async (id: number, dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/categorias/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Erro ao atualizar categoria");
    return response.json();
  },

  deletar: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/categorias/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao deletar categoria");
    return response.json();
  },
};

// ===== METAS =====

export const metaAPI = {
  listar: async () => {
    const response = await fetch(`${API_BASE_URL}/api/metas`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao listar metas");
    return response.json();
  },

  criar: async (dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/metas`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Erro ao criar meta");
    return response.json();
  },

  deletar: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/metas/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao deletar meta");
    return response.json();
  },
};

// ===== NOTIFICAÇÕES =====

export const notificacaoAPI = {
  listar: async () => {
    const response = await fetch(`${API_BASE_URL}/api/notificacoes`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao listar notificações");
    return response.json();
  },

  marcarComoLida: async (id: number) => {
    const response = await fetch(
      `${API_BASE_URL}/api/notificacoes/${id}/lida`,
      {
        method: "PUT",
        headers: getHeaders(),
      }
    );
    if (!response.ok) throw new Error("Erro ao marcar notificação como lida");
    return response.json();
  },
};
