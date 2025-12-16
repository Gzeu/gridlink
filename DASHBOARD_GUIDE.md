# Gridlink Dashboard Guide

## 📊 Dashboard Overview

The Gridlink Dashboard provides real-time monitoring and management for your API infrastructure, with comprehensive analytics, sheet mappings, and payment tracking.

## 🎯 Features

### 1. Real-Time Statistics

#### Key Metrics Cards
- **Total API Calls**: Lifetime API request count with month-over-month growth indicator
- **Cached Responses**: Redis cache hits with percentage rate
- **Avg Response Time**: Performance metrics in milliseconds with success rate
- **Calls Remaining**: Free tier quota (1000/month) with visual progress bar

#### Stats Calculation
```typescript
// From /api/dashboard/stats
{
  totalCalls: 1247,           // All-time requests
  cachedCalls: 891,           // Redis hits
  callsThisMonth: 247,        // Current month usage
  remainingCalls: 753,        // 1000 - callsThisMonth
  successRate: 99,            // (2xx status codes / total) * 100
  avgResponseTime: 89,        // Mean response time in ms
  cacheHitRate: 71            // (cachedCalls / totalCalls) * 100
}
```

### 2. Active Sheet Mappings

#### Sheet Management Interface
Each mapped Google Sheet displays:
- **Sheet ID**: Unique identifier from database
- **Source URL**: Original Google Sheets link (clickable)
- **API Endpoint**: Generated REST API URL
- **Total Calls**: Request count per sheet
- **Last Accessed**: Relative time ("2m ago", "1h ago")

#### Actions
- **External Link Icon**: Opens Google Sheet in new tab
- **Delete Button**: Removes mapping with confirmation toast

### 3. Recent API Calls Timeline

#### Call Details Display
- **Method Badge**: Color-coded (GET=green, POST=blue, PUT=purple, DELETE=red)
- **Status Code**: Success (200-299=green) or Error (400+=red)
- **Cache Indicator**: Purple lightning bolt for cached responses
- **Endpoint Path**: Monospace font display
- **EGLD Address**: Truncated wallet address if payment-linked
- **Timestamp**: Relative time format

#### Real-Time Updates
Fetched from `/api/dashboard/calls?limit=10&offset=0`

### 4. Payment History

#### Transaction Details
- **Amount**: EGLD value with currency symbol
- **Status Badges**:
  - ✅ Confirmed (green)
  - ⏳ Pending (yellow)
  - ❌ Failed (red)
- **Addresses**: Sender and receiver with truncation
- **Description**: Optional payment note
- **Explorer Link**: Direct link to MultiversX blockchain explorer

#### Payment Schema
```typescript
interface Payment {
  id: string;
  senderAddress: string;      // erd1...
  receiverAddress: string;    // erd1...
  amount: string;             // "0.5", "1.0"
  transactionHash: string;    // Blockchain tx hash
  status: 'pending' | 'confirmed' | 'failed';
  description?: string;       // Optional memo
  createdAt: string;          // ISO timestamp
}
```

## 🛠️ Technical Implementation

### API Endpoints

```
GET /api/dashboard/stats
  Returns: Real-time usage statistics
  
GET /api/dashboard/calls?limit=10&offset=0
  Returns: Paginated API call history
  
GET /api/payments?limit=10&offset=0
  Returns: Payment transaction history
```

### Component Architecture

```
Dashboard Page
├── Header
│   ├── Title
│   └── Refresh Button
├── Stats Grid (4 columns)
│   ├── Total Calls Card
│   ├── Cached Calls Card
│   ├── Response Time Card
│   └── Remaining Calls Card (with progress bar)
├── Sheet Mappings Section
│   └── Sheet Cards (with delete action)
└── Two-Column Layout
    ├── Recent API Calls (left)
    └── Payment History (right)
```

### Loading States

```typescript
// Initial load shows spinning refresh icon
if (loading) {
  return (
    <motion.div animate={{ rotate: 360 }}>
      <RefreshCw className="h-12 w-12" />
    </motion.div>
  );
}
```

