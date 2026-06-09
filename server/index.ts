import express from "express";
import { createServer } from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { testConnection } from "./db";

const __filename = fileURLToPath(import.meta.url );
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const port = process.env.PORT || 5000;

  // DIRETÓRIO ESTÁTICO
  const staticPath = process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // CONFIGURAÇÃO DE CORS (Liberado para as duas portas comuns)
  app.use(cors({
    origin: ["http://localhost:5173", "http://localhost:3000"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "x-usuario-id"],
  } ));

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // BANCO DE DADOS
  await testConnection();

  // ROTAS - IMPORTANTE: Aqui usamos apenas o router, pois o seu routes.ts já tem o "/api"
  app.use(router);

  // FRONTEND
  app.use(express.static(staticPath));
  app.get("*", (req, res) => {
    // Se for uma chamada de API que não existe, retorna 404 em JSON
    if (req.path.startsWith('/api')) return res.status(404).json({ error: "Rota não encontrada" });
    // Senão, tenta entregar o index.html
    res.sendFile(path.join(staticPath, "index.html"), (err) => {
      if (err) res.status(200).send("Servidor API Ativo na porta 5000. Use a porta 5173 para o Frontend.");
    });
  });

  const server = createServer(app);
  server.listen(port, () => {
    console.log(`✅ Servidor rodando em http://localhost:${port}` );
  });
}

startServer().catch(console.error);
