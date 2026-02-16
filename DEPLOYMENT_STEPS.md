# 🚀 Step-by-Step Deployment Guide - FREE TIER

## Step 1: MongoDB Atlas Setup (Database)

### 1.1 Create MongoDB Atlas Account
1. Go to: https://www.mongodb.com/cloud/atlas/register
2. Sign up with your email (or use Google/GitHub)
3. Verify your email

### 1.2 Create a Free Cluster
1. After login, click **"Build a Database"**
2. Choose **"M0 FREE"** tier (512MB storage, shared)
3. Select a **Cloud Provider** (AWS recommended)
4. Choose a **Region** closest to you (or your users)
5. Click **"Create"** (takes 1-3 minutes)

### 1.3 Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Enter:
   - **Username:** `rms_admin` (or your choice)
   - **Password:** Generate a strong password (SAVE THIS!)
5. Set privileges: **"Atlas Admin"** (or "Read and write to any database")
6. Click **"Add User"**

### 1.4 Configure Network Access
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. For now, click **"Allow Access from Anywhere"** (0.0.0.0/0)
   - ⚠️ This is for development. For production, add specific IPs
4. Click **"Confirm"**

### 1.5 Get Connection String
1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Select:
   - **Driver:** Node.js
   - **Version:** 5.5 or later
5. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<username>` and `<password>`** with your database user credentials
7. **Add database name** at the end: `/hilcoe_rms?retryWrites=true&w=majority`
   
   Final format:
   ```
   mongodb+srv://rms_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hilcoe_rms?retryWrites=true&w=majority
   ```
8. **SAVE THIS CONNECTION STRING** - You'll need it for the backend!

---

## Step 2: Deploy Backend API to Railway

### 2.1 Create Railway Account
1. Go to: https://railway.app/
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with GitHub (recommended) or email
4. Verify your account

### 2.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"** (if you have code on GitHub)
   - OR **"Empty Project"** if deploying manually
3. Authorize Railway to access your GitHub (if using GitHub)

### 2.3 Deploy Backend Service
1. Click **"New"** → **"GitHub Repo"** (or **"Empty Service"**)
2. If using GitHub:
   - Select your repository
   - Select the **"API"** folder as root directory
   - Railway will auto-detect Node.js
3. If using Empty Service:
   - We'll configure manually

### 2.4 Configure Environment Variables
1. Click on your service
2. Go to **"Variables"** tab
3. Add these environment variables:

```env
MONGO_URI=mongodb+srv://rms_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/hilcoe_rms?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-to-random-string
PORT=4000
NODE_ENV=production
CORS_ORIGIN=*
APP_BASE_URL=https://your-frontend-url.vercel.app
FORMAT_CHECKER_URL=https://your-checker-service.railway.app
STORAGE_DIR=/app/storage
```

**Important:**
- Replace `YOUR_PASSWORD` with your MongoDB password
- Replace `cluster0.xxxxx` with your actual cluster URL
- Generate a random string for `JWT_SECRET` (use: https://randomkeygen.com/)
- We'll update `FORMAT_CHECKER_URL` and `APP_BASE_URL` after deploying other services

### 2.5 Configure Build Settings
1. Go to **"Settings"** tab
2. Set **Root Directory:** `API` (if deploying from monorepo)
3. Set **Start Command:** `npm start`
4. Railway will auto-detect:
   - **Build Command:** `npm install`
   - **Node Version:** Latest LTS

### 2.6 Deploy
1. Railway will automatically deploy when you push to GitHub
2. OR click **"Deploy"** if using manual deployment
3. Wait for deployment (2-5 minutes)
4. Once deployed, Railway will give you a URL like: `https://your-api-name.railway.app`
5. **SAVE THIS URL** - You'll need it for the frontend!

### 2.7 Test Backend
1. Visit: `https://your-api-name.railway.app/health`
2. Should return: `{"ok":true}` or similar
3. Visit: `https://your-api-name.railway.app/docs` (Swagger UI)

---

## Step 3: Deploy Checker Service to Railway

### 3.1 Create New Service in Railway
1. In your Railway project, click **"New"** → **"GitHub Repo"** (or **"Empty Service"**)
2. If using GitHub:
   - Select your repository
   - Select the **"CHECKER"** folder as root directory
   - Railway will auto-detect Python

### 3.2 Configure Environment Variables
1. Go to **"Variables"** tab
2. Add (optional, has defaults):
```env
POLICY_DIR=/app/app/policies/msc
POLICY_CACHE_TTL_SECONDS=60
PORT=8001
```

