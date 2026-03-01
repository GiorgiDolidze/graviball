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

// --- Input ---

function sendCursorWorld(x, y) {
  socket.send(CLIENT_EVENTS.CURSOR_MOVE, { x, y });
}

function getPointerScreenXY(e) {
  const rect = canvas.getBoundingClientRect();
  const sx = e.clientX - rect.left;
  const sy = e.clientY - rect.top;
  return { sx, sy };
}

window.addEventListener(
  "pointermove",
  (e) => {
    const { sx, sy } = getPointerScreenXY(e);

    // Convert screen -> world using the most recently computed transform.
    const { x: wx, y: wy } = renderer.screenToWorld(sx, sy);

    // Store local cursor in WORLD coords so it matches everyone else
    state.localCursor.x = wx;
    state.localCursor.y = wy;

    sendCursorWorld(wx, wy);
  },
  { passive: true }
);

// --- Loop ---

const loop = new GameLoop(
  (delta) => {
    applyInterpolation(state, NETWORK.INTERPOLATION_ALPHA);

    // ✅ update both current time and record time
    timerUI.update(state.sessionTime, state.bestTime);
  },
  () => {
    renderer.render(world.getRenderData(), state.world || null);
  }
);

loop.start();
