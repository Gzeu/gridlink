'use client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { motion } from 'framer-motion';

interface StatusChartProps {
  data: Array<{
    status: string;
    count: number;
  }>;
}

export default function StatusChart({ data }: StatusChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-slate-300 mb-1">Status {label}</p>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cyan-400" />
            <span className="text-xs text-slate-400">Count:</span>
            <span className="text-xs font-bold text-slate-100">{payload[0].value}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const getBarColor = (status: string) => {
    if (status.startsWith('2')) return '#22d3ee'; // cyan-400
    if (status.startsWith('3')) return '#a855f7'; // purple-500
    if (status.startsWith('4')) return '#fb923c'; // orange-400
    if (status.startsWith('5')) return '#ef4444'; // red-500
    return '#64748b'; // slate-500
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7 }}
      className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
    >
      <h3 className="text-xl font-bold text-slate-100 mb-6">Status Codes</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis 
            dataKey="status" 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="count" 
            fill="#22d3ee"
            radius={[8, 8, 0, 0]}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
