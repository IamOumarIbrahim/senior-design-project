import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  Lightbulb, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  Clock, 
  Calendar,
  ShieldCheck
} from 'lucide-react';
import { StatisticsInsights, HeatmapCell, TrendDataPoint, DetectionBreakdown } from '../../types';

interface StatisticsViewProps {
  insights: StatisticsInsights;
  trendData: TrendDataPoint[];
  breakdown: DetectionBreakdown;
  heatmapData: HeatmapCell[];
  loading?: boolean;
}

export const StatisticsView: React.FC<StatisticsViewProps> = ({
  insights,
  trendData,
  breakdown,
  heatmapData,
  loading = false,
}) => {
  // Aggregate detections by day of week for bar chart
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weekdayData = daysOfWeek.map((day) => {
    const dayCells = heatmapData.filter((c) => c.dayName === day);
    const distractions = dayCells.reduce((acc, curr) => acc + curr.distractions, 0);
    const drowsiness = dayCells.reduce((acc, curr) => acc + curr.drowsiness, 0);
    return {
      day,
      distractions,
      drowsiness,
      total: distractions + drowsiness,
    };
  });

  return (
    <div className="space-y-6">
      {/* Derived Insights Banner */}
      <div className="bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-white border border-blue-100 rounded-2xl p-6 shadow-xs">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-blue-500/30">
            <Lightbulb className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Behavioral Pattern Insights
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Derived automatically from your local driving records to help identify recurring habits
            </p>

            {/* List of generated insights */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
              {insights.insightsList.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white/90 border border-slate-200/60 rounded-xl p-3 flex items-start space-x-2.5 text-xs text-slate-700 shadow-2xs"
                >
                  {item.type === 'positive' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : item.type === 'warning' ? (
                    <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  ) : (
                    <TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  )}
                  <span className="leading-relaxed font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4 Summary Highlight Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium mb-1">
            <Clock className="w-4 h-4 text-red-500" />
            <span>Peak Distraction Window</span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {insights.peakDistractionWindow}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Evening commute traffic
          </span>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium mb-1">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>Peak Drowsiness Window</span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {insights.peakDrowsinessWindow}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Early morning start
          </span>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Clean Driving Ratio</span>
          </div>
          <div className="text-xl font-bold text-emerald-600 mt-1">
            {insights.cleanDrivingRatio}%
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Drive time without alert triggers
          </span>
        </div>

        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-slate-400 text-xs font-medium mb-1">
            <Calendar className="w-4 h-4 text-blue-500" />
            <span>Avg Clean Driving Stretch</span>
          </div>
          <div className="text-xl font-bold text-slate-900 mt-1">
            {insights.averageCleanStretchFormatted}
          </div>
          <span className="text-[11px] text-slate-400 mt-0.5 block">
            Per typical 60m session
          </span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Hourly Distribution Bar Chart */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Detections by Hour of Day
            </h4>
            <div className="flex items-center space-x-3 text-xs text-slate-500">
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span>Distraction</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span>Drowsiness</span>
              </span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="distractions" fill="#3b82f6" radius={[3, 3, 0, 0]} stackId="a" />
                <Bar dataKey="drowsiness" fill="#f59e0b" radius={[3, 3, 0, 0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detections by Weekday */}
        <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Detections by Day of Week
            </h4>
            <span className="text-xs text-slate-400">Total weekly frequency</span>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekdayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    borderColor: '#e2e8f0',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="distractions" fill="#3b82f6" radius={[3, 3, 0, 0]} name="Distractions" />
                <Bar dataKey="drowsiness" fill="#f59e0b" radius={[3, 3, 0, 0]} name="Drowsiness" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
