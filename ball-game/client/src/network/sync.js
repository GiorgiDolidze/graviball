// client/src/network/sync.js
// Handles syncing server snapshots into client state.

import { SERVER_EVENTS } from "./events.js";
import { interpolateBall } from "../core/physics.js";

export function handleServerMessage(state, data) {
  const { type, payload } = data;

  switch (type) {
    case SERVER_EVENTS.CONNECTED:
      state.setConnected(true);
      break;

    case SERVER_EVENTS.STATE_SNAPSHOT:
      // NEW: authoritative world size (for responsive scaling)
      if (payload.world && typeof payload.world === "object") {
        state.setWorld(payload.world);
      }

      if (payload.ball) {
        state.setServerBall(payload.ball);
      }

      if (payload.cursors) {
        state.setCursors(payload.cursors);
      }

      // Back-compat: some servers may still send abyssY at top-level
      if (typeof payload.abyssY === "number") {
        state.setAbyssY(payload.abyssY);
      }

      // NEW: record/best time (seconds)
      if (typeof payload.bestTime === "number") {
        state.updateBestTime(payload.bestTime);
      }

      break;

    case SERVER_EVENTS.SESSION_TIME:
      if (typeof payload.time === "number") {
        state.updateSessionTime(payload.time);
      }
      break;

    default:
      break;
  }
}

// Call inside your update loop to smoothly move toward latest snapshot
export function applyInterpolation(state, alpha = 0.15) {
  if (!state.serverBall) return;

  state.ball = interpolateBall(state.ball, state.serverBall, alpha);
}
