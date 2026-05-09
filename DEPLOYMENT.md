# 🚀 Deployment Guide - Vercel & Free Hosting Options

This guide covers deploying your Image Converter project on Vercel and other free platforms.

## Option 1: Deploy Frontend on Vercel + Backend on Render.com (Recommended)

This is the best approach for free deployment as both services offer free tiers.

### Step 1: Deploy Frontend on Vercel

#### 1.1 Push your code to GitHub

If not already done:

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/img-converter.git
git branch -M main
git push -u origin main
```

#### 1.2 Deploy Frontend on Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign up"** → Choose **"Continue with GitHub"**
3. Authorize Vercel to access your GitHub account
4. Click **"Import Project"**
5. Find and select your `img-converter` repository
6. **Configure the project:**
   - Framework: `Create React App`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
7. Click **"Deploy"**

Your frontend will be live at: `https://your-project-name.vercel.app`

---

### Step 2: Deploy Backend on Render.com

#### 2.1 Create Render Account

1. Go to [render.com](https://render.com)
2. Click **"Sign up"** → Choose **"Continue with GitHub"**
3. Authorize and complete signup

#### 2.2 Deploy Express Server

1. Click **"New"** → Select **"Web Service"**
2. Select your `img-converter` repository
3. **Configure as follows:**
   - **Name:** `img-converter-api`
   - **Environment:** `Node`
   - **Build Command:** `cd server && npm install`
   - **Start Command:** `cd server && npm start`
   - **Root Directory:** `/` (leave blank)
4. Click **"Create Web Service"**

Your backend API will be live at: `https://img-converter-api.onrender.com`

#### 2.3 Update Frontend to Use Deployed Backend

After the backend is deployed, update your React app to use the production API URL:

Edit `client/src/components/ImageConverter.js`:

Find this line:
```javascript
const response = await axios.post('/api/convert', formData, {
```

Change it to use the full API URL. But first, let's make it configurable:

---

### Step 3: Configure Environment Variables

#### 3.1 Update Frontend for Production

Create `client/.env.production`:

```
REACT_APP_API_URL=https://img-converter-api.onrender.com
```

#### 3.2 Update ImageConverter.js to use environment variable

Replace these lines in `client/src/components/ImageConverter.js`:

```javascript
// Change all axios calls to use the API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Then use it like:
const response = await axios.post(`${API_URL}/api/convert`, formData, {
```

#### 3.3 Update .env on Render

In your Render dashboard:
1. Go to your `img-converter-api` service
2. Click **"Environment"**
3. Add variable: `PORT=5000`
4. Click **"Save Changes"**

---

### Step 4: Update Server CORS Settings

Edit `server/index.js` and update the CORS configuration:

```javascript
const corsOptions = {
  origin: ['https://your-project-name.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST'],
  credentials: true
};

app.use(cors(corsOptions));
```

---

## Option 2: Deploy Everything on Vercel (Using Serverless Functions)

### Advantages:
- Single platform
- Better integration
- Faster cold starts with same vendor

### Disadvantages:
- Need to restructure the project
- Express converted to serverless functions

**This requires significant refactoring** - Contact if you want detailed steps for this approach.

---

## Option 3: Use Railway.app (Alternative to Render)

### Deploy Backend on Railway

1. Go to [railway.app](https://railway.app)
2. Click **"Login"** → **"Login with GitHub"**
3. Click **"New Project"** → **"Deploy from GitHub repo"**
4. Select your repository
5. Configure the same way as Render

Your backend will be at: `https://your-service.railway.app`

---

## ✅ Final Setup Steps

### Step 1: Update Frontend Code

Update `client/src/components/ImageConverter.js`:

```javascript
// At the top of the component
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Replace all axios calls from '/api/...' to use API_URL
// OLD: await axios.post('/api/convert', formData, {...})
// NEW: await axios.post(`${API_URL}/api/convert`, formData, {...})
```

### Step 2: Create Environment Files

**`client/.env.development`:**
```
REACT_APP_API_URL=http://localhost:5000
```

**`client/.env.production`:**
```
REACT_APP_API_URL=https://img-converter-api.onrender.com
```

### Step 3: Commit and Push

```bash
git add .
git commit -m "Add deployment configuration"
git push
```

The changes will automatically deploy on both Vercel and Render!

---

## 🔍 Verification

After deployment:

1. **Test Frontend:** Visit `https://your-project-name.vercel.app`
2. **Test API:** Visit `https://img-converter-api.onrender.com/api/health`
   - Should return: `{"status":"Server is running"}`
3. **Test Conversion:** Upload images on the live frontend

---

## ⚠️ Important Notes

### File Storage
- **Free tier limitations:**
  - Render/Railway: 500MB ephemeral storage (files deleted on restart)
  - Vercel: Serverless has limited storage

- **Solution:** Implement cloud storage (AWS S3, Cloudinary, or Supabase for free tier)

### Timeout Issues
- Vercel functions: 10-second timeout (free tier)
- Render: 30-minute timeout

- **Solution:** For large conversions, use background jobs or increase timeout on paid plans

### Large File Uploads
- **Limitation:** 100MB max on Vercel, 50MB on Render free tier
- **Solution:** Implement chunked uploads or use paid tiers

---

## 🚨 Troubleshooting

### Issue: "CORS error" or "Network error"
**Solution:** 
- Check the CORS origin in `server/index.js`
- Ensure backend URL is correct in frontend `.env` files
- Check that backend is running (test `/api/health`)

### Issue: "Converted images not downloading"
**Solution:**
- ZIP file generation requires temporary storage
- For production, implement S3 or cloud storage
- Or use smaller batch sizes

### Issue: Backend taking too long
**Solution:**
- Render/Vercel have timeout limits
- Process images in smaller batches
- Upgrade to paid tier for longer processing

---

## 💡 Production Improvements

For better production performance, consider:

1. **Add Cloud Storage:**
   - AWS S3 (free tier: 5GB)
   - Cloudinary (free tier: 25GB)
   - Supabase Storage

2. **Add Authentication:**
   - Prevent abuse
   - Track user conversions

3. **Add Rate Limiting:**
   - Protect backend from spam

4. **Implement Caching:**
   - Store frequently converted images

5. **Use CDN:**
   - Vercel provides built-in CDN
   - Faster image delivery

---

## 📋 Quick Reference

| Service | Frontend | Backend | Cost | Features |
|---------|----------|---------|------|----------|
| **Vercel** | ✅ Free | ⚠️ Limited | Free | Fast, easy to use |
| **Render** | ⚠️ Limited | ✅ Free | Free | Easier for Express |
| **Railway** | ⚠️ Limited | ✅ Free | Free | $5/month after free tier |
| **Heroku** | ⚠️ No Free | ❌ No Free | Paid | Used to have free tier |

**Recommendation:** Vercel (Frontend) + Render (Backend) = Best combination for free tier.

---

## 🆘 Need Help?

If you encounter issues:

1. Check your Vercel/Render logs
2. Test the backend locally with `npm start`
3. Verify environment variables are set correctly
4. Check browser console (F12) for detailed errors

---

Enjoy your deployed app! 🎉
