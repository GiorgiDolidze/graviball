// shared/events.js
// Canonical event names shared between client and server.

export const EVENTS = {
  // Client -> Server
  CURSOR_MOVE: "cursor_move",

  // Server -> Client
  CONNECTED: "connected",
  STATE_SNAPSHOT: "state_snapshot",
  SESSION_TIME: "session_time"
};
