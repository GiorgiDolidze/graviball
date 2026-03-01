// client/src/ui/overlay.js
// Minimal overlay logic (future-proof for round end, connection state, etc.)

export class OverlayUI {
  constructor() {
    this.messageEl = null;
    this.ensureElement();
  }

  ensureElement() {
    this.messageEl = document.createElement("div");
    this.messageEl.style.position = "absolute";
    this.messageEl.style.top = "50%";
    this.messageEl.style.left = "50%";
    this.messageEl.style.transform = "translate(-50%, -50%)";
    this.messageEl.style.color = "#fff";
    this.messageEl.style.fontSize = "16px";
    this.messageEl.style.opacity = "0.9";
    this.messageEl.style.pointerEvents = "none";
    this.messageEl.style.textAlign = "center";
    this.messageEl.style.display = "none";

    document.body.appendChild(this.messageEl);
  }

  show(message) {
    if (!this.messageEl) return;
    this.messageEl.textContent = message;
    this.messageEl.style.display = "block";
  }

  hide() {
    if (!this.messageEl) return;
    this.messageEl.style.display = "none";
  }
}
