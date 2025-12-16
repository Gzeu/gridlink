DEPLOYMENT.md# Gridlink Deployment Guide

## 🚀 Quick Start - Deploy in 5 minutes

### Prerequisites
- Vercel account (free)
- GitHub repo pushed (done ✓)
- Environment variables prepared

### Step 1: Connect to Vercel
1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select `gridlink` repo
4. Click "Import"

### Step 2: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
DATABASE_URL=postgresql://[user]:[password]@[host]/gridlink
UPSTASH_REDIS_REST_URL=https://[cluster].upstash.io
UPSTASH_REDIS_REST_TOKEN=[your_token]
GOOGLE_SHEETS_API_KEY=[your_api_key]
NEXT_PUBLIC_EGLD_API_URL=https://devnet-api.multiversx.com
NEXT_PUBLIC_EGLD_CHAIN_ID=D
```

### Step 3: Deploy
Vercel auto-deploys on push to main. First deploy happens automatically after env vars set.

### Step 4: Setup Database
```bash
# After deployment, run migrations (if needed)
npm run db:push
```

## 📋 Pre-Deployment Checklist

- [x] All 21 commits pushed to GitHub
- [x] package.json has all scripts
- [x] .env.example configured
- [x] tsconfig.json set up
- [x] Vercel config added
- [x] GitHub Actions workflow ready
- [ ] Neon PostgreSQL created
- [ ] Upstash Redis created
- [ ] Google Sheets API key obtained
- [ ] MultiversX devnet account ready
- [ ] Environment variables added to Vercel
- [ ] Initial deploy completed

## 🔗 Resources

- **Neon**: https://console.neon.tech
- **Upstash**: https://console.upstash.com
- **Google Sheets API**: https://console.cloud.google.com
- **MultiversX**: https://devnet.multiversx.com
- **Vercel**: https://vercel.com/dashboard

## 🆘 Troubleshooting

### Build fails: "prisma generate"
- Solution: postinstall script runs automatically on Vercel

### Database connection error
- Check DATABASE_URL format
- Ensure IP whitelist configured in Neon

### API routes 404
- Clear browser cache
- Verify routes in src/app/api/

## ✅ Success Indicators

- Homepage loads at https://gridlink.vercel.app
- API endpoint responds: GET /api/sheets?sheetUrl=...
- Payment endpoint ready: POST /api/payments
- GitHub Actions workflow passing

---

**Total Setup Time**: ~10 minutes including account creation
**Estimated Cost**: $0 (all free tiers)
