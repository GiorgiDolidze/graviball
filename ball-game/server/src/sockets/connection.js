// server/src/sockets/connection.js
// Handles a single websocket connection lifecycle.

import { createHandlers } from "./handlers.js";
import { logger } from "../utils/logger.js";

function randomId() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

export function createConnectionHandler({ ws, req, sessionManager }) {
  const id = randomId();
  const handlers = createHandlers({ id, ws, sessionManager });

  function attach() {
    sessionManager.addConnection(id, ws);
    handlers.sendConnected();

    ws.on("message", (message) => {
      handlers.onMessage(message);
    });

    ws.on("close", () => {
      sessionManager.removeConnection(id);
      handlers.onDisconnect();
      logger.info(`Client disconnected: ${id}`);
    });

    ws.on("error", (err) => {
      logger.warn(`WS error for ${id}: ${err?.message || err}`);
    });

    logger.info(`Client connected: ${id}`);
  }

  return { id, attach };
}
