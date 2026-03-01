// client/src/core/renderer.js
// Renders the world on a black background with white elements.
// Supports mapping a fixed "world" (server space) onto any screen size.

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });

    this.width = 0;
    this.height = 0;

    // current world->screen transform
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;

    this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap DPR for perf

    this.resize();
    window.addEventListener("resize", () => this.resize(), { passive: true });
  }

  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));

    this.dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    // Draw using CSS pixels
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  /**
   * Compute transform that fits world into screen while preserving aspect ratio (letterboxing).
   */
  computeWorldTransform(worldWidth, worldHeight) {
    const wW = Number.isFinite(worldWidth) && worldWidth > 0 ? worldWidth : this.width;
    const wH = Number.isFinite(worldHeight) && worldHeight > 0 ? worldHeight : this.height;

    const sx = this.width / wW;
    const sy = this.height / wH;
    this.scale = Math.min(sx, sy);

    const drawW = wW * this.scale;
    const drawH = wH * this.scale;

    this.offsetX = (this.width - drawW) / 2;
    this.offsetY = (this.height - drawH) / 2;

    return { worldWidth: wW, worldHeight: wH };
  }

  /**
   * Convert a screen (canvas CSS pixel) coordinate to world coordinate.
   * Used for mapping pointer input.
   */
  screenToWorld(screenX, screenY) {
    const x = (screenX - this.offsetX) / this.scale;
    const y = (screenY - this.offsetY) / this.scale;
    return { x, y };
  }

  clear() {
    // black background
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawBall(ball) {
    if (!ball) return;
    const ctx = this.ctx;

    if (!Number.isFinite(ball.x) || !Number.isFinite(ball.y)) return;
    const r = Number.isFinite(ball.r) ? ball.r : 18;

    ctx.beginPath();
    ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }

  drawCursor(cursor) {
    if (!cursor) return;
    const ctx = this.ctx;

    const x = cursor.x;
    const y = cursor.y;
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;

    const s = cursor.size || 6;

    ctx.strokeStyle = "#fff";
    // keep 1px-ish line in screen space even after scaling
    ctx.lineWidth = 1 / this.scale;

    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.lineTo(x + s, y);
    ctx.moveTo(x, y - s);
    ctx.lineTo(x, y + s);
    ctx.stroke();
  }

  drawCursors(cursors) {
    if (!Array.isArray(cursors)) return;
    for (const c of cursors) this.drawCursor(c);
  }

  drawAbyssLine(y, worldWidth) {
    if (!Number.isFinite(y)) return;
    const ctx = this.ctx;

    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1 / this.scale;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(worldWidth, y);
    ctx.stroke();
  }

  /**
   * Render the frame.
   * @param {{ball:any, cursors:any[], abyssY:number}} data
   * @param {{width:number, height:number}|null} world Optional world size from server.
   */
  render(data, world = null) {
    this.clear();

    const worldW = world && Number.isFinite(world.width) ? world.width : this.width;
    const worldH = world && Number.isFinite(world.height) ? world.height : this.height;

    const { worldWidth, worldHeight } = this.computeWorldTransform(worldW, worldH);

    const ctx = this.ctx;
    ctx.save();
    // Apply world -> screen transform
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.scale, this.scale);

    if (data && typeof data.abyssY === "number") this.drawAbyssLine(data.abyssY, worldWidth);
    if (data) {
      this.drawBall(data.ball);
      this.drawCursors(data.cursors);
    }

    ctx.restore();
  }
}
