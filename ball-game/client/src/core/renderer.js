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
   * Compute transform that fits world into screen while preserving aspect ratio (letterbox).
   */
  computeWorldTransform(worldW, worldH) {
    const sx = this.width / worldW;
    const sy = this.height / worldH;
    this.scale = Math.min(sx, sy);

    const drawW = worldW * this.scale;
    const drawH = worldH * this.scale;

    this.offsetX = (this.width - drawW) / 2;
    this.offsetY = (this.height - drawH) / 2;

    return { worldWidth: worldW, worldHeight: worldH };
  }

  clear() {
    const ctx = this.ctx;
    ctx.save();
    // Clear in CSS pixel space
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.restore();
  }

  drawBall(ball) {
    if (!ball) return;
    const ctx = this.ctx;

    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();
  }

  drawCursor(c) {
    if (!c) return;
    const ctx = this.ctx;

    const x = c.x;
    const y = c.y;

    const s = 6; // size in world units (scaled by transform)

    ctx.strokeStyle = "rgba(255,255,255,0.55)";
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

  /**
   * Draw abyss line + labels in WORLD space.
   * Styling is kept minimal, but text sizes are specified in screen pixels via 1/scale conversion.
   */
  drawAbyssLine(y, worldWidth) {
    if (!Number.isFinite(y)) return;
    const ctx = this.ctx;

    const RED = "rgba(255,60,60,0.78)";

    // 1px line regardless of scaling
    ctx.strokeStyle = RED;
    ctx.lineWidth = 1 / this.scale;

    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(worldWidth, y);
    ctx.stroke();

    // Text sizing in "screen px"
    const fontPx = 11; // small
    const fontWorld = fontPx / this.scale;

    const padPx = 10;
    const padWorld = padPx / this.scale;

    // "ABYSS------" at the beginning of the line (on the line)
    ctx.fillStyle = RED;
    ctx.font = `${fontWorld}px ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial`;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.fillText("ABYSS------", padWorld, y);

    // Instruction above line, centered
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    const instruction = "Resist gravity. Move to guide. Hold to lift.";
    const abovePx = 6;
    const aboveWorld = abovePx / this.scale;
    ctx.fillText(instruction, worldWidth / 2, y - aboveWorld);
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

    const { worldWidth } = this.computeWorldTransform(worldW, worldH);

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
