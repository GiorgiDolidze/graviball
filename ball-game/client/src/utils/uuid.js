// client/src/utils/uuid.js
// Lightweight UUID generator for client-side temporary IDs.

export function generateUUID() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback if randomUUID not available
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
