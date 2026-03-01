// client/src/core/physics.js
// Client-side interpolation helpers (NOT authoritative physics).
// The server owns real physics. This only smooths rendering.

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function lerpVector(current, target, alpha) {
  return {
    x: lerp(current.x, target.x, alpha),
    y: lerp(current.y, target.y, alpha),
  };
}

/**
 * Smoothly interpolate ball position toward latest server snapshot.
 * IMPORTANT: Preserve ball fields like radius (r). Dropping r makes the ball invisible.
 */
export function interpolateBall(localBall, serverBall, alpha = 0.15) {
  if (!serverBall) return localBall;

  const safeLocal = localBall || {};
  const safeServer = serverBall || {};

  // Interpolate only position for smoothing.
  const x = lerp(
    Number.isFinite(safeLocal.x) ? safeLocal.x : safeServer.x || 0,
    Number.isFinite(safeServer.x) ? safeServer.x : safeLocal.x || 0,
    alpha
  );

  const y = lerp(
    Number.isFinite(safeLocal.y) ? safeLocal.y : safeServer.y || 0,
    Number.isFinite(safeServer.y) ? safeServer.y : safeLocal.y || 0,
    alpha
  );

  // Merge so we never "lose" properties like r during interpolation.
  // Server values override local defaults, but x/y are our interpolated values.
  return {
    ...safeLocal,
    ...safeServer,
    x,
    y,
  };
}
