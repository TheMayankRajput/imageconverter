# 🚀 Deployment Checklist

Follow these steps to deploy your Image Converter on Vercel + Render for free.

## Pre-Deployment Checklist

- [ ] Code is committed to GitHub
- [ ] All environment files created (`.env.development`, `.env.production`)
- [ ] Project tested locally and working
- [ ] Sensitive data not committed to GitHub

## Deployment Steps

### Step 1: Frontend Deployment (Vercel)

- [ ] Go to https://vercel.com
- [ ] Sign up/Login with GitHub
- [ ] Click "Add New" → "Project"
- [ ] Import your `img-converter` repository
- [ ] **Framework:** Select "Create React App"
- [ ] **Root Directory:** Select `client`
- [ ] **Build Command:** `npm run build`
- [ ] Click "Deploy"
- [ ] ✅ Frontend deployed at: `https://your-project-name.vercel.app`

### Step 2: Backend Deployment (Render)

- [ ] Go to https://render.com
- [ ] Sign up/Login with GitHub
- [ ] Click "New" → "Web Service"
- [ ] Select your `img-converter` repository
- [ ] **Name:** `img-converter-api`
- [ ] **Environment:** `Node`
- [ ] **Build Command:** `cd server && npm install`
- [ ] **Start Command:** `cd server && npm start`
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (2-3 minutes)
- [ ] ✅ Backend deployed at: `https://img-converter-api.onrender.com`

### Step 3: Configure Frontend Environment

- [ ] Update `client/.env.production`:
  ```
  REACT_APP_API_URL=https://img-converter-api.onrender.com
  ```
- [ ] Commit and push to GitHub
- [ ] Vercel will auto-redeploy ✅

### Step 4: Verify Deployment

- [ ] Test frontend: Visit `https://your-project-name.vercel.app`
- [ ] Test backend health: Visit `https://img-converter-api.onrender.com/api/health`
- [ ] Test image upload: Upload images on live frontend
- [ ] Download converted images as ZIP

## Post-Deployment

### Monitor Your App

- [ ] Check Vercel logs for frontend errors
- [ ] Check Render logs for backend errors
- [ ] Monitor application performance

### Set Up Auto-Deployment

- [x] Both Vercel and Render auto-deploy on GitHub push

### Enable Notifications

- [ ] Vercel: Go to Project Settings → Notifications
- [ ] Render: Go to Service Settings → Alerts

## Free Tier Limitations

⚠️ **Be aware of these limits:**

- **Vercel:** 12 serverless function executions/second
- **Render:** Services spin down after 15 min of inactivity
- **Storage:** Ephemeral (files deleted on restart)
- **Bandwidth:** Limited on free tier

## Optimize for Production

- [ ] Implement cloud storage (S3, Cloudinary)
- [ ] Add rate limiting
- [ ] Implement caching
- [ ] Set up error monitoring (Sentry)
- [ ] Monitor API performance

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CORS Error | Check API_URL in `.env.production` |
| Download Fails | Clear browser cache, test with smaller files |
| Backend Timeout | Process smaller image batches |
| Files Missing After Restart | Use cloud storage instead of ephemeral |

## Cost Estimate

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Vercel | Unlimited deployments | $20/month |
| Render | 750 hours/month | $7/month |
| **Total** | **Free** | **$27+/month** |

## Next Steps

1. Deploy to both services (today!)
2. Share your live app URL
3. Monitor logs for the first 24 hours
4. Gather user feedback
5. Plan premium features for paid tier

---

**Deployment Time:** ~5-10 minutes
**Difficulty:** ⭐⭐ Easy
**Free Cost:** $0

Happy deploying! 🎉
