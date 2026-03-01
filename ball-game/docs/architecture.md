# Graviball Architecture

## Overview

Graviball is a server-authoritative multiplayer physics experiment.

- One global session
- No accounts
- No rooms
- Emergent cooperation and sabotage

## Deployment Model

Frontend:
- Built with Vite
- Static output deployed to cPanel (/public_html)
- Connects to Render WebSocket backend

Backend:
- Node.js + Express + ws
- Runs on Render
- Authoritative physics and state
- Broadcasts snapshots at fixed interval

## Data Flow

Client:
- Sends cursor position only
- Renders interpolated server state

Server:
- Receives cursor positions
- Applies push forces
- Runs gravity + constraints
- Broadcasts state_snapshot + session_time

## Anti-Grief Design

- Downward force dampening
- Danger zone upward bias
- Abyss confirmation delay

## Networking

Tick rate: 60Hz  
Broadcast rate: 30Hz  
Transport: WebSocket
