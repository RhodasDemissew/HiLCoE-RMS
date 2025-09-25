# HiLCoE RMS – Client

React front-end for the HiLCoE Research Management System. Built with Vite, Tailwind CSS (v4), and React Router.

## Prerequisites
- Node.js 18+
- npm 9+

## Getting Started
```bash
cd CLIENT
npm install
npm run dev
```

The dev server defaults to [http://localhost:5173](http://localhost:5173). Vite reloads automatically as you edit source files.

## Project Scripts
| Script | Description |
| ------ | ----------- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create an optimized production build in `dist/`. |
| `npm run preview` | Serve the production build locally (after `npm run build`). |

## Production Build
To generate deployable assets:
```bash
npm run build
```
Upload the contents of `dist/` to your hosting provider (e.g., Netlify, Vercel, S3 + CloudFront). Ensure history mode rewrites route all requests to `index.html` so client-side routing works.

### Preview the build locally
```bash
npm run preview
```

## Environment Variables
Create a `.env` in `CLIENT/` for values the app needs at build/run time. Example:
```bash
VITE_API_BASE_URL=http://localhost:3000
```
Restart the dev server whenever you change env values.

## Recommended Workflow
1. Branch from `main` for each feature.
2. Run `npm run dev` while editing for instant feedback.
3. Keep an eye on eslint/TypeScript warnings if configured.
4. `npm run build` before committing to ensure production builds cleanly.
5. Push and open a PR for review.

## Deployment Checklist
- [ ] Environment variables set in hosting platform (matching `.env`).
- [ ] `npm run build` passes with no errors/warnings.
- [ ] `dist/` deployed and rewrites configured for single-page routing.
- [ ] Manual smoke test of auth flows, navigation, and forms.

## Folder Structure Overview
```
CLIENT/
+-- src/
¦   +-- assets/         # Images & icons
¦   +-- components/     # Reusable UI pieces
¦   +-- content/        # Static copy/config data
¦   +-- pages/          # Top-level route screens
¦   +-- styles/         # Tailwind layer config and utility classes
¦   +-- api/            # API client helpers
¦   +-- main.jsx        # App bootstrap
+-- public/             # Static files served as-is
+-- package.json
+-- vite.config.js
```

## Troubleshooting
- **Port already in use**: run `npm run dev -- --host --port <new-port>`
- **Dependency issues**: delete `node_modules/` and `package-lock.json`, run `npm install` again.
- **Router 404s after deploy**: add a rewrite rule pointing all routes to `/index.html`.

---
Need backend instructions? See the API project README.
