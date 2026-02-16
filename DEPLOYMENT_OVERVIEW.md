# 🚀 HiLCoE-RMS Deployment Overview

## 📋 What You're Deploying

You have **3 separate services** that need to be deployed:

1. **Frontend (CLIENT)** - React + Vite application
2. **Backend (API)** - Node.js + Express REST API
3. **Checker** - Python FastAPI service for format validation

---

## 🎯 Deployment Options

### **Option 1: Platform-as-a-Service (PaaS) - RECOMMENDED for Beginners**
**Best for:** Quick deployment, minimal server management

#### **Recommended Platforms:**
- **Vercel/Netlify** - Frontend (free tier available)
- **Railway/Render** - Backend & Checker (free tier available)
- **Heroku** - All services (paid, but reliable)

**Pros:**
- ✅ Easy setup, minimal configuration
- ✅ Automatic HTTPS/SSL certificates
- ✅ Built-in CI/CD
- ✅ Free tiers available
- ✅ No server management needed

**Cons:**
- ❌ Can be expensive at scale
- ❌ Less control over infrastructure

---

### **Option 2: Virtual Private Server (VPS)**
**Best for:** Full control, cost-effective long-term

#### **Recommended Providers:**
- **DigitalOcean** ($6-12/month)
- **Linode/Akamai** ($5-10/month)
- **AWS EC2** (pay-as-you-go)
- **Azure VM** (pay-as-you-go)

**Pros:**
- ✅ Full control over environment
- ✅ Cost-effective for long-term
- ✅ Can host all services on one server
- ✅ Custom configurations possible

