// client/src/entities/Ball.js
// Client-side visual representation of the ball.
// Physics is server-authoritative.

export class Ball {
  constructor({ x = 0, y = 0, r = 18 } = {}) {
    this.x = x;
    this.y = y;
    this.r = r;

    this.vx = 0;
    this.vy = 0;
  }

  updateFromState(stateBall) {
    if (!stateBall) return;

    this.x = stateBall.x;
    this.y = stateBall.y;
    this.r = stateBall.r;
    this.vx = stateBall.vx;
    this.vy = stateBall.vy;
  }

  toRenderObject() {
    return {
      x: this.x,
      y: this.y,
      r: this.r
    };
  }
}
