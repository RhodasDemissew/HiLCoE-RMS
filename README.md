# HiLCoE-RMS Monorepo (API + CLIENT)

Separated folders for backend (API) and frontend (CLIENT) so different teams can work and run them independently.

## Structure
- `API/`: Node.js + Express + MongoDB backend
- `CLIENT/`: Vite + React frontend

## Backend (API)
1) `cd API`
2) `cp .env.example .env` and set `MONGO_URI`, `JWT_SECRET`, `STORAGE_DIR`
3) `npm install`
4) Seed base data: `npm run seed` (admin: admin@hilcoe.local / admin123)
5) Run dev server: `npm run dev`
6) Health check: `GET http://localhost:4000/health`

### API Docs (Swagger)
- Swagger UI: `http://localhost:4000/docs`
- OpenAPI JSON: `http://localhost:4000/openapi.json`
- Flow:
  - `POST /auth/login` with seeded admin
  - Click Authorize in Swagger: `Bearer <token>`
  - Try protected endpoints like `GET /auth/me`

## Frontend (CLIENT)
1) `cd CLIENT`
2) `npm install`
3) `npm run dev`

Set `VITE_API_BASE` in a `.env` file if your API isn’t on `http://localhost:4000`.

## Root convenience scripts
From the repo root you can run:
- `npm run api:dev` — run backend dev (`API`)
- `npm run client:dev` — run frontend dev (`CLIENT`)
- `npm run dev` — run both concurrently

## Notes
- Submissions accept base64 files in JSON to avoid extra deps. Switch to multipart later.
- Advisor assignment enforces max 10 advisees per advisor per semester.
- Minimal milestone state rules; refine per Final doc as we proceed.
