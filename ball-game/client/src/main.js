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

function sendCursor(x, y) {
  socket.send(CLIENT_EVENTS.CURSOR_MOVE, { x, y });
}

window.addEventListener("pointermove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  state.localCursor.x = x;
  state.localCursor.y = y;

  sendCursor(x, y);
});

// --- Loop ---

const loop = new GameLoop(
  (delta) => {
    applyInterpolation(state, NETWORK.INTERPOLATION_ALPHA);
    timerUI.update(state.sessionTime);
  },
  () => {
    renderer.render(world.getRenderData());
  }
);

loop.start();
