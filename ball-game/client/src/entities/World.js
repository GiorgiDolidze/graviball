// client/src/entities/World.js
// Aggregates renderable world objects from client state.

export class World {
  constructor(state) {
    this.state = state;
  }

  getRenderData() {
    const ball = this.state.ball
      ? {
          x: this.state.ball.x,
          y: this.state.ball.y,
          r: this.state.ball.r
        }
      : null;

    const cursors = [
      ...this.state.cursors.map(c => ({
        x: c.x,
        y: c.y,
        size: c.size || 6
      })),
      {
        // include local cursor visually as well
        x: this.state.localCursor.x,
        y: this.state.localCursor.y,
        size: this.state.localCursor.size || 6
      }
    ];

    return {
      ball,
      cursors,
      abyssY: this.state.abyssY
    };
  }
}
