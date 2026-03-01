// client/src/core/renderer.js
// Renders the world on a black background with white elements.

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });

    this.width = 0;
    this.height = 0;

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

    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  }

  clear() {
    // black background
    this.ctx.fillStyle = "#000";
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawBall(ball) {
    if (!ball) return;
    const ctx = this.ctx;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
  }

  drawCursor(cursor) {
    // tiny "hand" marker (simple minimal shape)
    const ctx = this.ctx;
    const x = cursor.x;
    const y = cursor.y;
    const s = cursor.size || 6;

    ctx.strokeStyle = "#fff";
    ctx.lineWidth = 1;

    // small crosshair/hand-like tick
    ctx.beginPath();
    ctx.moveTo(x - s, y);
    ctx.lineTo(x + s, y);
    ctx.moveTo(x, y - s);
    ctx.lineTo(x, y + s);
    ctx.stroke();
  }

  drawCursors(cursors) {
    if (!cursors) return;
    for (const c of cursors) this.drawCursor(c);
  }

  drawAbyssLine(y) {
    const ctx = this.ctx;
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(this.width, y);
    ctx.stroke();
  }

  render({ ball, cursors, abyssY }) {
    this.clear();
    if (typeof abyssY === "number") this.drawAbyssLine(abyssY);
    this.drawBall(ball);
    this.drawCursors(cursors);
  }
}
