import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { DetectionBreakdown } from '../../types';

interface BreakdownChartProps {
  breakdown: DetectionBreakdown;
  loading?: boolean;
}

export const BreakdownChart: React.FC<BreakdownChartProps> = ({
  breakdown,
  loading = false,
}) => {
  const isZero = breakdown.total === 0;
  const chartData = isZero
    ? [{ count: 1, color: '#f1f5f9', name: 'No Detections' }]
    : breakdown.items.filter((item) => item.count > 0);

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs transition-card hover:border-slate-300 flex flex-col justify-between h-[280px]">
      <h3 className="text-[15px] font-bold text-slate-900 tracking-tight mb-2">
        Detection Breakdown
      </h3>

      <div className="flex items-center justify-between h-[210px]">
        {/* Donut Chart with Center Total */}
        <div className="relative w-[190px] h-[190px] flex items-center justify-center shrink-0">
          {loading ? (
            <div className="text-slate-400 text-xs">Loading...</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  {!isZero && (
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value} detections`, name]}
                      contentStyle={{
                        backgroundColor: '#ffffff',
                        borderColor: '#e2e8f0',
                        borderRadius: '10px',
                        fontSize: '12px',
                      }}
                    />
                  )}
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={isZero ? 0 : 2}
                    dataKey="count"
                    strokeWidth={0}
                    isAnimationActive={false}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

              {/* Center Stat */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[28px] font-extrabold text-slate-900 leading-none">
                  {breakdown.total}
                </span>
                <span className="text-[10.5px] font-medium text-slate-400 mt-1">
                  Total Detections
                </span>
              </div>
            </>
          )}
        </div>

        {/* Legend List on Right */}
        <div className="flex-1 pl-4 space-y-3">
          {breakdown.items.map((item) => (
            <div
              key={item.category}
              className="flex items-center justify-between text-[12.5px]"
            >
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-slate-600 font-medium truncate">
                  {item.name}
                </span>
              </div>
              <div className="text-slate-700 font-semibold tabular-nums ml-2">
                {item.count}{' '}
                <span className="text-slate-400 font-normal">
                  ({item.percentage}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
