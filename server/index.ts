import express from "express";
import { createServer } from "http";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import router from "./routes";
import { testConnection } from "./db";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();

  // =========================
  // 🔥 STATIC PATH PRIMEIRO
  // =========================
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  // =========================
  // 🔥 CORS CONFIG
  // =========================
  app.use(
    cors({
      origin: "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      allowedHeaders: ["Content-Type", "x-usuario-id"],
    })
  );

  // Preflight
  app.options("*", cors());

  // =========================
  // 🔥 MIDDLEWARE JSON
  // =========================
  app.use(express.json());

  // =========================
  // 🔥 TESTE BANCO
  // =========================
  await testConnection();

  // =========================
  // 🔥 API ROUTES
  // =========================
  app.use("/api", router);

  // =========================
  // 🔥 STATIC FRONTEND
  // =========================
  app.use(express.static(staticPath));

  // =========================
  // 🔥 FALLBACK FRONTEND
  // =========================
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  const server = createServer(app);
  const port = process.env.PORT || 5000;

  // Testar conexão com o banco
  await testConnection();

  // Middlewares
  app.use(express.json());

  // Rotas da API
  app.use(router);

  app.use(express.static(staticPath));

  app.use(express.json({ limit: "10mb" }));
  app.use(express.urlencoded({ extended: true, limit: "10mb" }));

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
