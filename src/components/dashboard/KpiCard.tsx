import React from 'react';
import { 
  AlertTriangle, 
  ShieldCheck, 
  ArrowUp, 
  ArrowDown
} from 'lucide-react';
import { DashboardKPIs } from '../../types';

interface KpiCardsGridProps {
  kpis: DashboardKPIs;
  loading?: boolean;
}

// Custom steering wheel SVG icon matching the clean icon in reference
const SteeringWheelIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v6" />
    <path d="M4 14l5-2" />
    <path d="M20 14l-5-2" />
  </svg>
);

// Custom "zZz" sleep icon matching the reference
const SleepIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 6h5l-5 6h5" />
    <path d="M13 11h4l-4 5h4" />
    <path d="M17 4h3l-3 3h3" />
  </svg>
);

export const KpiCardsGrid: React.FC<KpiCardsGridProps> = ({ kpis, loading = false }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* 1. Total Drive Time */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs flex items-center space-x-4 transition-card hover:border-slate-300">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
          <SteeringWheelIcon className="w-6 h-6 text-slate-800" />
        </div>
        <div className="min-w-0">
          <span className="text-[13px] font-medium text-slate-500 block truncate">
            Total Drive Time
          </span>
          <div className="text-[25px] font-bold text-slate-900 tracking-tight leading-tight my-0.5">
            {loading ? '...' : kpis.totalDriveTimeFormatted}
          </div>
          <div className="flex items-center space-x-1 text-[12px] font-medium text-emerald-600">
            {kpis.driveTimeChangePct >= 0 ? (
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.4]" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.4]" />
            )}
            <span>
              {Math.abs(kpis.driveTimeChangePct)}% vs. last week
            </span>
          </div>
        </div>
      </div>

      {/* 2. Distraction Detections */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs flex items-center space-x-4 transition-card hover:border-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center text-red-500 shrink-0 border border-red-100/50">
          <AlertTriangle className="w-6 h-6 stroke-[2.2] fill-red-50" />
        </div>
        <div className="min-w-0">
          <span className="text-[13px] font-medium text-slate-500 block truncate">
            Distraction Detections
          </span>
          <div className="text-[25px] font-bold text-slate-900 tracking-tight leading-tight my-0.5">
            {loading ? '...' : kpis.distractionCount}
          </div>
          <div className="flex items-center space-x-1 text-[12px] font-medium text-emerald-600">
            {kpis.distractionChangePct <= 0 ? (
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.4]" />
            ) : (
              <ArrowUp className="w-3.5 h-3.5 text-rose-500 stroke-[2.4]" />
            )}
            <span>
              {Math.abs(kpis.distractionChangePct)}% vs. last week
            </span>
          </div>
        </div>
      </div>

      {/* 3. Drowsiness Detections */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs flex items-center space-x-4 transition-card hover:border-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 border border-blue-100/50">
          <SleepIcon className="w-6 h-6 text-blue-500" />
        </div>
        <div className="min-w-0">
          <span className="text-[13px] font-medium text-slate-500 block truncate">
            Drowsiness Detections
          </span>
          <div className="text-[25px] font-bold text-slate-900 tracking-tight leading-tight my-0.5">
            {loading ? '...' : kpis.drowsinessCount}
          </div>
          <div className="flex items-center space-x-1 text-[12px] font-medium text-emerald-600">
            {kpis.drowsinessChangePct <= 0 ? (
              <ArrowDown className="w-3.5 h-3.5 stroke-[2.4]" />
            ) : (
              <ArrowUp className="w-3.5 h-3.5 text-rose-500 stroke-[2.4]" />
            )}
            <span>
              {Math.abs(kpis.drowsinessChangePct)}% vs. last week
            </span>
          </div>
        </div>
      </div>

      {/* 4. Longest Clean Stretch */}
      <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs flex items-center space-x-4 transition-card hover:border-slate-300">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-500 shrink-0 border border-blue-100/50">
          <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
        </div>
        <div className="min-w-0">
          <span className="text-[13px] font-medium text-slate-500 block truncate">
            Longest Clean Stretch
          </span>
          <div className="text-[25px] font-bold text-slate-900 tracking-tight leading-tight my-0.5">
            {loading ? '...' : kpis.longestCleanStretchFormatted}
          </div>
          <div className="flex items-center space-x-1 text-[12px] font-medium text-emerald-600">
            {kpis.cleanStretchChangePct >= 0 ? (
              <ArrowUp className="w-3.5 h-3.5 stroke-[2.4]" />
            ) : (
              <ArrowDown className="w-3.5 h-3.5 text-rose-500 stroke-[2.4]" />
            )}
            <span>
              {Math.abs(kpis.cleanStretchChangePct)}% vs. last week
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
