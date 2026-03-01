// server/src/game/sessionManager.js
// Manages single global session (no rooms, no accounts).

import { createGameEngine } from "./gameEngine.js";
import { createBroadcaster } from "../sockets/broadcaster.js";

export function createSessionManager() {
  const connections = new Map(); // id -> ws

  const broadcaster = createBroadcaster({
    connections
  });

  const engine = createGameEngine({
    broadcaster
  });

  engine.start();

  function addConnection(id, ws) {
    connections.set(id, ws);
  }

  function removeConnection(id) {
    connections.delete(id);
  }

  function getConnections() {
    return connections;
  }

  function getState() {
    return engine.state;
  }

  return {
    addConnection,
    removeConnection,
    getConnections,
    getState
  };
}
