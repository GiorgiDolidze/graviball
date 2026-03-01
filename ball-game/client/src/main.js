// client/src/main.js

import { Renderer } from "./core/renderer.js";
import { GameLoop } from "./core/gameLoop.js";
import { ClientState } from "./core/state.js";

import { GameSocket } from "./network/socket.js";
import { handleServerMessage, applyInterpolation } from "./network/sync.js";
import { CLIENT_EVENTS } from "./network/events.js";

import { World } from "./entities/World.js";
import { TimerUI } from "./ui/timer.js";

import { WS_URL, NETWORK } from "./config/constants.js";

const canvas = document.getElementById("game");
canvas.style.touchAction = "none";

const renderer = new Renderer(canvas);
const state = new ClientState();
const world = new World(state);
const timerUI = new TimerUI();

const socket = new GameSocket(WS_URL, {
  open: () => console.log("Connected to server"),
  message: (data) => handleServerMessage(state, data),
  close: () => console.log("Disconnected from server")
});

socket.connect();

function getPointerScreenXY(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  return { sx, sy, rect };
}

/**
 * Correct mapping with letterboxing:
 * world fits into rect with offsets; we must subtract offsets before scaling.
 */
function pointerToWorld(e) {
  const { sx, sy, rect } = getPointerScreenXY(e);

  const w = state.world?.width;
  const h = state.world?.height;

  // If we don't have world yet, fallback to old behavior
  if (
    !(typeof w === "number" && typeof h === "number" && Number.isFinite(w) && Number.isFinite(h)) ||
    rect.width <= 0 ||
    rect.height <= 0
  ) {
    // fallback: proportional mapping (best-effort)
    return { wx: sx, wy: sy };
  }

  const scale = Math.min(rect.width / w, rect.height / h);
  const offX = (rect.width - w * scale) / 2;
  const offY = (rect.height - h * scale) / 2;

  const wx = (sx - offX) / scale;
  const wy = (sy - offY) / scale;

  // Clamp into world bounds so moving in black letterbox bars doesn't go crazy
  const cx = Math.max(0, Math.min(w, wx));
  const cy = Math.max(0, Math.min(h, wy));

  return { wx: cx, wy: cy };
}

function updateLocalCursorFromEvent(e) {
  const { wx, wy } = pointerToWorld(e);
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

window.addEventListener(
  "pointermove",
  (e) => {
    const { wx, wy } = updateLocalCursorFromEvent(e);
    sendCursorWorld(wx, wy);
  },
  { passive: true }
);

window.addEventListener(
  "pointerdown",
  (e) => {
    try {
      canvas.setPointerCapture(e.pointerId);
    } catch (_) {}

    const { wx, wy } = updateLocalCursorFromEvent(e);
    sendCursorWorld(wx, wy);
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

const loop = new GameLoop(
  () => {
    applyInterpolation(state, NETWORK.INTERPOLATION_ALPHA);
    timerUI.update(state.sessionTime, state.bestTime);
  },
  () => {
    renderer.render(world.getRenderData(), state.world || null);
  }
);

loop.start();
