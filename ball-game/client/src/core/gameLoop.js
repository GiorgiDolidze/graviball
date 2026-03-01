// client/src/core/gameLoop.js
// Handles the render loop (client-side visual update only).
// Server remains authoritative for physics.

export class GameLoop {
  constructor(update, render) {
    this.update = update;
    this.render = render;

    this.lastTime = 0;
    this.running = false;
    this.rafId = null;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.lastTime = performance.now();
    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }

  stop() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  loop(currentTime) {
    if (!this.running) return;

    const delta = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    if (this.update) this.update(delta);
    if (this.render) this.render();

    this.rafId = requestAnimationFrame(this.loop.bind(this));
  }
}
