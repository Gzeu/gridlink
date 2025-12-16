# Gridlink - Implementation Guide

## Core Architecture

Gridlink is a no-code backend platform that converts Google Sheets into REST APIs with EGLD blockchain payment integration.

### Tech Stack
- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: Neon PostgreSQL (free tier)
- **Cache**: Upstash Redis (free tier)
- **Blockchain**: MultiversX SDK (EGLD)
- **Deployment**: Vercel

## API Endpoints

### 1. GET /api/sheets
Fetch data from a Google Sheet with Redis caching

**Query Parameters:**
- `sheetUrl` (required): Google Sheets URL

**Response:**
```json
{
  "data": [["col1", "col2"], ["val1", "val2"]],
  "cached": false,
  "timestamp": "2025-12-16T17:00:00Z"
}
```

**Cache Strategy**: 1-hour TTL, invalidated on POST

### 2. POST /api/sheets
Append rows to a Google Sheet

**Body:**
```json
{
  "sheetUrl": "https://docs.google.com/spreadsheets/d/...",
  "values": ["value1", "value2"],
  "egldAddress": "erd1..."
}
```

### 3. POST /api/payments
Initiate EGLD payment

**Body:**
```json
{
  "amount": "0.5",
  "recipientAddress": "erd1...",
  "egldAddress": "erd1...",
  "description": "Payment description"
}
```

### 4. GET /api/payments
Check payment status

**Query Parameters:**
- `txHash` (required): Transaction hash

## Database Schema

### Models

**ApiCall**
- id: UUID
- sheetId: String
- method: String (GET/POST)
- endpoint: String
- status: Int
- cachedFromRedis: Boolean
- egldAddress: String (optional)
- createdAt: DateTime

**Payment**
- id: UUID
- senderAddress: String
- receiverAddress: String
- amount: Decimal
- transactionHash: String
- status: String (pending/confirmed/failed)
- description: String (optional)
- createdAt: DateTime
- updatedAt: DateTime

## Required Environment Variables

```bash
# Database
DATABASE_URL=postgresql://user:password@host/dbname

# Redis
UPSTASH_REDIS_REST_URL=https://us1-healthy-hamster-xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxxx

# Google Sheets
GOOGLE_SHEETS_API_KEY=xxxxx

# MultiversX
NEXT_PUBLIC_EGLD_API_URL=https://devnet-api.multiversx.com
NEXT_PUBLIC_EGLD_CHAIN_ID=D  # D for devnet, 1 for mainnet
```

## Setup Instructions

### 1. Local Development
```bash
git clone https://github.com/Gzeu/gridlink.git
cd gridlink
npm install
cp .env.example .env.local
# Edit .env.local with your credentials
npm run dev
```

### 2. Database Setup (Neon)
1. Create account at https://console.neon.tech
2. Create PostgreSQL database
3. Get connection string: postgresql://...
4. Copy to DATABASE_URL in .env.local
5. Run `npx prisma migrate dev`

### 3. Redis Setup (Upstash)
1. Create account at https://console.upstash.com
2. Create Redis database
3. Get REST endpoint and token
4. Copy to UPSTASH_REDIS_* variables

### 4. Google Sheets API
1. Go to https://console.cloud.google.com
2. Create project
3. Enable Google Sheets API
4. Create API key (restrict to Sheets API)
5. Copy to GOOGLE_SHEETS_API_KEY

### 5. MultiversX Setup
1. Get API URL: https://devnet-api.multiversx.com
2. For production: https://api.multiversx.com

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Add environment variables in Vercel dashboard
# Settings > Environment Variables
```

## Testing API Endpoints

### Fetch Sheet Data
```bash
curl "http://localhost:3000/api/sheets?sheetUrl=https://docs.google.com/spreadsheets/d/ABC123/edit"
```

### Append Data
```bash
curl -X POST http://localhost:3000/api/sheets \
  -H "Content-Type: application/json" \
  -d '{
    "sheetUrl": "https://docs.google.com/spreadsheets/d/ABC123/edit",
    "values": ["col1", "col2"],
    "egldAddress": "erd1..."
  }'
```

### Send Payment
```bash
curl -X POST http://localhost:3000/api/payments \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "0.5",
    "recipientAddress": "erd1...",
    "egldAddress": "erd1...",
    "description": "Test payment"
  }'
```

## Next Steps

- [ ] Implement homepage UI component
- [ ] Add Google Sheets OAuth2 authentication
- [ ] Implement real-time WebSocket updates
- [ ] Add export to CSV/JSON features
- [ ] Create admin dashboard
- [ ] Implement webhook system
- [ ] Add multi-sheet support
- [ ] Implement payment escrow system
