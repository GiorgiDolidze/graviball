// client/src/ui/timer.js

function formatSeconds(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;

  // show 1 decimal like 12.3
  const s = Math.floor(seconds);
  const tenths = Math.floor((seconds - s) * 10);

  const mins = Math.floor(s / 60);
  const rem = s % 60;

  if (mins > 0) {
    return `${mins}:${String(rem).padStart(2, "0")}.${tenths}`;
  }
  return `${rem}.${tenths}`;
}

export class TimerUI {
  constructor() {
    this.timerEl = document.getElementById("timerValue");
    this.recordEl = document.getElementById("recordValue");
  }

  /**
   * Update HUD values.
   * @param {number} sessionSeconds
   * @param {number} bestSeconds
   */
  update(sessionSeconds, bestSeconds = null) {
    if (this.timerEl) {
      this.timerEl.textContent = formatSeconds(sessionSeconds);
    }
    if (this.recordEl && bestSeconds != null) {
      this.recordEl.textContent = formatSeconds(bestSeconds);
    }
  }
}
