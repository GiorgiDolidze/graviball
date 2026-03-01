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

        case "push_start":
          handlePushStart(payload);
          break;

        case "push_end":
          handlePushEnd(payload);
          break;

        default:
          break;
      }
    } catch (err) {
      logger.warn(`Invalid message from ${id}`);
    }
  }

  function getOrCreatePlayer() {
    const existing = state.players.get(id);
    if (existing) return existing;

    const fresh = { x: 0, y: 0, pushing: false };
    state.players.set(id, fresh);
    return fresh;
  }

  function handleCursorMove(payload) {
    const { x, y } = payload || {};
    if (typeof x !== "number" || typeof y !== "number") return;

    const player = getOrCreatePlayer();
    player.x = x;
    player.y = y;

    // IMPORTANT: do not overwrite player object, keep pushing state
    state.players.set(id, player);
  }

  function handlePushStart(payload) {
    const player = getOrCreatePlayer();
    player.pushing = true;

    // Optional: allow push_start to also include x/y for taps without movement
    const { x, y } = payload || {};
    if (typeof x === "number") player.x = x;
    if (typeof y === "number") player.y = y;

    state.players.set(id, player);
  }

  function handlePushEnd(payload) {
    const player = getOrCreatePlayer();
    player.pushing = false;

    // Optional: allow push_end to include last x/y
    const { x, y } = payload || {};
    if (typeof x === "number") player.x = x;
    if (typeof y === "number") player.y = y;

    state.players.set(id, player);
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
