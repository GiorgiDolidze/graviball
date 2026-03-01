// client/src/core/state.js
// Client-side state container (visual + network snapshot storage).
// Server remains authoritative.

export class ClientState {
  constructor() {
    this.connected = false;

    // Authoritative world info from server (used for responsive scaling)
    // We keep abyssY separately too for backward compatibility with existing code.
    this.world = null; // { width, height, abyssY }

    // Ball snapshot from server (rendered/interpolated)
    this.ball = {
      x: 0,
      y: 0,
      r: 18,
      vx: 0,
      vy: 0
    };

    // Latest authoritative snapshot (used as interpolation target)
    this.serverBall = null;

    // Other players' cursors
    this.cursors = [];

    // Local player cursor (we store this in WORLD coords)
    this.localCursor = {
      x: 0,
      y: 0,
      size: 6
    };

    // Back-compat: still used by World.getRenderData()
    this.abyssY = null;

    // Session time (seconds)
    this.sessionTime = 0;

    // Record/best time (seconds)
    this.bestTime = 0;
  }

  setConnected(value) {
    this.connected = value;
  }

  // --- World / environment ---

  setWorld(world) {
    if (!world || typeof world !== "object") return;

    const width = Number.isFinite(world.width) ? world.width : (this.world ? this.world.width : null);
    const height = Number.isFinite(world.height) ? world.height : (this.world ? this.world.height : null);
    const abyssY = Number.isFinite(world.abyssY) ? world.abyssY : (this.world ? this.world.abyssY : null);

    this.world = { width, height, abyssY };

    // keep legacy field in sync
    if (Number.isFinite(abyssY)) this.abyssY = abyssY;
  }

  setAbyssY(y) {
    this.abyssY = y;

    // also keep world.abyssY synced if world exists
    if (this.world) {
      this.world = { ...this.world, abyssY: y };
    }
  }

  // --- Ball / cursors ---

  setServerBall(snapshot) {
    this.serverBall = snapshot;
  }

  setCursors(cursors) {
    this.cursors = cursors || [];
  }

  // --- Time ---

  updateSessionTime(seconds) {
    this.sessionTime = seconds;
  }

  updateBestTime(seconds) {
    this.bestTime = seconds;
  }
}