**Cons:**
- ❌ Requires server management
- ❌ Need to set up SSL certificates (Let's Encrypt)
- ❌ Need to configure reverse proxy (Nginx)
- ❌ More technical setup

---

### **Option 3: Container Orchestration (Advanced)**
**Best for:** Production, scalability, microservices

#### **Platforms:**
- **Docker Compose** (single server)
- **Kubernetes** (AWS EKS, Google GKE, Azure AKS)
- **Docker Swarm**

**Pros:**
- ✅ Scalable and production-ready
- ✅ Easy to manage multiple services
- ✅ Good for microservices architecture

**Cons:**
- ❌ Complex setup
- ❌ Requires Docker knowledge
- ❌ More expensive

---

## 📦 What Each Service Needs

### **1. Frontend (CLIENT)**
- **Build:** Static files (HTML, CSS, JS)
- **Hosting:** Static file hosting (CDN)
- **Environment Variables:**
  - `VITE_API_BASE` - Backend API URL
- **Port:** None (static files)
- **Dependencies:** None at runtime (pre-built)

### **2. Backend (API)**
- **Runtime:** Node.js 18+
- **Port:** 4000 (configurable via `PORT` env var)
- **Environment Variables Required:**
  - `MONGO_URI` - MongoDB connection string ⚠️ **REQUIRED**
  - `JWT_SECRET` - Secret for JWT tokens ⚠️ **REQUIRED**
  - `PORT` - Server port (default: 4000)
  - `NODE_ENV` - `production` or `development`
  - `CORS_ORIGIN` - Frontend URL(s)
  - `APP_BASE_URL` - Frontend base URL
  - `STORAGE_DIR` - File storage path
  - `FORMAT_CHECKER_URL` - Checker service URL
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - Email (optional)

### **3. Checker**
- **Runtime:** Python 3.8+ (or Docker)
- **Port:** 8001
- **Environment Variables:**
  - `POLICY_DIR` - Path to policy files (optional)
  - `POLICY_CACHE_TTL_SECONDS` - Cache TTL (optional)
- **Dependencies:** FastAPI, uvicorn, python-docx, PyPDF2

---

## 🔗 Service Communication

```
Frontend (Browser)
    ↓ HTTP Requests
Backend API (Port 4000)
    ↓ HTTP Requests
Checker Service (Port 8001)
```

**Important:** 
- Frontend calls Backend API
- Backend API calls Checker Service
- All services need to be accessible to each other

---

## 🗄️ Database Requirements

**MongoDB** - You have two options:

1. **MongoDB Atlas** (Cloud - Recommended)
   - Free tier available (512MB)
   - Managed service
   - Automatic backups
   - Connection string: `mongodb+srv://...`

2. **Self-hosted MongoDB**
   - Install on your VPS
   - More control
   - Need to manage backups yourself

---

## 📝 Pre-Deployment Checklist

### **Before You Start:**
- [ ] Choose deployment platform(s)
- [ ] Have MongoDB Atlas account (or plan for self-hosted)
- [ ] Have domain name (optional, but recommended)
- [ ] Prepare environment variables
- [ ] Test build locally (`npm run build` in CLIENT)
- [ ] Test API locally
- [ ] Test Checker locally

### **Environment Variables to Prepare:**

**Backend (.env):**
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/hilcoe_rms
JWT_SECRET=your-super-secret-jwt-key-change-this
PORT=4000
NODE_ENV=production
CORS_ORIGIN=https://your-frontend-domain.com
APP_BASE_URL=https://your-frontend-domain.com
FORMAT_CHECKER_URL=https://your-checker-domain.com
STORAGE_DIR=/app/storage
```

**Frontend (.env):**
```env
VITE_API_BASE=https://your-backend-api.com
```

---

## 🛠️ Deployment Steps Overview

### **General Flow:**
1. **Prepare Code**
   - Build frontend
   - Ensure all dependencies are in package.json
   - Test everything locally

2. **Set Up Infrastructure**
   - Create accounts on chosen platforms
   - Set up MongoDB (Atlas or self-hosted)
   - Configure domains/URLs

3. **Deploy Services**
   - Deploy Backend API
   - Deploy Checker Service
   - Deploy Frontend
   - Configure environment variables

4. **Connect Services**
   - Update CORS settings
   - Update API URLs
   - Test connections

5. **Final Testing**
   - Test all endpoints
   - Test file uploads
   - Test format checking
   - Test authentication

---

## 💰 Cost Estimates

### **Free Tier Option:**
- **Frontend:** Vercel/Netlify (Free)
- **Backend:** Railway/Render (Free tier: 500 hours/month)
- **Checker:** Railway/Render (Free tier: 500 hours/month)
- **Database:** MongoDB Atlas (Free tier: 512MB)
- **Total:** $0/month (with limitations)

### **Paid Option (VPS):**
- **VPS:** $6-12/month (DigitalOcean/Linode)
- **Domain:** $10-15/year
- **Database:** MongoDB Atlas Free tier or included in VPS
- **Total:** ~$6-12/month

---

## ⚠️ Important Considerations

1. **File Storage:** Backend stores files in `STORAGE_DIR`. For production, consider:
   - Cloud storage (AWS S3, Google Cloud Storage)
   - Persistent volumes on VPS
   - Network-attached storage

2. **SSL/HTTPS:** Essential for production
   - PaaS platforms provide automatically
   - VPS requires Let's Encrypt setup

3. **Environment Variables:** Never commit `.env` files to Git
   - Use platform's environment variable settings
   - Keep secrets secure

4. **Database Backups:** Set up regular backups
   - MongoDB Atlas: Automatic
   - Self-hosted: Manual or cron jobs

5. **Monitoring:** Consider adding:
   - Uptime monitoring (UptimeRobot - free)
   - Error tracking (Sentry - free tier)
   - Log aggregation

---

## 🎯 Recommended Approach for You

**For a first-time deployment, I recommend:**

1. **Frontend:** Vercel or Netlify (easiest, free)
2. **Backend:** Railway or Render (easy, free tier)
3. **Checker:** Railway or Render (same as backend)
4. **Database:** MongoDB Atlas (free tier)

**Why?**
- ✅ All free to start
- ✅ Easy setup with good documentation
- ✅ Automatic HTTPS
- ✅ No server management
- ✅ Can upgrade later if needed

---

## 📚 Next Steps

Once you choose your platform, we'll:
1. Create deployment configurations
2. Set up environment variables
3. Deploy each service step-by-step
4. Test and verify everything works
5. Set up monitoring (optional)

**Ready to start?** Let me know which deployment option you prefer, and we'll begin! 🚀

