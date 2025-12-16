'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import {
  TrendingUp,
  Activity,
  Calendar,
  Clock,
  Filter,
  Download,
  RefreshCw,
} from 'lucide-react';

interface UsageData {
  date: string;
  calls: number;
  cached: number;
  responseTime: number;
}

interface MethodDistribution {
  method: string;
  count: number;
  percentage: number;
}

interface HourlyPattern {
  hour: string;
  requests: number;
}

interface StatusDistribution {
  status: string;
  count: number;
}

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');
  
  // Usage over time data
  const [usageData, setUsageData] = useState<UsageData[]>([
    { date: 'Dec 1', calls: 156, cached: 98, responseTime: 92 },
    { date: 'Dec 3', calls: 189, cached: 134, responseTime: 87 },
    { date: 'Dec 5', calls: 223, cached: 167, responseTime: 85 },
    { date: 'Dec 7', calls: 198, cached: 142, responseTime: 89 },
    { date: 'Dec 9', calls: 267, cached: 201, responseTime: 84 },
    { date: 'Dec 11', calls: 289, cached: 223, responseTime: 82 },
    { date: 'Dec 13', calls: 312, cached: 245, responseTime: 79 },
    { date: 'Dec 15', calls: 334, cached: 267, responseTime: 76 },
  ]);

  // HTTP method distribution
  const [methodData, setMethodData] = useState<MethodDistribution[]>([
    { method: 'GET', count: 1847, percentage: 74 },
    { method: 'POST', count: 523, percentage: 21 },
    { method: 'PUT', count: 87, percentage: 3 },
    { method: 'DELETE', count: 43, percentage: 2 },
  ]);

  // Hourly usage patterns
  const [hourlyData, setHourlyData] = useState<HourlyPattern[]>([
    { hour: '00:00', requests: 12 },
    { hour: '03:00', requests: 8 },
    { hour: '06:00', requests: 23 },
    { hour: '09:00', requests: 156 },
    { hour: '12:00', requests: 234 },
    { hour: '15:00', requests: 289 },
    { hour: '18:00', requests: 198 },
    { hour: '21:00', requests: 87 },
  ]);

  // Status code distribution
  const [statusData, setStatusData] = useState<StatusDistribution[]>([
    { status: '200 OK', count: 2234 },
    { status: '201 Created', count: 456 },
    { status: '304 Not Modified', count: 123 },
    { status: '400 Bad Request', count: 34 },
    { status: '404 Not Found', count: 12 },
    { status: '500 Server Error', count: 5 },
  ]);

  useEffect(() => {
    loadAnalytics();
  }, [timeRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success(`Analytics loaded for ${timeRange}`);
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    toast.success('Export started - CSV will download shortly');
  };

  const COLORS = {
    primary: '#3b82f6',
    secondary: '#06b6d4',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#a855f7',
  };

  const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.success, COLORS.warning];

  if (loading) {
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-100">Analytics</h1>
            <p className="text-slate-400 mt-2">Advanced insights and performance metrics</p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Range Filter */}
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-800/50 p-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    timeRange === range
                      ? 'bg-blue-500 text-white'
                      : 'text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {range === '7d' && 'Last 7 days'}
                  {range === '30d' && 'Last 30 days'}
                  {range === '90d' && 'Last 90 days'}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={exportData}
              className="flex items-center gap-2 rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export
            </motion.button>
          </div>
        </motion.div>

        {/* API Usage Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-6 w-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-slate-100">API Usage Trend</h2>
          </div>

          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={usageData}>
              <defs>
                <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorCached" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="calls"
                stroke={COLORS.primary}
                fillOpacity={1}
                fill="url(#colorCalls)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="cached"
                stroke={COLORS.secondary}
                fillOpacity={1}
                fill="url(#colorCached)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* HTTP Method Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Activity className="h-6 w-6 text-cyan-400" />
              <h2 className="text-2xl font-bold text-slate-100">HTTP Methods</h2>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-8">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={methodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ method, percentage }) => `${method} ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {methodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-3 flex-1">
                {methodData.map((item, index) => (
                  <div key={item.method} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: PIE_COLORS[index % PIE_COLORS.length] }}
                      />
                      <span className="text-sm text-slate-300">{item.method}</span>
                    </div>
                    <span className="text-sm font-bold text-slate-100">{item.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Response Time Trend */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
          >
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-purple-400" />
              <h2 className="text-2xl font-bold text-slate-100">Response Time</h2>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis stroke="#64748b" unit="ms" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="responseTime"
                  stroke={COLORS.purple}
                  strokeWidth={3}
                  dot={{ fill: COLORS.purple, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Hourly Usage Pattern */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="h-6 w-6 text-green-400" />
            <h2 className="text-2xl font-bold text-slate-100">Hourly Traffic Pattern</h2>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="hour" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="requests" fill={COLORS.success} radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Status Code Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Filter className="h-6 w-6 text-yellow-400" />
            <h2 className="text-2xl font-bold text-slate-100">Status Code Distribution</h2>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#64748b" />
              <YAxis dataKey="status" type="category" stroke="#64748b" width={150} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                }}
              />
              <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      entry.status.startsWith('2')
                        ? COLORS.success
                        : entry.status.startsWith('3')
                        ? COLORS.secondary
                        : entry.status.startsWith('4')
                        ? COLORS.warning
                        : COLORS.danger
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </>
  );
}
