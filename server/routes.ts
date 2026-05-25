import express from "express";
import { Router } from "express";
import * as queries from "./queries";
import multer from "multer";
import path from "path";

const router = Router();

// Obtém o ID do usuário através do header da requisição
const obterUsuarioId = (req: any) => {
  
  return req.headers["x-usuario-id"] ? parseInt(req.headers["x-usuario-id"]) : null;
};

// Configuração do upload de imagens
const upload = multer({
  dest: "uploads/",
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Disponibiliza a pasta de uploads publicamente
router.use("/uploads", express.static("uploads"))

// ===== AUTENTICAÇÃO =====

// Cadastro de usuário

router.post("/api/register", async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    
    // Verifica se o e-mail já existe
    const usuarioExistente = await queries.obterUsuarioPorEmail(email);
    if (usuarioExistente) {
      return res.status(400).json({ error: "Email já cadastrado" });
    }

// Cria novo usuário
    const usuario = await queries.criarUsuario({
      nome,
      email,
      senha, 
    });

    res.status(201).json(usuario);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Login do usuário
router.post("/api/login", async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await queries.obterUsuarioPorEmail(email);

    // Validação das credenciais
    if (!usuario || usuario.senha !== senha) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    res.json(usuario);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== TRANSAÇÕES =====

// Listar todas as transações do usuário
router.get("/api/transacoes", async (req, res) => {
  try {
    const usuarioId = obterUsuarioId(req);
    if (!usuarioId) return res.status(401).json({ error: "Não autorizado" });
    const transacoes = await queries.listarTransacoes(usuarioId);
    res.json(transacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cria nova transação financeira
router.post("/api/transacoes", async (req, res) => {
  try {
    const usuarioId = obterUsuarioId(req);

    if (!usuarioId) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const { descricao, valor, data, tipo, categoriaId } = req.body;

    // Salva transação no banco
    const transacao = await queries.criarTransacao({
      usuarioId,
      descricao,
      valor,
      data: new Date(data),
      tipo,
      categoriaId,
    });

     // Cria notificação automática
    await queries.criarNotificacao({
      usuarioId,
      texto: `Nova transação adicionada: ${descricao}`,
      tipo: "info",
    });

    res.status(201).json(transacao);

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Atualiza transação existente
router.put("/api/transacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, data, tipo, categoriaId } = req.body;

    const transacao = await queries.atualizarTransacao(parseInt(id), {
      descricao,
      valor,
      data: new Date(data),
      tipo,
      categoriaId,
    });

    res.json(transacao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove transação financeira
router.delete("/api/transacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sucesso = await queries.deletarTransacao(parseInt(id));

    if (sucesso) {
      res.json({ success: true, id: parseInt(id) });
    } else {
      res.status(404).json({ error: "Transação não encontrada" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== CATEGORIAS =====

// Lista todas as categorias do usuário
router.get("/api/categorias", async (req, res) => {
  try {
    const usuarioId = obterUsuarioId(req);
    if (!usuarioId) return res.status(401).json({ error: "Não autorizado" });
    const categorias = await queries.listarCategorias(usuarioId);
    res.json(categorias);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Cria nova categoria
router.post("/api/categorias", async (req, res) => {
  try {
    const usuarioId = obterUsuarioId(req);
    if (!usuarioId) return res.status(401).json({ error: "Não autorizado" });
    const { nome, tipo, cor, icone } = req.body;

    const categoria = await queries.criarCategoria({
      usuarioId,
      nome,
      tipo,
      cor,
      icone,
    });

    res.status(201).json(categoria);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Atualiza categoria
router.put("/api/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { nome, tipo, cor, icone } = req.body;

    const categoria = await queries.atualizarCategoria(parseInt(id), {
      nome,
      tipo,
      cor,
      icone,
    });

    res.json(categoria);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Deleta categoria
router.delete("/api/categorias/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sucesso = await queries.deletarCategoria(parseInt(id));

    if (sucesso) {
      res.json({ success: true, id: parseInt(id) });
    } else {
      res.status(404).json({ error: "Categoria não encontrada" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// ===== METAS =====

// Listar todas as metas do usuário
router.get("/api/metas", async (req, res) => {
  try {
    const usuarioId = obterUsuarioId(req);
    if (!usuarioId) return res.status(401).json({ error: "Não autorizado" });
    const metas = await queries.listarMetas(usuarioId);
    res.json(metas);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Criar nova meta financeira
router.post("/api/metas", async (req, res) => {
  try {
    const usuarioId = obterUsuarioId(req);

    if (!usuarioId) {
      return res.status(401).json({ error: "Não autorizado" });
    }

    const { descricao, valor, mes, ano, tipo } = req.body;

    const meta = await queries.criarMeta({
      usuarioId,
      descricao,
      valor,
      mes,
      ano,
      tipo,
    });

    // Gera notificação automática
    await queries.criarNotificacao({
      usuarioId,
      texto: `Nova meta criada: ${descricao}`,
      tipo: "info",
    });

    res.status(201).json(meta);

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Remove meta financeira
router.delete("/api/metas/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sucesso = await queries.deletarMeta(parseInt(id));

    if (sucesso) {
      res.json({ success: true, id: parseInt(id) });
    } else {
      res.status(404).json({ error: "Meta não encontrada" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


// ===== PERFIL =====

// Atualiza usuário com upload de foto
router.put(
  "/usuarios/:id",
  upload.single("fotoPerfil"),
  async (req, res) => {
    try {
      const { id } = req.params;

      const usuario = await queries.atualizarUsuario(parseInt(id), {
        nome: req.body.nome,
        email: req.body.email,
        senha: req.body.senha,
        fotoPerfil: req.file
          ? `http://localhost:5000/uploads/${req.file.filename}`
          : null,
      });

      res.json(usuario);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  }
);

// Remove conta do usuário
router.delete("/api/usuarios/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await queries.deletarUsuario(
      parseInt(id)
    );

    res.json({
      success: true,
      usuario,
    });

  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
});

// ===== NOTIFICAÇÕES =====

// Lista todas as notificações do usuário
router.get("/api/notificacoes", async (req, res) => {
  try {
    const usuarioId = obterUsuarioId(req);
    if (!usuarioId) return res.status(401).json({ error: "Não autorizado" });
    const notificacoes = await queries.listarNotificacoes(usuarioId);
    res.json(notificacoes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Marcar notificação como lida
router.put("/api/notificacoes/:id/lida", async (req, res) => {
  try {
    const { id } = req.params;
    const notificacao = await queries.marcarNotificacaoComoLida(parseInt(id));
    res.json(notificacao);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Deleta notificação
router.delete("/api/notificacoes/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const sucesso = await queries.deletarNotificacao(parseInt(id));

    if (sucesso) {
      res.json({ success: true, id: parseInt(id) });
    } else {
      res.status(404).json({ error: "Notificação não encontrada" });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Atualiza informações do perfil
router.put("/api/perfil/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      nome,
      email,
      fotoPerfil
    } = req.body;

    const usuario = await queries.atualizarUsuario(
      parseInt(id),
      {
        nome,
        email,
        fotoPerfil,
      }
    );

    res.json(usuario);

  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
});

// Alteração de senha
router.put("/api/alterar-senha/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const {
      senhaAtual,
      novaSenha
    } = req.body;

    const usuario = await queries.obterUsuarioPorId(
      parseInt(id)
    );

    if (!usuario) {
      return res.status(404).json({
        error: "Usuário não encontrado"
      });
    }

    if (usuario.senha !== senhaAtual) {
      return res.status(400).json({
        error: "Senha atual incorreta"
      });
    }

    const usuarioAtualizado =
      await queries.atualizarUsuario(
        parseInt(id),
        {
          senha: novaSenha
        }
      );

    res.json(usuarioAtualizado);

  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
});

export default router;
