// server/src/game/gameEngine.js
// Authoritative game loop + physics stepping.

import { createGameState } from "./gameState.js";
import { stepPhysics } from "./physics.js";

const TICK_RATE = 60;
const BROADCAST_RATE = 30;

export function createGameEngine({ broadcaster }) {
  const state = createGameState();

  let lastTick = Date.now();
  let accumulator = 0;

  const tickInterval = 1000 / TICK_RATE;
  const broadcastInterval = 1000 / BROADCAST_RATE;
  let lastBroadcast = Date.now();

  function update() {
    const now = Date.now();
    const delta = now - lastTick;
    lastTick = now;

    accumulator += delta;

    while (accumulator >= tickInterval) {
      stepPhysics(state, tickInterval / 1000);
      accumulator -= tickInterval;
    }

    if (now - lastBroadcast >= broadcastInterval) {
      broadcaster.broadcastState(state);
      lastBroadcast = now;
    }

    setImmediate(update);
  }

  function start() {
    update();
  }

  return {
    state,
    start
  };
}
