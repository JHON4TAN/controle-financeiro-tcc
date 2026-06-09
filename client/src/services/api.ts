// URL base da API
// Como o frontend é servido pelo próprio Express,
// caminhos relativos já funcionam corretamente
const API_BASE_URL = "http://localhost:5000";

// Função responsável por montar os headers das requisições
// Inclui automaticamente o ID do usuário logado
const getHeaders = () => {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Verifica se existe usuário salvo no localStorage
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
  // Realiza login do usuário
  login: async (dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    // Verifica se ocorreu erro na autenticação
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao fazer login");
    }
    return response.json();
  },

  // Realiza cadastro de novo usuário
  register: async (dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });
    // Verifica se ocorreu erro no cadastro
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Erro ao cadastrar");
    }
    return response.json();
  },
};

// ===== USUÁRIOS =====

export const usuarioAPI = {
  // Exclui permanentemente a conta do usuário
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
  // Lista todas as transações do usuário
  listar: async () => {
    const response = await fetch(`${API_BASE_URL}/api/transacoes`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao listar transações");
    return response.json();
  },

   // Cria uma nova transação financeira
  criar: async (dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/transacoes`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Erro ao criar transação");
    return response.json();
  },

  // Atualiza uma transação existente
  atualizar: async (id: number, dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/transacoes/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Erro ao atualizar transação");
    return response.json();
  },

  // Remove uma transação
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
  // Lista todas as categorias cadastradas
  listar: async () => {
    const response = await fetch(`${API_BASE_URL}/api/categorias`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao listar categorias");
    return response.json();
  },

  criar: async (dados: any) => {
    // Cria uma nova categoria
    const response = await fetch(`${API_BASE_URL}/api/categorias`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Erro ao criar categoria");
    return response.json();
  },

  // Atualiza uma categoria existente
  atualizar: async (id: number, dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/categorias/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Erro ao atualizar categoria");
    return response.json();
  },

  // Exclui uma categoria
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
  // Lista todas as metas financeiras
  listar: async () => {
    const response = await fetch(`${API_BASE_URL}/api/metas`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao listar metas");
    return response.json();
  },

  // Cria uma nova meta financeira
  criar: async (dados: any) => {
    const response = await fetch(`${API_BASE_URL}/api/metas`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify(dados),
    });
    if (!response.ok) throw new Error("Erro ao criar meta");
    return response.json();
  },

  // Remove uma meta financeira
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
  // Lista todas as notificações do usuário
  listar: async () => {
    const response = await fetch(`${API_BASE_URL}/api/notificacoes`, {
      headers: getHeaders(),
    });
    if (!response.ok) throw new Error("Erro ao listar notificações");
    return response.json();
  },

  // Marca uma notificação como lida
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
