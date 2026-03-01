// client/src/main.js
// Entry point: wires renderer, state, socket, loop.

import { Renderer } from "./core/renderer.js";
import { GameLoop } from "./core/gameLoop.js";
import { ClientState } from "./core/state.js";

import { GameSocket } from "./network/socket.js";
import { handleServerMessage, applyInterpolation } from "./network/sync.js";
import { CLIENT_EVENTS } from "./network/events.js";

import { World } from "./entities/World.js";
import { TimerUI } from "./ui/timer.js";

import { WS_URL, NETWORK } from "./config/constants.js";

// --- Setup ---

const canvas = document.getElementById("game");

// Prevent touch gestures from hijacking gameplay on mobile
canvas.style.touchAction = "none";

const renderer = new Renderer(canvas);
const state = new ClientState();
const world = new World(state);
const timerUI = new TimerUI();

// --- Socket ---

const socket = new GameSocket(WS_URL, {
  open: () => {
    console.log("Connected to server");
  },
  message: (data) => {
    handleServerMessage(state, data);
  },
  close: () => {
    console.log("Disconnected from server");
  }
});

socket.connect();

// --- Input helpers ---

function getPointerScreenXY(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  return { sx, sy, rect };
}

/**
 * IMPORTANT FIX:
 * Use the authoritative world size coming from the server snapshot to map pointer position.
 * This removes DPI/scale/transform mismatch that makes desktop feel weak.
 */
function updateLocalCursorFromEvent(e) {
  const { sx, sy, rect } = getPointerScreenXY(e);

  const w = state.world?.width;
  const h = state.world?.height;

  let wx, wy;

  if (
    typeof w === "number" &&
    typeof h === "number" &&
    Number.isFinite(w) &&
    Number.isFinite(h) &&
    rect.width > 0 &&
    rect.height > 0
  ) {
    wx = (sx / rect.width) * w;
    wy = (sy / rect.height) * h;
  } else {
    // Fallback if world not received yet
    const p = renderer.screenToWorld(sx, sy);
    wx = p.x;
    wy = p.y;
  }

  state.localCursor.x = wx;
  state.localCursor.y = wy;

  return { wx, wy };
}

function sendCursorWorld(x, y) {
  socket.send(CLIENT_EVENTS.CURSOR_MOVE, { x, y });
}

function sendPushStart(x, y) {
  socket.send(CLIENT_EVENTS.PUSH_START, { x, y });
}

function sendPushEnd(x, y) {
  socket.send(CLIENT_EVENTS.PUSH_END, { x, y });
}

// --- Pointer events ---

window.addEventListener(
  "pointermove",
  (e) => {
    const { wx, wy } = updateLocalCursorFromEvent(e);
    sendCursorWorld(wx, wy);
  },
  { passive: true }
);

// Clicking/tapping should do something even if you don’t move the pointer
window.addEventListener(
  "pointerdown",
  (e) => {
    // Capture so we reliably get pointerup even if pointer leaves canvas
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) {}

    const { wx, wy } = updateLocalCursorFromEvent(e);

    // Ensure server knows where you are even on taps with zero movement
    sendCursorWorld(wx, wy);

    // Start "active pushing"
    sendPushStart(wx, wy);
  },
  { passive: true }
);

window.addEventListener(
  "pointerup",
  (e) => {
    const { wx, wy } = updateLocalCursorFromEvent(e);
    sendPushEnd(wx, wy);

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (_) {}
  },
  { passive: true }
);

window.addEventListener(
  "pointercancel",
  (e) => {
    const { wx, wy } = updateLocalCursorFromEvent(e);
    sendPushEnd(wx, wy);

    try {
      canvas.releasePointerCapture(e.pointerId);
    } catch (_) {}
  },
  { passive: true }
);

// --- Loop ---

const loop = new GameLoop(
  () => {
    applyInterpolation(state, NETWORK.INTERPOLATION_ALPHA);

    // Update both current time and record time
    timerUI.update(state.sessionTime, state.bestTime);
  },
  () => {
    renderer.render(world.getRenderData(), state.world || null);
  }
);

loop.start();
