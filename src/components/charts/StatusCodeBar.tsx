'use client';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface StatusCodeBarProps {
  data: Array<{
    status: string;
    count: number;
  }>;
}

const getStatusColor = (status: string) => {
  const code = parseInt(status);
  if (code >= 200 && code < 300) return '#10b981'; // Green for 2xx
  if (code >= 300 && code < 400) return '#3b82f6'; // Blue for 3xx
  if (code >= 400 && code < 500) return '#f59e0b'; // Orange for 4xx
  if (code >= 500) return '#ef4444'; // Red for 5xx
  return '#64748b'; // Gray for others
};

const getStatusLabel = (status: string) => {
  const code = parseInt(status);
  if (code >= 200 && code < 300) return 'Success';
  if (code >= 300 && code < 400) return 'Redirect';
  if (code >= 400 && code < 500) return 'Client Error';
  if (code >= 500) return 'Server Error';
  return 'Other';
};

export default function StatusCodeBar({ data }: StatusCodeBarProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-100 mb-1">
            {data.payload.status} - {getStatusLabel(data.payload.status)}
          </p>
          <p className="text-xs text-slate-400">
            {data.value} requests
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[300px] mt-4"
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} />
          <XAxis
            dataKey="status"
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tickLine={false}
          />
          <YAxis
            stroke="#94a3b8"
            style={{ fontSize: '12px' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1e293b' }} />
          <Bar
            dataKey="count"
            radius={[8, 8, 0, 0]}
            animationDuration={800}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getStatusColor(entry.status)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 justify-center">
        {[
          { label: '2xx Success', color: '#10b981' },
          { label: '3xx Redirect', color: '#3b82f6' },
          { label: '4xx Client Error', color: '#f59e0b' },
          { label: '5xx Server Error', color: '#ef4444' },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-slate-400">{item.label}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
