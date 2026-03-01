// server/src/game/gameState.js
// Holds authoritative world state.

export function createGameState() {
  const width = 800;
  const height = 600;

  return {
    world: {
      width,
      height,
      abyssY: height * 0.8
    },

    ball: {
      x: width / 2,
      y: height / 3,
      r: 18,
      vx: 0,
      vy: 0
    },

    players: new Map(), // id -> { x, y }

    sessionTime: 0,
    lastBelowAbyssAt: null
  };
}