### Animations

```typescript
// Staggered entry animations
Stats Cards:     delay: 0.1s
Sheet Mappings:  delay: 0.2s
API Calls:       delay: 0.3s
Payments:        delay: 0.4s

// Individual items within sections
Sheet Card 1:    delay: 0.3s
Sheet Card 2:    delay: 0.4s
API Call 1:      delay: 0.4s
API Call 2:      delay: 0.5s
```

## 📱 Responsive Design

### Breakpoints
- **Desktop (lg: >1024px)**: 4-column stats, 2-column content
- **Tablet (md: 768-1024px)**: 2-column stats, stacked content
- **Mobile (<768px)**: Single column layout

### Mobile Optimizations
- Truncated addresses (10 chars + ... + 8 chars)
- Scrollable tables
- Full-width cards
- Collapsed navigation

## 🔒 Security Considerations

### Data Access
- **Current Implementation**: Mock data (demo mode)
- **Production**: Add authentication middleware
- **Recommended**: Clerk or NextAuth.js

### API Protection
```typescript
// Add to dashboard API routes
import { auth } from '@clerk/nextjs';

export async function GET(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // ... fetch user-specific data
}
```

## 🚀 Performance Optimizations

### 1. Data Fetching
- **Parallel Requests**: Stats, calls, and payments load simultaneously
- **Pagination**: Limit 10 items per section
- **Caching**: SWR or React Query for client-side cache

### 2. Rendering
- **Conditional Rendering**: Sections mount only when data available
- **Lazy Loading**: Off-screen items render on scroll
- **Memoization**: React.memo for card components

### 3. Database Queries
```sql
-- Optimized with indexes
CREATE INDEX idx_api_calls_created_at ON ApiCall(createdAt DESC);
CREATE INDEX idx_api_calls_status ON ApiCall(status);
CREATE INDEX idx_payments_created_at ON Payment(createdAt DESC);
```

## 💡 Future Enhancements

### Phase 3: Advanced Analytics
- [ ] Time-series charts (Chart.js or Recharts)
- [ ] Heatmap for hourly usage patterns
- [ ] Geographic distribution map
- [ ] Custom date range filters

### Phase 4: Real-Time Features
- [ ] WebSocket live updates
- [ ] Push notifications for payments
- [ ] Real-time usage counter
- [ ] Live API status indicator

### Phase 5: Export & Reporting
- [ ] Export to CSV/PDF
- [ ] Email weekly reports
- [ ] Custom dashboards
- [ ] API usage alerts

## 📝 Usage Instructions

### Accessing Dashboard
1. Navigate to `/dashboard` in your browser
2. Wait for initial data load (1-2 seconds)
3. View real-time statistics in top cards
4. Scroll down for detailed history

### Refreshing Data
Click the **Refresh** button in top-right corner to reload all dashboard data.

### Managing Sheets
1. Locate sheet in "Active Sheet Mappings" section
2. Click external link icon to view Google Sheet
3. Click trash icon to remove mapping
4. Confirm deletion via toast notification

### Viewing Payment Details
1. Find transaction in "Payment History" section
2. Check status badge (confirmed/pending/failed)
3. Click "View on Explorer" to see blockchain transaction
4. Verify sender/receiver addresses

## 🐛 Troubleshooting

### Issue: Dashboard shows no data
**Solution**: Ensure database is populated with API calls and payments. Use API endpoints first to generate data.

### Issue: Stats not updating
**Solution**: Click refresh button or check browser console for API errors.

### Issue: Navigation not working
**Solution**: Verify Next.js routing is configured correctly. Check `layout.tsx` for navigation links.

### Issue: Animations lagging
**Solution**: Reduce animation complexity or disable for lower-end devices using `prefers-reduced-motion`.

---

**Built with** ❤️ by **Gzeu** | [GitHub](https://github.com/Gzeu/gridlink) | [Dashboard Demo](https://gridlink.vercel.app/dashboard)
