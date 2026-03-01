// server/src/game/physics.js
// Authoritative physics + push logic.

const GRAVITY = 520; // px/sec^2 (was 900)

const PUSH_RADIUS = 52; // was 14 (too tiny to feel responsive)
const BASE_PUSH_FORCE = 520; // baseline “hover/deflect” force
const PUSHING_FORCE_MULTIPLIER = 2.2; // extra force when user is actively pushing (mouse down / touch hold)

const DOWNWARD_MULTIPLIER = 0.65; // was 0.4 (too punishing when cursor is below ball)
const ABYSS_CONFIRM_DELAY = 0.8; // seconds

const MAX_FALL_SPEED = 950; // px/sec cap so game stays playable
const AIR_DRAG = 0.85; // per second drag (higher = more drag). Applied smoothly via dt.

export function stepPhysics(state, dt) {
  const { ball, players, world } = state;

  // Safety guard
  if (!dt || dt <= 0) {
    state.sessionTime += 0;
    return;
  }

  // --- Apply gravity ---
  ball.vy += GRAVITY * dt;

  // --- Player push forces ---
  for (const [, player] of players) {
    const dx = ball.x - player.x;
    const dy = ball.y - player.y;
    const distSq = dx * dx + dy * dy;

    const radius = PUSH_RADIUS + ball.r;
    const radiusSq = radius * radius;

    if (distSq < radiusSq && distSq > 0.000001) {
      const dist = Math.sqrt(distSq);
      const nx = dx / dist;
      const ny = dy / dist;

      // Backward-compatible:
      // - old clients don’t send pushing, so treat "undefined" as true (push still works).
      // - once we add click/hold, pushing=false will reduce force.
      const pushing = player.pushing === undefined ? true : !!player.pushing;

      let force = BASE_PUSH_FORCE * (pushing ? PUSHING_FORCE_MULTIPLIER : 0.55);

      // Distance falloff: stronger when closer, softer when near edge of radius
      const closeness = 1 - dist / radius; // 0..1
      force *= 0.35 + 0.65 * closeness;

      // Downward dampening (cursor below ball): don’t kill it, just reduce a bit
      if (ny > 0) {
        force *= DOWNWARD_MULTIPLIER;
      }

      ball.vx += nx * force * dt;
      ball.vy += ny * force * dt;
    }
  }

  // --- Air drag (smooths motion) ---
  // Convert per-second drag constant into dt-scaled multiplier
  const drag = Math.max(0, 1 - AIR_DRAG * dt);
  ball.vx *= drag;
  ball.vy *= drag;

  // --- Clamp fall speed ---
  if (ball.vy > MAX_FALL_SPEED) ball.vy = MAX_FALL_SPEED;
  if (ball.vy < -MAX_FALL_SPEED) ball.vy = -MAX_FALL_SPEED;

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
    ball.vy -= 240 * dt; // slightly gentler than before
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

  // --- Session time ---
  state.sessionTime += dt;
}

function resetBall(state) {
  const { ball, world } = state;

  // ✅ Update record before we zero-out the session timer
  const current = typeof state.sessionTime === "number" ? state.sessionTime : 0;
  const best = typeof state.bestTime === "number" ? state.bestTime : 0;
  state.bestTime = Math.max(best, current);

  // Reset ball
  ball.x = world.width / 2;
  ball.y = world.height / 3;
  ball.vx = 0;
  ball.vy = 0;

  // Reset round timer + abyss tracking
  state.sessionTime = 0;
  state.lastBelowAbyssAt = null;
}
