'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth } from '@clerk/nextjs';
import {
  TrendingUp, PieChart as PieChartIcon, BarChart3,
  Calendar, RefreshCw, Zap, Database, AlertCircle,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

interface Summary {
  total:         number;
  cached:        number;
  cacheHitRate:  number;
  errors:        number;
  errorRate:     number;
  successRate:   number;
  avgResponseMs: number;
  avgDailyCalls: number;
  peakHour:      string;
  range:         string;
}

interface UsagePoint {
  date:   string;
  calls:  number;
  cached: number;
  errors: number;
  avgMs:  number;
}

interface StatusPoint  { status: string; count: number }
interface TopSheet     { apiName: string; sheetId: string; calls: number }

const STATUS_COLORS: Record<string, string> = {
  '200': '#22d3ee', '201': '#3b82f6', '304': '#a855f7',
  '400': '#f59e0b', '401': '#f97316', '403': '#ef4444',
  '404': '#dc2626', '429': '#7c3aed', '500': '#be123c', '502': '#9f1239',
};

export default function Analytics() {
  const { isLoaded, userId } = useAuth();
  const [loading, setLoading]     = useState(true);
  const [range,   setRange]       = useState('7d');
  const [summary, setSummary]     = useState<Summary | null>(null);
  const [usage,   setUsage]       = useState<UsagePoint[]>([]);
  const [status,  setStatusData]  = useState<StatusPoint[]>([]);
  const [topSheets, setTopSheets] = useState<TopSheet[]>([]);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/analytics?clerkId=${userId}&range=${range}`);
      if (!res.ok) throw new Error();
      const { data } = await res.json();
      setSummary(data.summary);
      setUsage(data.usageData);
      setStatusData(data.statusData);
      setTopSheets(data.topSheets);
    } catch {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [userId, range]);

  useEffect(() => { if (isLoaded && userId) load(); }, [isLoaded, userId, load]);

  const insights = [
    {
      icon:     TrendingUp,
      title:    'Peak Hour',
      value:    summary?.peakHour ?? '—',
      subtitle: summary?.total ? 'Most active time' : 'No data yet',
      color:    'from-blue-500 to-cyan-500',
    },
    {
      icon:     PieChartIcon,
      title:    'Success Rate',
      value:    summary ? `${summary.successRate}%` : '—',
      subtitle: summary ? `${summary.total - summary.errors}/${summary.total} successful` : 'No calls yet',
      color:    'from-cyan-500 to-purple-500',
    },
    {
      icon:     Zap,
      title:    'Cache Hit Rate',
      value:    summary ? `${summary.cacheHitRate}%` : '—',
      subtitle: summary ? `${summary.cached} cached responses` : 'No data yet',
      color:    'from-purple-500 to-pink-500',
    },
    {
      icon:     Calendar,
      title:    'Avg Daily Calls',
      value:    summary ? `${summary.avgDailyCalls}` : '—',
      subtitle: `Last ${range.replace('d', ' days')}`,
      color:    'from-pink-500 to-orange-500',
    },
  ];

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw className="h-12 w-12 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />

      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-100">Analytics</h1>
            <p className="text-slate-400 mt-2">Deep insights into your API performance</p>
          </div>
          <div className="flex items-center gap-4">
            <select value={range} onChange={e => { setRange(e.target.value); }}
              className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-slate-300 focus:border-blue-400 focus:outline-none">
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={load}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors">
              <RefreshCw className="h-4 w-4" /> Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Insight Cards */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {insights.map((ins, i) => (
            <motion.div key={ins.title}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + i * 0.05 }} whileHover={{ y: -4 }}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
              <div className={`inline-flex rounded-xl bg-gradient-to-r ${ins.color} p-3 mb-4`}>
                <ins.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm text-slate-400 mb-1">{ins.title}</h3>
              <p className="text-2xl font-bold text-slate-100 mb-1">{ins.value}</p>
              <p className="text-xs text-slate-500">{ins.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Usage Timeline */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-slate-100">Usage Over Time</h2>
          </div>
          {usage.length === 0 ? (
            <div className="flex items-center justify-center h-[260px] text-slate-500 text-sm">No call data in this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={usage}>
                <defs>
                  <linearGradient id="gCalls"  x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.7}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gCached" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#06b6d4" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gErrors" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.6}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: 13 }} />
                <Legend wrapperStyle={{ color: '#94a3b8', fontSize: 13 }} />
                <Area type="monotone" dataKey="calls"  name="Total Calls"  stroke="#3b82f6" fill="url(#gCalls)" />
                <Area type="monotone" dataKey="cached" name="Cached"       stroke="#06b6d4" fill="url(#gCached)" />
                <Area type="monotone" dataKey="errors" name="Errors"       stroke="#ef4444" fill="url(#gErrors)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        {/* Status + Top Sheets */}
        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <AlertCircle className="h-6 w-6 text-purple-400" />
              <h2 className="text-xl font-bold text-slate-100">Status Code Distribution</h2>
            </div>
            {status.length === 0 ? (
              <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={status}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="status" stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', fontSize: 13 }} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {status.map((s) => (
                      <Cell key={s.status} fill={STATUS_COLORS[s.status] ?? '#8b5cf6'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Database className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100">Top APIs by Calls</h2>
            </div>
            {topSheets.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-16">No API data in this period</p>
            ) : (
              <div className="space-y-4">
                {topSheets.map((s, i) => {
                  const max = topSheets[0].calls;
                  return (
                    <motion.div key={s.sheetId}
                      initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + i * 0.05 }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-slate-300 truncate max-w-[70%]">{s.apiName}</span>
                        <span className="text-xs text-slate-500 tabular-nums">{s.calls} calls</span>
                      </div>
                      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.round((s.calls / max) * 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.5 + i * 0.05 }}
                          className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                        />
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* Performance summary */}
        {summary && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <h3 className="text-xl font-bold text-slate-100 mb-6">Performance Breakdown</h3>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: 'Cache Hit Rate',    value: summary.cacheHitRate,  suffix: '%',  color: 'from-purple-500 to-pink-500' },
                { label: 'Avg Response Time', value: Math.min(summary.avgResponseMs, 2000), suffix: 'ms', max: 2000, color: 'from-cyan-500 to-blue-500', display: `${summary.avgResponseMs}ms` },
                { label: 'Error Rate',        value: summary.errorRate,     suffix: '%',  color: 'from-green-500 to-emerald-500' },
              ].map(m => (
                <div key={m.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">{m.label}</span>
                    <span className="font-bold text-slate-200">{m.display ?? `${m.value}${m.suffix}`}</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(m.value, 100)}%` }}
                      transition={{ duration: 1, delay: 0.6 }}
                      className={`h-full bg-gradient-to-r ${m.color} rounded-full`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </>
  );
}
