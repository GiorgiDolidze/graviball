// client/src/ui/timer.js
// Handles updating the session time display in the HUD.

export class TimerUI {
  constructor(elementId = "timerValue") {
    this.el = document.getElementById(elementId);
  }

  format(seconds) {
    return `${seconds.toFixed(1)}s`;
  }

  update(seconds) {
    if (!this.el) return;
    this.el.textContent = this.format(seconds);
  }
}
