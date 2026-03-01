// server/src/sockets/handlers.js
// Handles incoming/outgoing socket messages per client.

import { logger } from "../utils/logger.js";

export function createHandlers({ id, ws, sessionManager }) {
  const state = sessionManager.getState();

  function send(type, payload = {}) {
    if (ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify({ type, payload }));
    }
  }

  function sendConnected() {
    send("connected", { id });
  }

  function onMessage(raw) {
    try {
      const data = JSON.parse(raw.toString());
      const { type, payload } = data;

      switch (type) {
        case "cursor_move":
          handleCursorMove(payload);
          break;
        default:
          break;
      }
    } catch (err) {
      logger.warn(`Invalid message from ${id}`);
    }
  }

  function handleCursorMove(payload) {
    const { x, y } = payload || {};
    if (typeof x !== "number" || typeof y !== "number") return;

    state.players.set(id, { x, y });
  }

  function onDisconnect() {
    state.players.delete(id);
  }

  return {
    sendConnected,
    onMessage,
    onDisconnect
  };
}
