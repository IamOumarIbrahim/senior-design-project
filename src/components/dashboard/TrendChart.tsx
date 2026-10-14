import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendDataPoint } from '../../types';

interface TrendChartProps {
  data: TrendDataPoint[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-lg text-[12px] space-y-1 z-50">
        <div className="font-semibold text-slate-800 border-b border-slate-100 pb-1 mb-1">
          {label}
        </div>
        <div className="flex items-center justify-between space-x-4 text-blue-600">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Distractions:</span>
          </span>
          <span className="font-bold">{payload[0]?.value || 0}</span>
        </div>
        <div className="flex items-center justify-between space-x-4 text-amber-600">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Drowsiness:</span>
          </span>
          <span className="font-bold">{payload[1]?.value || 0}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const TrendChart: React.FC<TrendChartProps> = ({ data, loading = false }) => {
  // Filter tick marks for x-axis to show every 3 hours (00:00, 03:00, 06:00, 09:00, 12:00, 15:00, 18:00, 21:00)
  const ticks = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs transition-card hover:border-slate-300 flex flex-col justify-between h-[280px]">
      {/* Header and Legend */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
          Distraction & Drowsiness Trend
        </h3>
        <div className="flex items-center space-x-4 text-[12px] font-medium text-slate-600">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block" />
            <span>Distractions</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
            <span>Drowsiness</span>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="w-full h-[210px] -ml-3">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-sm">
            Loading trend data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 10, right: 15, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="time"
                ticks={ticks}
                axisLine={{ stroke: '#f1f5f9' }}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                dy={6}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94a3b8', fontSize: 11 }}
                domain={[0, 8]}
                ticks={[0, 2, 4, 6, 8]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="distractions"
                stroke="#3b82f6"
                strokeWidth={2.2}
                dot={{ r: 2.5, fill: '#3b82f6', strokeWidth: 1 }}
                activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="drowsiness"
                stroke="#f59e0b"
                strokeWidth={2.2}
                dot={{ r: 2.5, fill: '#f59e0b', strokeWidth: 1 }}
                activeDot={{ r: 5, stroke: '#ffffff', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
