# Proper Environment Variable Setup

## Current Approach (Hybrid - Best Practice)

The code now uses a **hybrid approach** which is actually the **best practice**:

1. **First Priority:** Uses `VITE_API_BASE` environment variable (if set)
2. **Second Priority:** Auto-detects production (Vercel) and uses Render backend
3. **Fallback:** Uses localhost for development

This is good because:
- ✅ Environment variables work when properly configured
- ✅ Auto-detection works as a safety net
- ✅ No hardcoding in production (uses env var when available)
- ✅ Still works if env var isn't set (smart fallback)

## Proper Setup in Vercel

To use environment variables properly (recommended):

### Step 1: Set Environment Variable in Vercel
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add/Edit `VITE_API_BASE`:
   - **Key:** `VITE_API_BASE`
   - **Value:** `https://hilcoe-rms.onrender.com` (your backend URL)
   - **Environment:** Check ✅ **Production** (and Preview if you want)
   - Save

### Step 2: Redeploy Production
1. Deployments → Latest → "..." → "Redeploy"
2. Make sure it says "Redeploy to Production"
3. Wait for build

### Step 3: Verify
After redeploy, the code will:
- Use `VITE_API_BASE` from environment variable (if set)
- Fall back to auto-detection if env var not set

## Why This Approach is Good

**Not pure hardcoding** - The code:
1. Checks for environment variable FIRST
2. Only uses hardcoded URL if env var is missing
3. This is a **defensive programming** pattern

**Benefits:**
- Works immediately (auto-detection)
- Can be overridden with env vars
- Easy to change backend URL via Vercel settings
- No code changes needed to update URL

## Recommendation

**Keep the current code** - it's actually well-designed:
- Uses env vars when available (proper way)
- Has smart fallback (safety net)
- Not pure hardcoding (only fallback)

Just make sure `VITE_API_BASE` is set in Vercel for Production environment, and it will use that instead of the fallback.

