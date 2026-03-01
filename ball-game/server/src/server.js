// server/src/server.js
// HTTP + WebSocket server entry (Render).
import http from "http";
import express from "express";
import { WebSocketServer } from "ws";

import { createSessionManager } from "./game/sessionManager.js";
import { createConnectionHandler } from "./sockets/connection.js";
import { logger } from "./utils/logger.js";

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

// Basic health endpoint for Render / uptime checks
app.get("/health", (_req, res) => {
  res.status(200).json({ ok: true });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Global session (one world)
const sessionManager = createSessionManager();

wss.on("connection", (ws, req) => {
  const handler = createConnectionHandler({
    ws,
    req,
    sessionManager
  });

  handler.attach();
});

server.listen(PORT, () => {
  logger.info(`Graviball server listening on :${PORT}`);
});

// Graceful shutdown (best effort)
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down...");
  try {
    wss.clients.forEach((client) => {
      try { client.close(); } catch {}
    });
    server.close(() => process.exit(0));
  } catch {
    process.exit(0);
  }
});
