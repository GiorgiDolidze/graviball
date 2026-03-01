# Graviball

Graviball is a server-authoritative multiplayer physics experiment.

One global session.  
No accounts.  
No rooms.  
Emergent cooperation and sabotage.

---

## Project Structure

- client/ → Frontend (Vite build → deploy to cPanel)
- server/ → Node.js WebSocket backend (deploy to Render)
- shared/ → Shared constants + event definitions
- docs/ → Architecture and protocol documentation

---

## Deployment

### 1. Frontend (cPanel)

Inside client/:

npm install  
npm run build  

This creates:

client/dist/

Upload the **contents of dist/** to:

/public_html/

Your site will load from:

https://www.graviball.com

---

### 2. Backend (Render)

Deploy the server/ directory as a Node service.

Build command:
npm install

Start command:
npm start

Set environment variables in Render dashboard (not via .env file).

---

## Development

Run frontend locally:

cd client  
npm install  
npm run dev  

Run server locally:

cd server  
npm install  
npm run dev  

---

## Core Rules

- Server owns physics.
- Clients send only cursor positions.
- Downward force is dampened.
- Danger zone adds survival bias.
- Abyss requires 0.8s confirmation before reset.

---

Graviball.com  
The open gaming experiment by Giorgi Dolidze.
