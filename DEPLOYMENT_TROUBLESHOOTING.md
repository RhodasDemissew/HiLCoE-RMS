# Deployment Troubleshooting Guide

## CORS Error Fix

If you're getting CORS errors, follow these steps:

### Step 1: Verify Frontend Environment Variable
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Check `VITE_API_BASE` is set to: `https://your-backend.onrender.com`
3. **IMPORTANT:** After changing, you MUST redeploy (Vite env vars are baked at build time)

### Step 2: Redeploy Frontend
1. Vercel → Deployments → Click "..." on latest → "Redeploy"
2. Wait for build to complete

### Step 3: Update Backend CORS
1. Render → Backend Service → Environment → Environment Variables
2. Set `CORS_ORIGIN` to:
   - Production only: `https://your-frontend.vercel.app`
   - Include preview URLs: `https://your-frontend.vercel.app,https://*.vercel.app`
   - Temporary (testing): `*`
3. Render auto-redeploys

### Step 4: Clear Browser Cache
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or use Incognito/Private mode

### Step 5: Verify URLs
- Frontend URL: Check browser address bar
- Backend URL: Check Render dashboard
- Make sure no `localhost` URLs are being used

## Common Issues

**Frontend still calling localhost:4000**
- Cause: Frontend wasn't rebuilt after setting VITE_API_BASE
- Fix: Redeploy frontend in Vercel

**CORS error persists**
- Cause: Backend CORS_ORIGIN doesn't match frontend URL
- Fix: Update CORS_ORIGIN to match exact frontend URL (including preview URLs)

**Environment variables not updating**
- Frontend (Vite): Must redeploy after changing env vars
- Backend (Node): Auto-redeploys on Render

