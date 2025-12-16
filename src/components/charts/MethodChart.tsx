'use client';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';

interface MethodChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function MethodChart({ data }: MethodChartProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const percent = ((payload[0].value / data.reduce((acc, item) => acc + item.value, 0)) * 100).toFixed(1);
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900/95 p-3 shadow-lg backdrop-blur">
          <p className="text-sm font-medium text-slate-300 mb-1">{payload[0].name}</p>
          <div className="flex items-center gap-2">
            <div 
              className="h-2 w-2 rounded-full" 
              style={{ backgroundColor: payload[0].payload.fill }}
            />
            <span className="text-xs text-slate-400">Calls:</span>
            <span className="text-xs font-bold text-slate-100">{payload[0].value}</span>
            <span className="text-xs text-slate-500">({percent}%)</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderLabel = (entry: any) => {
    const percent = ((entry.value / data.reduce((acc, item) => acc + item.value, 0)) * 100).toFixed(0);
    return `${percent}%`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
      className="rounded-xl border border-slate-700 bg-slate-800/50 p-6"
    >
      <h3 className="text-xl font-bold text-slate-100 mb-6">Request Methods</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderLabel}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '14px' }}
            iconType="circle"
          />
        </PieChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
