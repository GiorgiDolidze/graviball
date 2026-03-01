// server/src/config/constants.js
// Shared gameplay constants for server authoritative physics.

export const TICK_RATE = Number(process.env.TICK_RATE || 60);
export const BROADCAST_RATE = Number(process.env.BROADCAST_RATE || 30);

export const BALL_RADIUS = 18;
export const CURSOR_PUSH_RADIUS = 14;

export const DOWNWARD_MULTIPLIER = 0.4;
export const DANGER_ZONE_START_RATIO = 0.8;
export const ABYSS_CONFIRM_DELAY = 0.8;
