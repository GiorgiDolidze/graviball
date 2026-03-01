// server/src/game/physics.js
// Authoritative physics + push logic.

const GRAVITY = 420; // was 520

const PUSH_RADIUS = 72; // was 52
const BASE_PUSH_FORCE = 900; // was 520
const PUSHING_FORCE_MULTIPLIER = 3.2; // was 2.2 (active push should feel strong)

const DOWNWARD_MULTIPLIER = 0.95; // was 0.65 (don't punish pushing from below much)

const ABYSS_CONFIRM_DELAY = 0.8; // seconds

const MAX_FALL_SPEED = 820; // was 950
const AIR_DRAG = 0.65; // was 0.85 (less drag loss so pushes translate better)

// Extra upward lift while actively pushing near the ball.
// This is the “you can actually keep it up” component.
const PUSH_LIFT = 680; // px/sec^2 upward bonus (applied only when pushing and close)

export function stepPhysics(state, dt) {
  const { ball, players, world } = state;

  if (!dt || dt <= 0) return;

  // --- Gravity ---
  ball.vy += GRAVITY * dt;

  // --- Player push forces ---
  for (const [, player] of players) {
    if (!Number.isFinite(player?.x) || !Number.isFinite(player?.y)) continue;

    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const distSq = dx * dx + dy * dy;

    const radius = PUSH_RADIUS + ball.r;
    const radiusSq = radius * radius;

    if (distSq < radiusSq && distSq > 0.000001) {
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;

      // Backward compatible:
      // - old clients: pushing undefined -> treated as true (push works)
      // - new clients: pushing true only when pointer is down
      const pushing = player.pushing === undefined ? true : !!player.pushing;

      // Closeness 0..1
      const closeness = 1 - dist / radius;

      // Base force with falloff
      let force = BASE_PUSH_FORCE * (0.25 + 0.75 * closeness);

      // Active push is much stronger
      if (pushing) force *= PUSHING_FORCE_MULTIPLIER;
      else force *= 0.65;

      // If cursor is below the ball, don't kill the force—just reduce a little.
      if (ny > 0) force *= DOWNWARD_MULTIPLIER;

      ball.vx += nx * force * dt;
      ball.vy += ny * force * dt;

      // Bonus lift when actively pushing and close enough:
      // This is what makes “holding” actually fight gravity.
      if (pushing) {
        const lift = PUSH_LIFT * (0.2 + 0.8 * closeness); // stronger when closer
        ball.vy -= lift * dt; // subtract = upward
      }
    }
  }

  // --- Air drag (dt-scaled) ---
  const drag = Math.max(0, 1 - AIR_DRAG * dt);
  ball.vx *= drag;
  ball.vy *= drag;

  // --- Clamp speed ---
  if (ball.vy > MAX_FALL_SPEED) ball.vy = MAX_FALL_SPEED;
  if (ball.vy < -MAX_FALL_SPEED) ball.vy = -MAX_FALL_SPEED;

  // --- Integrate ---
  ball.x += ball.vx * dt;
  ball.y += ball.vy * dt;

  // --- Walls ---
  if (ball.x - ball.r < 0) {
    ball.x = ball.r;
    ball.vx *= -0.6;
  }
  if (ball.x + ball.r > world.width) {
    ball.x = world.width - ball.r;
    ball.vx *= -0.6;
  }

  // --- Danger zone bias (lighter) ---
  const dangerStart = world.height * 0.8;
  if (ball.y > dangerStart) {
    ball.vy -= 170 * dt;
  }

  // --- Abyss check ---
  if (ball.y - ball.r > world.abyssY) {
    if (!state.lastBelowAbyssAt) {
      state.lastBelowAbyssAt = state.sessionTime;
    } else if (state.sessionTime - state.lastBelowAbyssAt > ABYSS_CONFIRM_DELAY) {
      resetBall(state);
    }
  } else {
    state.lastBelowAbyssAt = null;
  }

  state.sessionTime += dt;
}

function resetBall(state) {
  const { ball, world } = state;

  const current = typeof state.sessionTime === "number" ? state.sessionTime : 0;
  const best = typeof state.bestTime === "number" ? state.bestTime : 0;
  state.bestTime = Math.max(best, current);

  ball.x = world.width / 2;
  ball.y = world.height / 3;
  ball.vx = 0;
  ball.vy = 0;

  state.sessionTime = 0;
  state.lastBelowAbyssAt = null;
}
