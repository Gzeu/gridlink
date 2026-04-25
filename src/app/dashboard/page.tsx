'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { useAuth, useUser } from '@clerk/nextjs';
import {
  Activity, Database, Zap, TrendingUp, Clock,
  DollarSign, Link2, Trash2, ExternalLink, RefreshCw,
  CheckCircle2, XCircle, AlertCircle, Calendar,
  BarChart3, Wallet, PieChart,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  PieChart as RechartsPieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

/* ─── Types ────────────────────────────────────────────────── */
interface Stats {
  totalCalls:      number;
  callsThisMonth:  number;
  cacheHits:       number;
  cacheHitRate:    number;
  avgResponseTime: number;
  successRate:     number;
  remainingCalls:  number;
  callsLimit:      number;
  tier:            string;
  activeApis:      number;
}

interface ApiCallRow {
  id:             number;
  apiKey:         string;
  endpoint:       string;
  statusCode:     number;
  responseTimeMs: number | null;
  cacheHit:       boolean;
  ipAddress:      string | null;
  timestamp:      string;
  api: { apiName: string; sheetId: string };
}

interface ApiKey {
  id:            number;
  apiKey:        string;
  apiName:       string;
  sheetId:       string;
  sheetUrl:      string;
  callCountTotal: number;
  lastAccessed:  string | null;
  isActive:      boolean;
}

interface Payment {
  id:          number;
  txHash:      string;
  amountEgld:  number;
  status:      string;
  confirmedAt: string | null;
  createdAt:   string;
}

/* ─── Helpers ──────────────────────────────────────────────── */
function timeAgo(iso: string): string {
  const diff    = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60_000);
  const hours   = Math.floor(diff / 3_600_000);
  if (minutes < 1)  return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours   < 24) return `${hours}h ago`;
  return new Date(iso).toLocaleDateString();
}

function truncAddr(addr: string): string {
  return addr.length > 18 ? `${addr.slice(0, 10)}...${addr.slice(-8)}` : addr;
}

