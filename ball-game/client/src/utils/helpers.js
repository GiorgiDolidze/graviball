// client/src/utils/helpers.js
// Generic small helpers.

export function nowSeconds() {
  return performance.now() / 1000;
}

export function formatSeconds(seconds, decimals = 1) {
  return `${seconds.toFixed(decimals)}s`;
}

export function safeNumber(value, fallback = 0) {
  return typeof value === "number" && !Number.isNaN(value)
    ? value
    : fallback;
}

export function noop() {}
