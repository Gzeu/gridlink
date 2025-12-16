'use client';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface MethodDistributionProps {
  data: Array<{
    method: string;
    count: number;
  }>;
}

const COLORS = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#a855f7',
  DELETE: '#ef4444',
  PATCH: '#f59e0b',
};

export default function MethodDistribution({ data }: MethodDistributionProps) {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="rounded-lg border border-slate-700 bg-slate-900 p-3 shadow-lg">
          <p className="text-sm font-medium text-slate-100 mb-1">
            {data.name}
          </p>
          <p className="text-xs text-slate-400">
            {data.value} requests ({((data.value / data.payload.total) * 100).toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    if (percent < 0.05) return null;

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-semibold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const total = data.reduce((sum, item) => sum + item.count, 0);
  const enrichedData = data.map(item => ({ ...item, total }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="w-full h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={enrichedData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="count"
            nameKey="method"
            animationBegin={0}
            animationDuration={800}
          >
            {enrichedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[entry.method as keyof typeof COLORS] || '#64748b'}
                stroke="#0f172a"
                strokeWidth={2}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: '12px', color: '#94a3b8' }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Stats Below Chart */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div
            key={item.method}
            className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2"
          >
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{
                  backgroundColor: COLORS[item.method as keyof typeof COLORS] || '#64748b',
                }}
              />
              <span className="text-sm font-medium text-slate-300">{item.method}</span>
            </div>
            <span className="text-sm font-bold text-slate-100">{item.count}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
