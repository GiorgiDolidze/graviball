// server/src/game/physics.js
// Authoritative physics + push logic.

const GRAVITY = 900; // px/sec^2
const PUSH_RADIUS = 14;
const MAX_PUSH_FORCE = 600;
const DOWNWARD_MULTIPLIER = 0.4;
const ABYSS_CONFIRM_DELAY = 0.8; // seconds

export function stepPhysics(state, dt) {
  const { ball, players, world } = state;

  // --- Apply gravity ---
  ball.vy += GRAVITY * dt;

  // --- Player push forces ---
  for (const [, player] of players) {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < PUSH_RADIUS + ball.r && dist > 0) {
      const nx = dx / dist;
      const ny = dy / dist;

      let force = MAX_PUSH_FORCE;

      // Downward dampening
      if (ny > 0) {
        force *= DOWNWARD_MULTIPLIER;
      }

      ball.vx += nx * force * dt;
      ball.vy += ny * force * dt;
    }
  }

  // --- Integrate ---
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // --- Simple bounds (left/right walls) ---
  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.vx *= -0.6;
  }
  if (ball.x + ball.r > world.width) {
    ball.x = world.width - ball.r;
    ball.vx *= -0.6;
  }

  // --- Danger zone bias ---
  const dangerStart = world.height * 0.8;
  if (ball.y > dangerStart) {
    ball.vy -= 300 * dt; // gentle upward bias
  }

  // --- Abyss check ---
  if (ball.y - ball.r > world.abyssY) {
    if (!state.lastBelowAbyssAt) {
      state.lastBelowAbyssAt = state.sessionTime;
    } else if (
      state.sessionTime - state.lastBelowAbyssAt > ABYSS_CONFIRM_DELAY
    ) {
      resetBall(state);
    }
  } else {
    state.lastBelowAbyssAt = null;
  }

  // --- Session time ---
  state.sessionTime += dt;
}

function resetBall(state) {
  const { ball, world } = state;

  ball.x = world.width / 2;
  ball.y = world.height / 3;
  ball.vx = 0;
  ball.vy = 0;

  state.sessionTime = 0;
  state.lastBelowAbyssAt = null;
}
