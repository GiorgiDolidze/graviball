// client/src/core/state.js
// Client-side state container (visual + network snapshot storage).
// Server remains authoritative.

export class ClientState {
  constructor() {
    this.connected = false;

    // Ball snapshot from server
    this.ball = {
      x: 0,
      y: 0,
      r: 18,
      vx: 0,
      vy: 0
    };

    // Latest authoritative snapshot
    this.serverBall = null;

    // Other players' cursors
    this.cursors = [];

    // Local player cursor
    this.localCursor = {
      x: 0,
      y: 0,
      size: 6
    };

    this.abyssY = null;

    this.sessionTime = 0; // seconds
  }

  setConnected(value) {
    this.connected = value;
  }

  setServerBall(snapshot) {
    this.serverBall = snapshot;
  }

  setCursors(cursors) {
    this.cursors = cursors || [];
  }

  setAbyssY(y) {
    this.abyssY = y;
  }

  updateSessionTime(seconds) {
    this.sessionTime = seconds;
  }
}
