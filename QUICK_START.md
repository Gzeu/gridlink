# Gridlink - Quick Start (5 Minutes)

> Get Gridlink running locally in 5 minutes. Zero configuration headaches.

## ⚡ Prerequisites

- Node.js 18+ installed ([download](https://nodejs.org))
- Git installed
- Terminal/Command Prompt open

## 🚀 Step 1: Clone & Install (1 minute)

```bash
# Clone repository
git clone https://github.com/Gzeu/gridlink.git
cd gridlink

# Install dependencies
npm install
```

## 🔑 Step 2: Setup Environment (2 minutes)

### Quick Setup (Test Mode)
```bash
# Copy example environment file
cp .env.example .env.local
```

**For testing**, you can use these **temporary demo values**:

```bash
# .env.local (DEMO MODE - Replace later)
DATABASE_URL="postgresql://demo:demo@localhost:5432/gridlink"
UPSTASH_REDIS_REST_URL="http://localhost:6379"
UPSTASH_REDIS_REST_TOKEN="demo-token"
GOOGLE_SHEETS_API_KEY="demo-key"
NEXT_PUBLIC_EGLD_API_URL="https://devnet-api.multiversx.com"
NEXT_PUBLIC_EGLD_CHAIN_ID="D"
```

### Production Setup (Recommended)

Get real credentials (5 minutes each):

#### 🐘 Neon PostgreSQL (Free)
1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create new project → Copy connection string
4. Paste into `DATABASE_URL`

#### ⚡ Upstash Redis (Free)
1. Go to [upstash.com](https://upstash.com)
2. Sign up with GitHub
3. Create Redis database → Copy REST URL + Token
4. Paste into `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN`

#### 📊 Google Sheets API (Free)
1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project
3. Enable "Google Sheets API"
4. Create credentials → API Key
5. Restrict to Sheets API only
6. Paste into `GOOGLE_SHEETS_API_KEY`

## 🗄️ Step 3: Setup Database (1 minute)

```bash
# Generate Prisma client
npx prisma generate

# Push database schema
npx prisma db push

# (Optional) Open database UI
npm run db:studio
```

## 🎉 Step 4: Run Development Server (1 minute)

```bash
# Start Next.js development server
npm run dev
```

**Open browser**: [http://localhost:3000](http://localhost:3000)

---

## ✅ What You Should See

### Homepage (localhost:3000)
- Animated hero section with gradient background
- Google Sheets URL input field
- "Generate API" button

### Dashboard (localhost:3000/dashboard)
- 4 metric cards (Total Calls, Cached, Response Time, Remaining)
- Active sheet mappings
- Recent API calls timeline
- Payment history

### Analytics (localhost:3000/analytics)
- Usage trend line chart
- HTTP method pie chart
- Status code bar chart

---

## 🧪 Test the API

### Test 1: Generate API Endpoint
1. Open [http://localhost:3000](http://localhost:3000)
2. Paste this public sheet:
   ```
   https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   ```
3. Click "Generate API"
4. Copy the generated endpoint

### Test 2: Fetch Sheet Data
```bash
curl "http://localhost:3000/api/sheets?sheetUrl=https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit"
```

### Test 3: Check Dashboard Stats
```bash
curl http://localhost:3000/api/dashboard/stats
```

---

## 🐛 Common Issues

### Issue: "Prisma Client not generated"
**Fix**:
```bash
npx prisma generate
```

### Issue: "Can't connect to database"
**Fix**: Check `DATABASE_URL` in `.env.local`. Use demo URL for testing or create Neon database.

### Issue: "Redis connection failed"
**Fix**: Redis is optional for local dev. App will work without it (no caching).

### Issue: "Google Sheets API error"
**Fix**: 
- Ensure API key is valid
- Check if Sheets API is enabled in Google Cloud Console
- Make sure sheet is public or shared

### Issue: "Port 3000 already in use"
**Fix**:
```bash
# Use different port
PORT=3001 npm run dev
```

---

## 🚀 Next Steps

### Local Development
1. ✅ App is running on `localhost:3000`
2. 📝 Edit files in `src/app/` - hot reload enabled
3. 🎨 Modify styles in `src/app/globals.css`
4. 🔧 Add features in `src/app/api/`

### Deploy to Production
1. Push to GitHub (if not already)
2. Connect Vercel account
3. Import Gridlink repository
4. Add environment variables
5. Deploy!

**Detailed deployment guide**: See [DEPLOYMENT.md](./DEPLOYMENT.md)

---

## 📚 Additional Resources

- **Full Documentation**: [README.md](./README.md)
- **Implementation Guide**: [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)
- **Dashboard Guide**: [DASHBOARD_GUIDE.md](./DASHBOARD_GUIDE.md)
- **UI Features**: [UI_FEATURES.md](./UI_FEATURES.md)
- **Production Checklist**: [PRODUCTION_CHECKLIST.md](./PRODUCTION_CHECKLIST.md)

---

## 💬 Need Help?

- **GitHub Issues**: [github.com/Gzeu/gridlink/issues](https://github.com/Gzeu/gridlink/issues)
- **Twitter**: [@Gzeu_Dev](https://twitter.com/Gzeu_Dev)
- **Email**: contact@gridlink.io

---

**Built with ❤️ by [Gzeu](https://github.com/Gzeu)** | **Star ⭐ the repo if this helped!**
