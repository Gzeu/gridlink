'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Toaster, toast } from 'react-hot-toast';
import { TrendingUp, PieChart as PieChartIcon, BarChart3, Calendar, RefreshCw } from 'lucide-react';
import UsageChart from '@/components/charts/UsageChart';
import MethodChart from '@/components/charts/MethodChart';
import StatusChart from '@/components/charts/StatusChart';

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  
  const [usageData, setUsageData] = useState([
    { date: 'Dec 10', calls: 45, cached: 32 },
    { date: 'Dec 11', calls: 52, cached: 38 },
    { date: 'Dec 12', calls: 38, cached: 28 },
    { date: 'Dec 13', calls: 61, cached: 45 },
    { date: 'Dec 14', calls: 48, cached: 35 },
    { date: 'Dec 15', calls: 55, cached: 41 },
    { date: 'Dec 16', calls: 68, cached: 52 },
  ]);

  const [methodData, setMethodData] = useState([
    { name: 'GET', value: 245, color: '#22d3ee' },
    { name: 'POST', value: 89, color: '#3b82f6' },
    { name: 'PUT', value: 23, color: '#a855f7' },
    { name: 'DELETE', value: 12, color: '#ef4444' },
  ]);

  const [statusData, setStatusData] = useState([
    { status: '200', count: 298 },
    { status: '201', count: 45 },
    { status: '304', count: 12 },
    { status: '400', count: 8 },
    { status: '404', count: 5 },
    { status: '500', count: 1 },
  ]);

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      // Simulate API call - Replace with real endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      toast.success('Analytics loaded');
    } catch (error) {
      toast.error('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const insights = [
    {
      icon: TrendingUp,
      title: 'Peak Hour',
      value: '3:00 PM',
      subtitle: 'Most active time',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: PieChartIcon,
      title: 'Top Method',
      value: 'GET',
      subtitle: '66% of all requests',
      color: 'from-cyan-500 to-purple-500',
    },
    {
      icon: BarChart3,
      title: 'Success Rate',
      value: '98.6%',
      subtitle: '365/370 successful',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Calendar,
      title: 'Avg Daily',
      value: '53 calls',
      subtitle: 'Last 7 days',
      color: 'from-pink-500 to-orange-500',
    },
  ];

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
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold text-slate-100">Analytics</h1>
            <p className="text-slate-400 mt-2">Deep insights into your API performance</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-lg bg-slate-800 border border-slate-700 px-4 py-2 text-sm text-slate-300 focus:border-blue-400 focus:outline-none"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
            </select>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={loadAnalytics}
              className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </motion.button>
          </div>
        </motion.div>

        {/* Insights Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {insights.map((insight, index) => (
            <motion.div
              key={insight.title}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + index * 0.05 }}
              whileHover={{ y: -5 }}
              className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
            >
              <div className={`inline-flex rounded-xl bg-gradient-to-r ${insight.color} p-3 mb-4`}>
                <insight.icon className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-sm text-slate-400 mb-1">{insight.title}</h3>
              <p className="text-2xl font-bold text-slate-100 mb-1">{insight.value}</p>
              <p className="text-xs text-slate-500">{insight.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Usage Timeline - Full Width */}
        <UsageChart data={usageData} />

        {/* Charts Grid */}
        <div className="grid lg:grid-cols-2 gap-8">
          <MethodChart data={methodData} />
          <StatusChart data={statusData} />
        </div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
        >
          <h3 className="text-xl font-bold text-slate-100 mb-6">Performance Breakdown</h3>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Cache Hit Rate</span>
                <span className="font-bold text-purple-400">73%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '73%' }}
                  transition={{ duration: 1, delay: 1 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Avg Response Time</span>
                <span className="font-bold text-cyan-400">89ms</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '25%' }}
                  transition={{ duration: 1, delay: 1.1 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
                />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Error Rate</span>
                <span className="font-bold text-green-400">1.4%</span>
              </div>
              <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: '1.4%' }}
                  transition={{ duration: 1, delay: 1.2 }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Geographic Distribution Placeholder */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
        >
          <h3 className="text-xl font-bold text-slate-100 mb-6">Top Request Origins</h3>
          <div className="space-y-4">
            {[
              { country: 'United States', flag: '🇺🇸', requests: 145, percent: 39 },
              { country: 'Germany', flag: '🇩🇪', requests: 89, percent: 24 },
              { country: 'United Kingdom', flag: '🇬🇧', requests: 67, percent: 18 },
              { country: 'France', flag: '🇫🇷', requests: 42, percent: 11 },
              { country: 'Others', flag: '🌍', requests: 26, percent: 8 },
            ].map((item, index) => (
              <motion.div
                key={item.country}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 + index * 0.05 }}
                className="flex items-center gap-4"
              >
                <span className="text-2xl">{item.flag}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-slate-300">{item.country}</span>
                    <span className="text-xs text-slate-500">{item.requests} requests</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percent}%` }}
                      transition={{ duration: 0.8, delay: 1.1 + index * 0.05 }}
                      className="h-full bg-gradient-to-r from-blue-400 to-cyan-400"
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
}