### 3.3 Configure Build Settings
1. Go to **"Settings"** tab
2. Set **Root Directory:** `CHECKER` (if deploying from monorepo)
3. Railway should auto-detect Python
4. Set **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 3.4 Deploy
1. Railway will automatically deploy
2. Wait for deployment (3-5 minutes)
3. Once deployed, Railway will give you a URL like: `https://your-checker-name.railway.app`
4. **SAVE THIS URL**

### 3.5 Test Checker
1. Visit: `https://your-checker-name.railway.app/health`
2. Should return: `{"ok":true}`
3. Visit: `https://your-checker-name.railway.app/ready`
4. Should return: `{"ok":true,"policies":[...]}`

### 3.6 Update Backend Environment Variable
1. Go back to your **Backend service** in Railway
2. Go to **"Variables"** tab
3. Update `FORMAT_CHECKER_URL` to your checker URL:
   ```
   FORMAT_CHECKER_URL=https://your-checker-name.railway.app
   ```
4. Railway will automatically redeploy

---

## Step 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Account
1. Go to: https://vercel.com/
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended) or email
4. Verify your account

### 4.2 Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your GitHub repository (or upload)
3. Vercel will auto-detect it's a Vite project

### 4.3 Configure Project Settings
1. **Framework Preset:** Vite (auto-detected)
2. **Root Directory:** `CLIENT` (if monorepo)
3. **Build Command:** `npm run build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### 4.4 Configure Environment Variables
1. Go to **"Environment Variables"**
2. Add:
```env
VITE_API_BASE=https://your-api-name.railway.app
```
**Important:** Replace with your actual Railway backend URL!

### 4.5 Deploy
1. Click **"Deploy"**
2. Wait for build (2-3 minutes)
3. Vercel will give you a URL like: `https://your-app-name.vercel.app`
4. **SAVE THIS URL**

### 4.6 Update Backend CORS
1. Go back to Railway → Backend service
2. Go to **"Variables"** tab
3. Update:
   ```
   CORS_ORIGIN=https://your-app-name.vercel.app
   APP_BASE_URL=https://your-app-name.vercel.app
   ```
4. Railway will automatically redeploy

---

## Step 5: Final Configuration & Testing

### 5.1 Verify All Services
- ✅ MongoDB Atlas: Cluster running
- ✅ Backend API: `https://your-api.railway.app/health` works
- ✅ Checker: `https://your-checker.railway.app/health` works
- ✅ Frontend: `https://your-app.vercel.app` loads

### 5.2 Test Full Flow
1. Open your frontend URL
2. Try to login (use seeded admin: `admin@hilcoe.local` / `admin123`)
3. Test file upload
4. Test format checking
5. Check all features work

### 5.3 Seed Database (if needed)
If your database is empty, you may need to seed it:
1. Option 1: Run seed script locally pointing to Atlas
2. Option 2: Use Railway's console to run seed script
3. Option 3: Create admin user manually via API

---

## 🎉 You're Done!

Your application should now be live at:
- **Frontend:** https://your-app.vercel.app
- **Backend API:** https://your-api.railway.app
- **API Docs:** https://your-api.railway.app/docs
- **Checker:** https://your-checker.railway.app

---

## 📝 Important Notes

1. **Free Tier Limits:**
   - Railway: 500 hours/month (shared across services)
   - Vercel: Unlimited (with some bandwidth limits)
   - MongoDB Atlas: 512MB storage

2. **Custom Domain (Optional):**
   - Vercel: Add custom domain in project settings
   - Railway: Add custom domain in service settings
   - Update CORS_ORIGIN and APP_BASE_URL

3. **Monitoring:**
   - Railway dashboard shows service status
   - Vercel dashboard shows deployment status
   - Set up uptime monitoring (UptimeRobot - free)

4. **Backups:**
   - MongoDB Atlas: Automatic backups (paid) or manual export
   - Railway: No automatic backups (export data regularly)

---

## 🆘 Troubleshooting

**Backend won't start:**
- Check environment variables are set correctly
- Check MongoDB connection string
- Check logs in Railway dashboard

**Frontend can't connect to backend:**
- Check VITE_API_BASE is set correctly
- Check CORS_ORIGIN in backend includes frontend URL
- Check backend is running (visit /health endpoint)

**Checker not working:**
- Check FORMAT_CHECKER_URL in backend is correct
- Check checker service is running
- Check logs in Railway dashboard

**Database connection issues:**
- Verify MongoDB Atlas IP whitelist includes Railway IPs
- Check connection string format
- Verify database user credentials

---

Ready to start? Let's begin with Step 1! 🚀

