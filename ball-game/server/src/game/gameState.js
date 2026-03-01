// server/src/game/gameState.js
// Authoritative server game state.

export function createGameState() {
  const WORLD_WIDTH = 800;
  const WORLD_HEIGHT = 600;

  const state = {
    world: {
      width: WORLD_WIDTH,
      height: WORLD_HEIGHT,
      abyssY: WORLD_HEIGHT - 40
    },

    ball: {
      x: WORLD_WIDTH / 2,
      y: WORLD_HEIGHT / 3,
      r: 18,
      vx: 0,
      vy: 0
    },

    players: new Map(),

    sessionTime: 0,

    // ✅ NEW: record time (seconds)
    bestTime: 0
  };

  return state;
}
