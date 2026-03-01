// server/src/utils/logger.js
// Minimal structured logger.

function format(level, message) {
  const time = new Date().toISOString();
  return `[${time}] [${level.toUpperCase()}] ${message}`;
}

export const logger = {
  info(message) {
    console.log(format("info", message));
  },

  warn(message) {
    console.warn(format("warn", message));
  },

  error(message) {
    console.error(format("error", message));
  }
};
