# Scathat Backend Package

This package folder is a scaffold for the Scathat extension backend.

## Purpose

- Provides a place for backend code that serves endpoints referenced by the extension:
  - `GET /health` — health check
  - `GET /config` — backend capabilities
  - `POST /analyze` — contract analysis

## Quick Start (to be implemented by backend dev)

- Implement a simple HTTP server (Node/Express, FastAPI, etc.)
- Expose the endpoints listed above
- Point the extension to the backend via `settings.backendURL` (default `http://localhost:8000`)

## Folder Layout

- `package.json` — package metadata (no deps/scripts yet)
- Add your server files here (e.g., `server.js`, `app.py`, etc.)

## Notes

- Keep responses JSON and stable for the extension client in `src/api-client.js`
- Recommended Node version: `>= 18`

