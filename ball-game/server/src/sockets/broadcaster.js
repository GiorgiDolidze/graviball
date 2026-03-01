// server/src/sockets/broadcaster.js
// Broadcasts authoritative state to all connected clients.

export function createBroadcaster({ connections }) {
  function broadcastState(state) {
    const snapshot = buildSnapshot(state);

    const message = JSON.stringify({
      type: "state_snapshot",
      payload: snapshot
    });

    for (const [, ws] of connections) {
      if (ws.readyState === ws.OPEN) {
        ws.send(message);
      }
    }

    // Send session time separately (lightweight)
    const timeMessage = JSON.stringify({
      type: "session_time",
      payload: { time: state.sessionTime }
    });

    for (const [, ws] of connections) {
      if (ws.readyState === ws.OPEN) {
        ws.send(timeMessage);
      }
    }
  }

  function buildSnapshot(state) {
    const cursors = [];

    for (const [, player] of state.players) {
      cursors.push({
        x: player.x,
        y: player.y
      });
    }

    return {
      // ✅ authoritative world size for responsive scaling
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

      // ✅ backward compatibility (older clients might read this)
      abyssY: state.world.abyssY,

      // ✅ record time (seconds)
      bestTime: typeof state.bestTime === "number" ? state.bestTime : 0
    };
  }

  return {
    broadcastState
  };
}
