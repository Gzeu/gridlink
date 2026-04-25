# GridLink

**Turn any Google Sheet into a REST API in 60 seconds.**

GridLink is the bridge between Google Sheets and real applications. Paste a sheet URL, get a production-ready JSON API endpoint — with caching, rate limiting, filtering, pagination, and EGLD-based tier upgrades built in.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Gzeu/gridlink)

---

## Why GridLink?

- **No backend required.** Your Google Sheet is already your database.
- **Instant API.** One API key, one endpoint, done.
- **Built for Web3.** Pay with EGLD (MultiversX) to unlock higher quotas — no credit cards.
- **Caching out of the box.** Redis caching means your Sheet is hit once every 5 minutes, not on every request.

---

## Quickstart

### 1. Share your sheet

Share your Google Sheet with the service account:
```
gridlink@your-gcp-project.iam.gserviceaccount.com
```
(Viewer access is enough for read-only APIs.)

### 2. Create an API key

```bash
curl -X POST https://gridlink.vercel.app/api/keys \
  -H "Content-Type: application/json" \
  -d '{ "userId": 1, "sheetUrl": "https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit" }'
```

Response:
```json
{
  "success": true,
  "data": {
    "apiKey": "gl_abc123...",
    "endpoint": "https://gridlink.vercel.app/api/sheets?sheetId=YOUR_SHEET_ID"
  }
}
```

### 3. Hit your endpoint

```bash
curl -H "x-api-key: gl_abc123" \
  "https://gridlink.vercel.app/api/sheets?sheetId=YOUR_SHEET_ID&limit=10"
```

---

## API Reference

### `GET /api/sheets`

| Parameter  | Type   | Description                               |
|------------|--------|-------------------------------------------|
| `sheetId`  | string | Google Sheet ID (required)                |
| `sheetUrl` | string | Full Google Sheets URL (alternative)      |
| `tab`      | string | Tab/sheet name (default: Sheet1)          |
| `page`     | number | Page number for pagination (default: 1)   |
| `limit`    | number | Rows per page, max 100 (default: 50)      |
| `sortBy`   | string | Column name to sort by                    |
| `order`    | string | `asc` or `desc` (default: asc)            |
| `filter`   | string | `column:value` — case-insensitive filter  |

**Headers:** `x-api-key: gl_...`

**Response:**
```json
{
  "success": true,
  "data": {
    "rows": [
      { "_id": 2, "Name": "Alice", "Score": "95", "Status": "active" }
    ],
    "pagination": { "page": 1, "limit": 50, "total": 120, "pages": 3, "hasNext": true },
    "meta": { "sheetId": "...", "tab": "Sheet1", "cached": true, "remaining": 873 }
  },
  "error": null
}
```

### `POST /api/keys` — Create API key
### `DELETE /api/keys?apiKey=gl_...` — Revoke key
### `POST /api/payments/verify` — Verify EGLD tx and upgrade tier

---

## Pricing

| Tier       | Cost         | Calls/month | APIs |
|------------|--------------|-------------|------|
| Free       | Free         | 1,000        | 3    |
| Pro        | 0.5 EGLD     | 10,000       | ∞    |
| Enterprise | 2.0 EGLD     | Unlimited    | ∞    |

To upgrade, send EGLD from [xPortal](https://xportal.com) to the GridLink wallet, then call `POST /api/payments/verify` with your `txHash`.

---

## Code Examples

```bash
# cURL
curl -H "x-api-key: gl_yourkey" \
  "https://gridlink.vercel.app/api/sheets?sheetId=SHEET_ID&filter=status:active&sortBy=Name"
```

```javascript
// JavaScript
const { data } = await fetch(
  'https://gridlink.vercel.app/api/sheets?sheetId=SHEET_ID&limit=10',
  { headers: { 'x-api-key': 'gl_yourkey' } }
).then(r => r.json());

console.log(data.rows); // [{ _id: 2, Name: 'Alice', Score: '95' }]
```

```python
# Python
import requests

r = requests.get(
    'https://gridlink.vercel.app/api/sheets',
    params={'sheetId': 'SHEET_ID', 'filter': 'status:active', 'page': '1'},
    headers={'x-api-key': 'gl_yourkey'}
)
print(r.json()['data']['rows'])
```

---

## Self-Hosting

### Prerequisites

- Node.js 18+, pnpm
- PostgreSQL database
- Redis instance (Upstash for Vercel)
- Google Cloud service account with Sheets API enabled
- MultiversX wallet address (for payment collection)

### Setup

```bash
git clone https://github.com/Gzeu/gridlink
cd gridlink
pnpm install
cp .env.example .env.local
# fill in .env.local
pnpm prisma migrate dev
pnpm dev
```

### Deploy to Vercel

1. Click the **Deploy with Vercel** button above
2. Add all environment variables from `.env.example`
3. Connect a Postgres database (Vercel Postgres or Supabase)
4. Connect Upstash Redis
5. Deploy

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Cache:** Redis (Upstash)
- **Auth:** Clerk
- **Payments:** MultiversX SDK (EGLD)
- **Google API:** googleapis v4
- **Deploy:** Vercel

---

Built by [@Gzeu](https://github.com/Gzeu)
