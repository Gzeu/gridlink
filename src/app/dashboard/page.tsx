'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/nextjs';
import {
  Activity,
  Database,
  Zap,
  TrendingUp,
  Clock,
  DollarSign,
  Link2,
  Trash2,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  BarChart3,
  Wallet,
  PieChart,
  TrendingDown,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ApiCall {
  id: string;
  sheetId: string;
  method: string;
  endpoint: string;
  status: number;
  cachedFromRedis: boolean;
  egldAddress?: string;
  createdAt: string;
}

interface Payment {
  id: string;
  senderAddress: string;
  receiverAddress: string;
  amount: string;
  transactionHash: string;
  status: 'pending' | 'confirmed' | 'failed';
  description?: string;
  createdAt: string;
}

interface SheetMapping {
  id: string;
  sheetUrl: string;
  apiEndpoint: string;
  totalCalls: number;
  lastAccessed: string;
}

export default function Dashboard() {
  const { isLoaded, userId } = useAuth();
  const { user } = useUser();
  const [apiCalls, setApiCalls] = useState<ApiCall[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [sheets, setSheets] = useState<SheetMapping[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalCalls: 0,
    cachedCalls: 0,
    successRate: 100,
    avgResponseTime: 89,
    callsThisMonth: 247,
    remainingCalls: 753,
  });

  // Chart data
  const [usageData, setUsageData] = useState([
    { date: 'Mon', calls: 45, cached: 32 },
    { date: 'Tue', calls: 52, cached: 38 },
    { date: 'Wed', calls: 61, cached: 44 },
    { date: 'Thu', calls: 48, cached: 35 },
    { date: 'Fri', calls: 71, cached: 52 },
    { date: 'Sat', calls: 38, cached: 28 },
    { date: 'Sun', calls: 42, cached: 31 },
  ]);

  const [methodData, setMethodData] = useState([
    { name: 'GET', value: 156, color: '#10b981' },
    { name: 'POST', value: 72, color: '#3b82f6' },
    { name: 'PUT', value: 14, color: '#8b5cf6' },
    { name: 'DELETE', value: 5, color: '#ef4444' },
  ]);

  const [statusData, setStatusData] = useState([
    { status: '200', count: 189 },
    { status: '201', count: 45 },
    { status: '400', count: 8 },
    { status: '500', count: 2 },
  ]);

  useEffect(() => {
    if (isLoaded && userId) {
      loadDashboardData();
    }
  }, [isLoaded, userId]);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data - Replace with real API calls
      setApiCalls([
        {
          id: '1',
          sheetId: 'abc123',
          method: 'GET',
          endpoint: '/api/sheets',
          status: 200,
          cachedFromRedis: true,
          egldAddress: 'erd1...',
          createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
        },
        {
          id: '2',
          sheetId: 'def456',
          method: 'POST',
          endpoint: '/api/sheets',
          status: 201,
          cachedFromRedis: false,
          createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        },
        {
          id: '3',
          sheetId: 'ghi789',
          method: 'GET',
          endpoint: '/api/sheets',
          status: 200,
          cachedFromRedis: true,
          createdAt: new Date(Date.now() - 45 * 60000).toISOString(),
        },
      ]);

      setPayments([
        {
          id: '1',
          senderAddress: 'erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th',
          receiverAddress: 'erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx',
          amount: '0.5',
          transactionHash: '0xa1b2c3d4e5f6...',
          status: 'confirmed',
          description: 'API usage payment',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: '2',
          senderAddress: 'erd1qyu5wthldzr8wx5c9ucg8kjagg0jfs53s8nr3zpz3hypefsdd8ssycr6th',
          receiverAddress: 'erd1spyavw0956vq68xj8y4tenjpq2wd5a9p2c6j8gsz7ztyrnpxrruqzu66jx',
          amount: '1.0',
          transactionHash: '0xf6e5d4c3b2a1...',
          status: 'pending',
          description: 'Premium tier upgrade',
          createdAt: new Date(Date.now() - 300000).toISOString(),
        },
      ]);

      setSheets([
        {
          id: '1',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/abc123/edit',
          apiEndpoint: `${window.location.origin}/api/sheets?sheetUrl=...`,
          totalCalls: 156,
          lastAccessed: new Date(Date.now() - 120000).toISOString(),
        },
        {
          id: '2',
          sheetUrl: 'https://docs.google.com/spreadsheets/d/def456/edit',
          apiEndpoint: `${window.location.origin}/api/sheets?sheetUrl=...`,
          totalCalls: 91,
          lastAccessed: new Date(Date.now() - 900000).toISOString(),
        },
      ]);

      toast.success('Dashboard data loaded');
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const deleteSheet = (id: string) => {
    setSheets(sheets.filter(s => s.id !== id));
    toast.success('Sheet removed');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 10)}...${address.slice(-8)}`;
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <RefreshCw className="h-12 w-12 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1e293b',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        }}
      />

      <div className="space-y-8">
        {/* Header with User Greeting */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-100">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
            </h1>
            <p className="text-slate-400 mt-2">Monitor your API usage and payments</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={loadDashboardData}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-slate-100">{stats.totalCalls}</span>
            </div>
            <h3 className="text-sm text-slate-400">Total API Calls</h3>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
              <TrendingUp className="h-3 w-3" />
              <span>+12% from last month</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold text-slate-100">{stats.cachedCalls}</span>
            </div>
            <h3 className="text-sm text-slate-400">Cached Responses</h3>
            <div className="mt-2 flex items-center gap-1 text-xs text-slate-400">
              <Database className="h-3 w-3" />
              <span>{Math.round((stats.cachedCalls / stats.totalCalls) * 100)}% cache hit rate</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-slate-100">{stats.avgResponseTime}ms</span>
            </div>
            <h3 className="text-sm text-slate-400">Avg Response Time</h3>
            <div className="mt-2 flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>{stats.successRate}% success rate</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-pink-400" />
              <span className="text-2xl font-bold text-slate-100">{stats.remainingCalls}</span>
            </div>
            <h3 className="text-sm text-slate-400">Calls Remaining</h3>
            <div className="mt-2">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(stats.callsThisMonth / 1000) * 100}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-6"
        >
          {/* Weekly Usage Trend */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-slate-100">Weekly Usage</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={usageData}>
                <defs>
                  <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorCached" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }} 
                />
                <Area type="monotone" dataKey="calls" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCalls)" />
                <Area type="monotone" dataKey="cached" stroke="#06b6d4" fillOpacity={1} fill="url(#colorCached)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Method Distribution */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="h-6 w-6 text-green-400" />
              <h2 className="text-2xl font-bold text-slate-100">Method Distribution</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <RechartsPieChart>
                <Pie
                  data={methodData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {methodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }} 
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          {/* Status Code Distribution */}
          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6 lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-slate-100">Response Status Codes</h2>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={statusData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="status" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: '1px solid #334155',
                    borderRadius: '8px'
                  }} 
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sheet Mappings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link2 className="h-6 w-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-slate-100">Active Sheet Mappings</h2>
            </div>
            <span className="text-sm text-slate-400">{sheets.length} active</span>
          </div>

          <div className="space-y-4">
            {sheets.map((sheet, index) => (
              <motion.div
                key={sheet.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="rounded-lg border border-slate-700 bg-slate-900/50 p-4 hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="h-4 w-4 text-blue-400" />
                      <span className="text-sm font-mono text-slate-300">Sheet ID: {sheet.id}</span>
                    </div>
                    <p className="text-xs text-slate-400 mb-3 break-all">{sheet.sheetUrl}</p>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Activity className="h-3 w-3" />
                        {sheet.totalCalls} calls
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(sheet.lastAccessed)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <a
                      href={sheet.sheetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 text-slate-400" />
                    </a>
                    <button
                      onClick={() => deleteSheet(sheet.id)}
                      className="p-2 rounded-lg hover:bg-red-500/10 transition-colors group"
                    >
                      <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Two Column Layout: Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent API Calls */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-slate-100">Recent API Calls</h2>
            </div>

            <div className="space-y-3">
              {apiCalls.map((call, index) => (
                <motion.div
                  key={call.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="rounded-lg border border-slate-700 bg-slate-900/50 p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        call.method === 'GET' ? 'bg-green-500/10 text-green-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {call.method}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        call.status === 200 || call.status === 201 
                          ? 'bg-green-500/10 text-green-400' 
                          : 'bg-red-500/10 text-red-400'
                      }`}>
                        {call.status}
                      </span>
                      {call.cachedFromRedis && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-purple-500/10 text-purple-400">
                          ⚡ Cached
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500">{formatDate(call.createdAt)}</span>
                  </div>
                  <p className="text-sm font-mono text-slate-400">{call.endpoint}</p>
                  {call.egldAddress && (
                    <p className="text-xs text-slate-500 mt-2">EGLD: {truncateAddress(call.egldAddress)}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Payment History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="h-6 w-6 text-green-400" />
              <h2 className="text-2xl font-bold text-slate-100">Payment History</h2>
            </div>

            <div className="space-y-3">
              {payments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="rounded-lg border border-slate-700 bg-slate-900/50 p-4"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-400" />
                      <span className="text-lg font-bold text-slate-100">{payment.amount} EGLD</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {payment.status === 'confirmed' && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                      {payment.status === 'pending' && <AlertCircle className="h-4 w-4 text-yellow-400" />}
                      {payment.status === 'failed' && <XCircle className="h-4 w-4 text-red-400" />}
                      <span className={`text-xs font-medium ${
                        payment.status === 'confirmed' ? 'text-green-400' :
                        payment.status === 'pending' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {payment.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">From:</span>
                      <span className="font-mono">{truncateAddress(payment.senderAddress)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500">To:</span>
                      <span className="font-mono">{truncateAddress(payment.receiverAddress)}</span>
                    </div>
                    {payment.description && (
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">Note:</span>
                        <span>{payment.description}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-700">
                      <span className="flex items-center gap-1 text-slate-500">
                        <Calendar className="h-3 w-3" />
                        {formatDate(payment.createdAt)}
                      </span>
                      <a
                        href={`https://explorer.multiversx.com/transactions/${payment.transactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink className="h-3 w-3" />
                        View on Explorer
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
