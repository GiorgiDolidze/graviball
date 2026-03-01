// client/src/config/constants.js
// Visual + network-related constants for client.
// Authoritative physics values live on the server.

export const WS_URL = "wss://graviball.onrender.com";
// This must match your actual Render WebSocket URL.

export const RENDER = {
  BACKGROUND: "#000000",
  FOREGROUND: "#ffffff"
};

export const GAME = {
  BALL_RADIUS: 18,
  CURSOR_SIZE: 6
};

export const NETWORK = {
  INTERPOLATION_ALPHA: 0.15
};
