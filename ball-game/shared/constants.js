// shared/constants.js
// Shared gameplay constants to avoid client/server drift.

export const GAME_CONSTANTS = {
  TICK_RATE: 60,
  BROADCAST_RATE: 30,

  BALL_RADIUS: 18,
  PUSH_RADIUS: 14,

  MAX_PUSH_FORCE: 600,
  GRAVITY: 900,

  DOWNWARD_MULTIPLIER: 0.4,
  DANGER_ZONE_START_RATIO: 0.8,
  ABYSS_CONFIRM_DELAY: 0.8
};
