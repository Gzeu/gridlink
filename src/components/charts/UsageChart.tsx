'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface UsageChartProps {
  data: Array<{
    date: string;
    calls: number;
    cached: number;
  }>;
}

export default function UsageChart({ data }: UsageChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-slate-300 mb-2">{label}</p>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-400" />
              <span className="text-xs text-slate-400">Total Calls:</span>
              <span className="text-xs font-bold text-slate-100">{payload[0].value}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-purple-400" />
              <span className="text-xs text-slate-400">Cached:</span>
              <span className="text-xs font-bold text-slate-100">{payload[1].value}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
    >
      <h3 className="text-xl font-bold text-slate-100 mb-6">7-Day API Usage</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
            iconType="circle"
          />
          <Line 
            type="monotone" 
            dataKey="calls" 
            stroke="#3b82f6" 
            strokeWidth={3}
            name="Total Calls"
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line 
            type="monotone" 
            dataKey="cached" 
            stroke="#a855f7" 
            strokeWidth={3}
            name="Cached Calls"
            dot={{ fill: '#a855f7', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
