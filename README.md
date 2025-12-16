# Gridlink

> Turn any Google Sheet into a REST API instantly | EGLD Payments | Free tier: 1000 API calls/month

## 🚀 Features

✨ **Instant API Generation** - Paste a Google Sheets URL → get a live REST API endpoint in seconds
⚡ **Lightning Fast** - Built on Neon PostgreSQL, Upstash Redis, and Vercel Edge
💳 **EGLD Payments** - Integrate crypto micropayments via MultiversX blockchain
🔒 **Secure & Scalable** - TypeScript, strict typing, audit logging, zero-cost infrastructure
📊 **Real-time Caching** - Redis-backed performance with 1-hour TTL
🎨 **Modern UI** - Dark theme with animations, fully responsive

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Neon PostgreSQL (free tier)
- **Cache**: Upstash Redis (free tier, 100 calls/day)
- **Blockchain**: MultiversX SDK (EGLD payments)
- **Deployment**: Vercel (free tier)

## 📋 Quick Start

### Prerequisites
```bash
Node.js 18+ 
Git
```

### Installation
```bash
# Clone repo
git clone https://github.com/Gzeu/gridlink.git
cd gridlink

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your credentials
```

### Environment Variables
Required:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `UPSTASH_REDIS_REST_URL` - Redis connection
- `UPSTASH_REDIS_REST_TOKEN` - Redis token
- `GOOGLE_SHEETS_API_KEY` - Google Sheets API key
- `NEXT_PUBLIC_EGLD_API_URL` - MultiversX API endpoint
- `NEXT_PUBLIC_EGLD_CHAIN_ID` - D for devnet, 1 for mainnet

### Development
```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
```

## 🔗 API Endpoints

### GET /api/sheets
Fetch data from a Google Sheet
```bash
curl "http://localhost:3000/api/sheets?sheetUrl=https://docs.google.com/spreadsheets/d/..."
```

### POST /api/sheets
Append rows to a Google Sheet
```bash
curl -X POST http://localhost:3000/api/sheets \
  -H "Content-Type: application/json" \
  -d '{"sheetUrl":"...","values":["data1","data2"],"egldAddress":"erd1..."}'  
```

### POST /api/payments
Initiate EGLD payment
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{"amount":"0.5","recipientAddress":"erd1...","egldAddress":"erd1..."}'
```

## 📁 Project Structure

```
gridlink/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── sheets/route.ts      # Google Sheets API
│   │   │   └── payments/route.ts    # EGLD payments
│   │   ├── page.tsx                 # Homepage
│   │   ├── layout.tsx               # Root layout
│   │   └── globals.css              # Tailwind CSS
│   └── lib/
│       ├── db.ts                    # Prisma client
│       ├── redis.ts                 # Upstash Redis
│       ├── multiversx.ts            # EGLD blockchain
│       └── googleSheets.ts          # Google Sheets CRUD
├── prisma/
│   └── schema.prisma                # Database schema
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
└── .env.example
```

## 🚢 Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Add environment variables in Vercel dashboard → Settings → Environment Variables

## 💡 Usage Example

1. Create a Google Sheet with data
2. Get your sheet URL
3. Visit https://gridlink.vercel.app
4. Paste the URL → Click "Generate API"
5. Copy the API endpoint
6. Use REST API: `GET /api/sheets?sheetUrl=YOUR_SHEET_URL`

## 🤝 Contributing

Fork this repo and submit a PR! Areas to improve:
- [ ] Google Sheets OAuth integration
- [ ] Advanced filtering/sorting
- [ ] Export to CSV/JSON
- [ ] Webhooks for real-time updates
- [ ] Smart contract integration

## 📄 License

MIT - See LICENSE file for details

## 👨‍💻 Author

Built by **Gzeu** - Full-stack Web3 developer
- GitHub: [@Gzeu](https://github.com/Gzeu)
- Twitter: [@Gzeu_Dev](https://twitter.com/Gzeu_Dev)

## 🙏 Acknowledgments

Thanks to:
- **Neon** for free PostgreSQL
- **Upstash** for free Redis
- **Vercel** for free hosting
- **MultiversX** for EGLD blockchain
- **Google** for Sheets API

---

⭐ If you find this useful, star the repo! Help us reach 100 stars! 🚀