/* ─── Component ────────────────────────────────────────────── */
export default function Dashboard() {
  const { isLoaded, userId } = useAuth();
  const { user }             = useUser();

  const [stats,    setStats]    = useState<Stats | null>(null);
  const [calls,    setCalls]    = useState<ApiCallRow[]>([]);
  const [apiKeys,  setApiKeys]  = useState<ApiKey[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading,  setLoading]  = useState(true);

  // Derived chart data from real calls
  const methodData = [
    { name: 'GET',    value: calls.filter(c => c.endpoint.includes('GET')   || c.statusCode < 400).length, color: '#10b981' },
    { name: '2xx',   value: calls.filter(c => c.statusCode >= 200 && c.statusCode < 300).length, color: '#3b82f6' },
    { name: '4xx',   value: calls.filter(c => c.statusCode >= 400 && c.statusCode < 500).length, color: '#f59e0b' },
    { name: '5xx',   value: calls.filter(c => c.statusCode >= 500).length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  const statusData = ['200','201','400','401','403','429','500','502'].map(s => ({
    status: s,
    count:  calls.filter(c => String(c.statusCode) === s).length,
  })).filter(d => d.count > 0);

  const fetchAll = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [statsRes, callsRes, keysRes, paymentsRes] = await Promise.all([
        fetch(`/api/dashboard/stats?clerkId=${userId}`),
        fetch(`/api/dashboard/calls?clerkId=${userId}&limit=20`),
        fetch(`/api/keys?clerkId=${userId}`),
        fetch(`/api/payments?clerkId=${userId}`),
      ]);

      if (statsRes.ok) {
        const { data } = await statsRes.json();
        setStats(data);
      }
      if (callsRes.ok) {
        const { data } = await callsRes.json();
        setCalls(data.calls ?? []);
      }
      if (keysRes.ok) {
        const { data } = await keysRes.json();
        setApiKeys(Array.isArray(data) ? data : data.keys ?? []);
      }
      if (paymentsRes.ok) {
        const { data } = await paymentsRes.json();
        setPayments(Array.isArray(data) ? data : data.transactions ?? []);
      }
    } catch {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isLoaded && userId) fetchAll();
  }, [isLoaded, userId, fetchAll]);

  const revokeKey = async (apiKey: string) => {
    const res = await fetch(`/api/keys?apiKey=${apiKey}`, { method: 'DELETE' });
    if (res.ok) {
      setApiKeys(k => k.filter(a => a.apiKey !== apiKey));
      toast.success('API key revoked');
    } else {
      toast.error('Failed to revoke key');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <RefreshCw className="h-12 w-12 text-blue-400" />
        </motion.div>
      </div>
    );
  }

  const quotaPct = stats
    ? stats.callsLimit === 999_999_999
      ? 0
      : Math.round((stats.callsThisMonth / stats.callsLimit) * 100)
    : 0;

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid #334155' } }} />

      <div className="space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-100">
              Welcome back{user?.firstName ? `, ${user.firstName}` : ''}!
            </h1>
            <p className="text-slate-400 mt-2">
              {stats?.tier ? (
                <span>Plan: <span className="capitalize font-semibold text-blue-400">{stats.tier}</span> · {stats.activeApis} active API{stats.activeApis !== 1 ? 's' : ''}</span>
              ) : 'Monitor your API usage and payments'}
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={fetchAll}
            className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors">
            <RefreshCw className="h-4 w-4" /> Refresh
          </motion.button>
        </motion.div>

        {/* Stats Grid */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Activity className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-slate-100">{stats?.totalCalls ?? 0}</span>
            </div>
            <h3 className="text-sm text-slate-400">Total API Calls</h3>
            <p className="mt-1 text-xs text-slate-500">{stats?.callsThisMonth ?? 0} this month</p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Zap className="h-8 w-8 text-cyan-400" />
              <span className="text-2xl font-bold text-slate-100">{stats?.cacheHitRate ?? 0}%</span>
            </div>
            <h3 className="text-sm text-slate-400">Cache Hit Rate</h3>
            <p className="mt-1 text-xs text-slate-500">{stats?.cacheHits ?? 0} cached responses</p>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Clock className="h-8 w-8 text-purple-400" />
              <span className="text-2xl font-bold text-slate-100">{stats?.avgResponseTime ?? 0}ms</span>
            </div>
            <h3 className="text-sm text-slate-400">Avg Response Time</h3>
            <div className="mt-1 flex items-center gap-1 text-xs text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>{stats?.successRate ?? 100}% success rate</span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="h-8 w-8 text-pink-400" />
              <span className="text-2xl font-bold text-slate-100">
                {stats?.remainingCalls === 999_999_999 ? '∞' : (stats?.remainingCalls ?? 0)}
              </span>
            </div>
            <h3 className="text-sm text-slate-400">Calls Remaining</h3>
            <div className="mt-2">
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(quotaPct, 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${
                    quotaPct > 80 ? 'bg-red-400' : quotaPct > 60 ? 'bg-yellow-400' : 'bg-gradient-to-r from-blue-400 to-cyan-400'
                  }`}
                />
              </div>
              <p className="mt-1 text-xs text-slate-500">{quotaPct}% of {stats?.callsLimit === 999_999_999 ? '∞' : stats?.callsLimit} used</p>
            </div>
          </div>
        </motion.div>

        {/* Charts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="grid lg:grid-cols-2 gap-6">

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-bold text-slate-100">Response Status Distribution</h2>
            </div>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="status" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No call data yet</div>
            )}
          </div>

          <div className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <PieChart className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-bold text-slate-100">Status Breakdown</h2>
            </div>
            {methodData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <RechartsPieChart>
                  <Pie data={methodData} cx="50%" cy="50%" outerRadius={80}
                    label={(e) => `${e.name}: ${e.value}`} dataKey="value" labelLine={false}>
                    {methodData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }} />
                </RechartsPieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[220px] text-slate-500 text-sm">No call data yet</div>
            )}
          </div>
        </motion.div>

        {/* API Keys */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Link2 className="h-6 w-6 text-blue-400" />
              <h2 className="text-xl font-bold text-slate-100">Active API Keys</h2>
            </div>
            <span className="text-sm text-slate-400">{apiKeys.length} active</span>
          </div>

          {apiKeys.length === 0 ? (
            <p className="text-slate-500 text-sm text-center py-8">No API keys yet. Create one to get started.</p>
          ) : (
            <div className="space-y-4">
              {apiKeys.map((api, i) => (
                <motion.div key={api.id}
                  initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                  className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-200 mb-1">{api.apiName}</p>
                      <p className="text-xs font-mono text-slate-500 mb-2 truncate">{api.apiKey}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span className="flex items-center gap-1"><Activity className="h-3 w-3" />{api.callCountTotal} calls</span>
                        {api.lastAccessed && (
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{timeAgo(api.lastAccessed)}</span>
                        )}
                        <span className="flex items-center gap-1"><Database className="h-3 w-3" />Sheet: {api.sheetId.slice(0, 12)}...</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <a href={api.sheetUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-slate-700 transition-colors">
                        <ExternalLink className="h-4 w-4 text-slate-400" />
                      </a>
                      <button onClick={() => revokeKey(api.apiKey)}
                        className="p-2 rounded-lg hover:bg-red-500/10 transition-colors group">
                        <Trash2 className="h-4 w-4 text-slate-400 group-hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Calls + Payments */}
        <div className="grid lg:grid-cols-2 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Activity className="h-6 w-6 text-cyan-400" />
              <h2 className="text-xl font-bold text-slate-100">Recent API Calls</h2>
            </div>

            {calls.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No calls yet — start hitting your endpoints!</p>
            ) : (
              <div className="space-y-3">
                {calls.slice(0, 8).map((call, i) => (
                  <motion.div key={call.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }}
                    className="rounded-lg border border-slate-700 bg-slate-900/50 p-3">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-medium ${
                          call.statusCode < 300 ? 'bg-green-500/10 text-green-400' :
                          call.statusCode < 500 ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>{call.statusCode}</span>
                        {call.cacheHit && (
                          <span className="px-2 py-0.5 rounded text-xs bg-purple-500/10 text-purple-400">⚡ cached</span>
                        )}
                        {call.responseTimeMs && (
                          <span className="text-xs text-slate-500">{call.responseTimeMs}ms</span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500">{timeAgo(call.timestamp)}</span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 truncate">{call.api.apiName} — {call.endpoint}</p>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            className="rounded-xl border border-slate-700 bg-slate-800/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Wallet className="h-6 w-6 text-green-400" />
              <h2 className="text-xl font-bold text-slate-100">EGLD Transactions</h2>
            </div>

            {payments.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No payments yet. Upgrade to Pro to unlock more quota.</p>
            ) : (
              <div className="space-y-3">
                {payments.map((p, i) => (
                  <motion.div key={p.id}
                    initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.05 }}
                    className="rounded-lg border border-slate-700 bg-slate-900/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-400" />
                        <span className="font-bold text-slate-100">{p.amountEgld} EGLD</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {p.status === 'confirmed' && <CheckCircle2 className="h-4 w-4 text-green-400" />}
                        {p.status === 'pending'   && <AlertCircle  className="h-4 w-4 text-yellow-400" />}
                        {p.status === 'failed'    && <XCircle      className="h-4 w-4 text-red-400" />}
                        <span className={`text-xs font-medium capitalize ${
                          p.status === 'confirmed' ? 'text-green-400' :
                          p.status === 'pending'   ? 'text-yellow-400' : 'text-red-400'
                        }`}>{p.status}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />{timeAgo(p.createdAt)}
                      </span>
                      <a href={`https://explorer.multiversx.com/transactions/${p.txHash}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-blue-400 hover:text-blue-300">
                        <ExternalLink className="h-3 w-3" />Explorer
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
