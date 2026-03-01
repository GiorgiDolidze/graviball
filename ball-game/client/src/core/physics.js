// client/src/core/physics.js
// Client-side interpolation helpers (NOT authoritative physics).
// The server owns real physics. This only smooths rendering.

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpVector(current, target, alpha) {
  return {
    x: lerp(current.x, target.x, alpha),
    y: lerp(current.y, target.y, alpha)
  };
}

// Smoothly interpolate ball position toward latest server snapshot
export function interpolateBall(localBall, serverBall, alpha = 0.15) {
  if (!serverBall) return localBall;

  return {
    x: lerp(localBall.x, serverBall.x, alpha),
    y: lerp(localBall.y, serverBall.y, alpha),
    vx: serverBall.vx,
    vy: serverBall.vy
  };
}
