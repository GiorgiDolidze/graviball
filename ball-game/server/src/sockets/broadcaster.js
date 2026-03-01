// server/src/sockets/broadcaster.js
// Broadcasts authoritative state to all connected clients.

function isSocketOpen(ws) {
  // ws library uses readyState === 1 for OPEN reliably
  return ws && ws.readyState === 1;
}

export function createBroadcaster({ connections }) {
  function broadcastState(state) {
    const snapshot = buildSnapshot(state);

    const message = JSON.stringify({
      type: "state_snapshot",
      payload: snapshot
    });

    for (const [, ws] of connections) {
      if (isSocketOpen(ws)) ws.send(message);
    }

    // Send session time separately (lightweight)
    const timeMessage = JSON.stringify({
      type: "session_time",
      payload: { time: state.sessionTime }
    });

    for (const [, ws] of connections) {
      if (isSocketOpen(ws)) ws.send(timeMessage);
    }
  }

  function buildSnapshot(state) {
    const cursors = [];

    for (const [, player] of state.players) {
      // only broadcast valid numbers
      if (!Number.isFinite(player.x) || !Number.isFinite(player.y)) continue;
      cursors.push({ x: player.x, y: player.y });
    }

    return {
      world: {
        width: state.world.width,
        height: state.world.height,
        abyssY: state.world.abyssY
      },

      ball: {
        x: state.ball.x,
        y: state.ball.y,
        r: state.ball.r,
        vx: state.ball.vx,
        vy: state.ball.vy
      },

      cursors,

      abyssY: state.world.abyssY,

      bestTime: typeof state.bestTime === "number" ? state.bestTime : 0
    };
  }

  return { broadcastState };
}
