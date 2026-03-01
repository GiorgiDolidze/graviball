// client/src/network/socket.js
// Handles WebSocket connection to the authoritative Render server.

export class GameSocket {
  constructor(url, handlers = {}) {
    this.url = url;
    this.ws = null;

    this.handlers = {
      open: handlers.open || (() => {}),
      close: handlers.close || (() => {}),
      error: handlers.error || (() => {}),
      message: handlers.message || (() => {})
    };
  }

  connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    this.ws = new WebSocket(this.url);

    this.ws.addEventListener("open", (event) => {
      this.handlers.open(event);
    });

    this.ws.addEventListener("close", (event) => {
      this.handlers.close(event);
    });

    this.ws.addEventListener("error", (event) => {
      this.handlers.error(event);
    });

    this.ws.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handlers.message(data);
      } catch (err) {
        console.warn("Invalid WS message:", event.data);
      }
    });
  }

  send(type, payload = {}) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const message = JSON.stringify({ type, payload });
    this.ws.send(message);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}
