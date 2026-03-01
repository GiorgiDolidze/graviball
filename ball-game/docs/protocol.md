# Graviball WebSocket Protocol

All messages are JSON objects:

{
  "type": string,
  "payload": object
}

---

## Client → Server

### cursor_move

Sent continuously when player moves pointer.

{
  "type": "cursor_move",
  "payload": {
    "x": number,
    "y": number
  }
}

Description:
- Updates authoritative player cursor position.
- Server uses this to calculate push forces.

---

## Server → Client

### connected

{
  "type": "connected",
  "payload": {
    "id": string
  }
}

Description:
- Sent once on successful connection.
- Identifies client session internally.

---

### state_snapshot

{
  "type": "state_snapshot",
  "payload": {
    "ball": {
      "x": number,
      "y": number,
      "r": number,
      "vx": number,
      "vy": number
    },
    "cursors": [
      { "x": number, "y": number }
    ],
    "abyssY": number
  }
}

Description:
- Broadcast at fixed rate (30Hz).
- Represents authoritative world state.

---

### session_time

{
  "type": "session_time",
  "payload": {
    "time": number
  }
}

Description:
- Current survival time in seconds.
- Reset when ball falls into abyss.

---

## Design Notes

- Server is fully authoritative.
- Client never sends physics values.
- Only pointer positions are trusted.
- All physics calculated server-side.
