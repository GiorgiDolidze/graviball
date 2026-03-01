// client/src/network/events.js
// Defines client-recognized event types (mirrors shared/events later).

export const CLIENT_EVENTS = {
  CURSOR_MOVE: "cursor_move",
  PUSH_START: "push_start",
  PUSH_END: "push_end"
};

export const SERVER_EVENTS = {
  STATE_SNAPSHOT: "state_snapshot",
  SESSION_TIME: "session_time",
  CONNECTED: "connected"
};
