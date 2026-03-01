// client/src/entities/PlayerCursor.js
// Represents a player's cursor/hand for rendering.

export class PlayerCursor {
  constructor({ id, x = 0, y = 0 } = {}) {
    this.id = id || "unknown";
    this.x = x;
    this.y = y;

    // Tiny hand visual size (crosshair)
    this.size = 6;
  }

  update(x, y) {
    this.x = x;
    this.y = y;
  }

  toRenderObject() {
    return {
      x: this.x,
      y: this.y,
      size: this.size
    };
  }
}
