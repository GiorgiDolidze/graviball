// client/src/utils/math.js
// Basic math helpers for client-side logic.

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function distance(x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

export function length(x, y) {
  return Math.sqrt(x * x + y * y);
}

export function normalize(x, y) {
  const len = length(x, y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: x / len, y: y / len };
}
