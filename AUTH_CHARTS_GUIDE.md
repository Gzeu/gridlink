# Gridlink Authentication & Charts Guide

## 🔒 Authentication with Clerk

### Setup Instructions

#### 1. Create Clerk Account
1. Visit [clerk.com](https://clerk.com) and sign up
2. Create a new application
3. Choose "Next.js" as your framework
4. Copy your API keys from the dashboard

#### 2. Environment Variables
Add to `.env.local`:
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

#### 3. Middleware Protection
The `/dashboard` route is automatically protected via `middleware.ts`:
```typescript
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
]);
```

#### 4. User Authentication Flow

**Unauthenticated Users:**
- Homepage accessible without login
- "Sign In" button visible in header
- Clicking redirects to Clerk modal sign-in

**Authenticated Users:**
- Dashboard automatically accessible
- User avatar displayed in header (via `<UserButton />`)
- Personalized greeting: "Welcome back, {FirstName}!"
- Account management via avatar dropdown

### Using Clerk Hooks

```typescript
import { useAuth, useUser } from '@clerk/nextjs';

// Get authentication state
const { isLoaded, userId } = useAuth();

// Get user profile data
const { user } = useUser();

// Display user info
<h1>Welcome back, {user?.firstName}!</h1>
```

### Protected API Routes

Add to any API endpoint:
```typescript
import { auth } from '@clerk/nextjs';

export async function GET(request: NextRequest) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }
  
  // Fetch user-specific data
  const data = await prisma.apiCall.findMany({
    where: { userId },
  });
  
  return NextResponse.json(data);
}
```

## 📊 Charts with Recharts

### Chart Types Implemented

#### 1. Weekly Usage Area Chart
**Location:** Dashboard top-left
**Data Structure:**
```typescript
const usageData = [
  { date: 'Mon', calls: 45, cached: 32 },
  { date: 'Tue', calls: 52, cached: 38 },
  // ...
];
```

**Features:**
- Dual area chart (total calls + cached calls)
- Gradient fills (blue for calls, cyan for cached)
- Grid lines for readability
- Interactive tooltip on hover
- Responsive container (adapts to screen size)

**Customization:**
```typescript
<AreaChart data={usageData}>
  <defs>
    <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
    </linearGradient>
  </defs>
  <Area type="monotone" dataKey="calls" fill="url(#colorCalls)" />
</AreaChart>
```

#### 2. Method Distribution Pie Chart
**Location:** Dashboard top-right
**Data Structure:**
```typescript
const methodData = [
  { name: 'GET', value: 156, color: '#10b981' },
  { name: 'POST', value: 72, color: '#3b82f6' },
  { name: 'PUT', value: 14, color: '#8b5cf6' },
  { name: 'DELETE', value: 5, color: '#ef4444' },
];
```

**Features:**
- Color-coded slices (green=GET, blue=POST, purple=PUT, red=DELETE)
- Labels showing method name + count
- Interactive tooltip
- 80px outer radius for optimal visibility

#### 3. Status Code Bar Chart
**Location:** Dashboard bottom (full-width)
**Data Structure:**
```typescript
const statusData = [
  { status: '200', count: 189 },
  { status: '201', count: 45 },
  { status: '400', count: 8 },
  { status: '500', count: 2 },
];
```

**Features:**
- Vertical bars with rounded tops
- Purple fill color (`#8b5cf6`)
- Grid lines for precise reading
- Responsive height (250px)

### Chart Styling

**Dark Theme Configuration:**
```typescript
<Tooltip 
  contentStyle={{ 
    backgroundColor: '#1e293b',  // slate-800
    color: '#f1f5f9',            // slate-100
    border: '1px solid #334155', // slate-700
    borderRadius: '8px'
  }} 
/>

<CartesianGrid strokeDasharray="3 3" stroke="#334155" />
<XAxis stroke="#94a3b8" />  // slate-400
<YAxis stroke="#94a3b8" />
```

### Responsive Design

All charts use `ResponsiveContainer`:
```typescript
<ResponsiveContainer width="100%" height={250}>
  <AreaChart data={usageData}>
    {/* ... */}
  </AreaChart>
</ResponsiveContainer>
```

**Breakpoints:**
- Mobile (<768px): Single column, 250px height
- Tablet (768-1024px): 2 columns for dual charts
- Desktop (>1024px): Full grid layout

### Adding Custom Charts

**Example: Line Chart for Response Times**
```typescript
import { LineChart, Line } from 'recharts';

const responseTimeData = [
  { time: '00:00', ms: 92 },
  { time: '04:00', ms: 87 },
  { time: '08:00', ms: 95 },
  { time: '12:00', ms: 103 },
  { time: '16:00', ms: 89 },
  { time: '20:00', ms: 84 },
];

<ResponsiveContainer width="100%" height={200}>
  <LineChart data={responseTimeData}>
    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
    <XAxis dataKey="time" stroke="#94a3b8" />
    <YAxis stroke="#94a3b8" />
    <Tooltip 
      contentStyle={{ 
        backgroundColor: '#1e293b', 
        border: '1px solid #334155' 
      }} 
    />
    <Line 
      type="monotone" 
      dataKey="ms" 
      stroke="#8b5cf6" 
      strokeWidth={2} 
    />
  </LineChart>
</ResponsiveContainer>
```

## 🛠️ Integration Guide

### Connecting Charts to Real Data

**1. Create API Endpoint:**
```typescript
// src/app/api/dashboard/charts/route.ts
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import { prisma } from '@/lib/db';

export async function GET() {
  const { userId } = auth();
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  
  // Aggregate weekly usage
  const weeklyData = await prisma.apiCall.groupBy({
    by: ['createdAt'],
    where: {
      userId,
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
    },
    _count: { id: true },
  });
  
  return NextResponse.json({ weeklyData });
}
```

**2. Fetch in Component:**
```typescript
const [usageData, setUsageData] = useState([]);

useEffect(() => {
  async function loadChartData() {
    const res = await fetch('/api/dashboard/charts');
    const data = await res.json();
    setUsageData(data.weeklyData);
  }
  loadChartData();
}, []);
```

### Database Schema for User Association

Update `prisma/schema.prisma`:
```prisma
model ApiCall {
  id              String   @id @default(uuid())
  userId          String   // Clerk user ID
  sheetId         String
  method          String
  endpoint        String
  status          Int
  cachedFromRedis Boolean  @default(false)
  egldAddress     String?
  createdAt       DateTime @default(now())

  @@index([userId, createdAt])
}
```

Run migration:
```bash
npx prisma migrate dev --name add_user_id
```

## 💡 Advanced Features

### Real-Time Chart Updates

Use SWR for auto-refresh:
```typescript
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(res => res.json());

const { data, error } = useSWR('/api/dashboard/charts', fetcher, {
  refreshInterval: 30000, // Refresh every 30 seconds
});
```

### Export Chart as Image

Add download button:
```typescript
import { toPng } from 'html-to-image';

const downloadChart = async () => {
  const chartElement = document.getElementById('weekly-chart');
  if (chartElement) {
    const dataUrl = await toPng(chartElement);
    const link = document.createElement('a');
    link.download = 'weekly-usage.png';
    link.href = dataUrl;
    link.click();
  }
};
```

### Custom Tooltip Content

```typescript
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
        <p className="text-slate-300">{payload[0].payload.date}</p>
        <p className="text-blue-400 font-bold">
          Calls: {payload[0].value}
        </p>
        <p className="text-cyan-400">
          Cached: {payload[1].value} ({Math.round(payload[1].value / payload[0].value * 100)}%)
        </p>
      </div>
    );
  }
  return null;
};

<AreaChart data={usageData}>
  <Tooltip content={<CustomTooltip />} />
</AreaChart>
```

## 🐛 Troubleshooting

### Issue: Clerk redirect loops
**Solution:** Ensure middleware matcher excludes static files and API routes correctly.

### Issue: Charts not rendering
**Solution:** 
1. Check that `recharts` is installed: `npm list recharts`
2. Verify ResponsiveContainer has parent with defined width
3. Check console for data format errors

### Issue: Authentication state not loading
**Solution:** Wrap app with `<ClerkProvider>` in layout.tsx (already done).

### Issue: User data not showing
**Solution:** Check that Clerk API keys are set in `.env.local` (not `.env`).

## 🚀 Testing

### Local Development
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your Clerk keys

# Run dev server
npm run dev

# Visit http://localhost:3000
# Click "Sign In" to test authentication
# Navigate to /dashboard to view charts
```

### Authentication Testing
1. Visit homepage (unauthenticated)
2. Click "Sign In" button
3. Sign up with test email
4. Verify redirect to `/dashboard`
5. Check user greeting appears
6. Test logout from user button dropdown

### Chart Testing
1. Load dashboard
2. Verify all 3 charts render
3. Hover over chart elements (tooltip appears)
4. Resize browser window (charts adapt)
5. Check mobile responsiveness

---

**Built with** ❤️ by **Gzeu** | [GitHub](https://github.com/Gzeu/gridlink) | [Live Demo](https://gridlink.vercel.app)
