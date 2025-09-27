# HiLCoE RMS � Client

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


## Folder Structure Overview
```
CLIENT/
+-- src/
�   +-- assets/         # Images & icons
�   +-- components/     # Reusable UI pieces
�   +-- content/        # Static copy/config data
�   +-- pages/          # Top-level route screens
�   +-- styles/         # Tailwind layer config and utility classes
�   +-- api/            # API client helpers
�   +-- main.jsx        # App bootstrap
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
