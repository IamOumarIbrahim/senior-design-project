import React from 'react';
import { Eye, Smartphone, AlertCircle, Coffee, ShieldAlert } from 'lucide-react';
import { RecentDetectionItem } from '../../types';

interface RecentDetectionsProps {
  items: RecentDetectionItem[];
  loading?: boolean;
  onViewAll?: () => void;
}

const SleepZIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M4 7h4l-4 5h4" />
    <path d="M12 11h4l-4 5h4" />
    <path d="M16 4h4l-4 4h4" />
  </svg>
);

export const RecentDetections: React.FC<RecentDetectionsProps> = ({
  items,
  loading = false,
  onViewAll,
}) => {
  const getIconAndStyle = (type: string, _rawType?: string) => {
    switch (type) {
      case 'holding_phone':
      case 'phone_use':
        return {
          icon: Smartphone,
          bg: 'bg-purple-50/90 text-purple-600 border-purple-100/60',
        };
      case 'drinking':
        return {
          icon: Coffee,
          bg: 'bg-cyan-50/90 text-cyan-600 border-cyan-100/60',
        };
      case 'looking_away':
      case 'visual_distraction':
        return {
          icon: Eye,
          bg: 'bg-red-50/90 text-red-500 border-red-100/60',
        };
      case 'hands_covering_mouth_yawning':
        return {
          icon: ShieldAlert,
          bg: 'bg-orange-50/90 text-orange-600 border-orange-100/60',
        };
      case 'yawning':
      case 'drowsiness':
        return {
          icon: SleepZIcon,
          bg: 'bg-amber-50/90 text-amber-500 border-amber-100/60',
        };
      default:
        return {
          icon: AlertCircle,
          bg: 'bg-slate-50 text-slate-500 border-slate-200/60',
        };
    }
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs transition-card hover:border-slate-300 flex flex-col justify-between h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
          Recent Detections
        </h3>
        <button
          onClick={onViewAll}
          className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center space-x-1"
        >
          <span>View all</span>
          <span className="text-sm">→</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3.5 flex-1">
        {loading ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
            Loading recent detections...
          </div>
        ) : items.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400 text-xs">
            No detections recorded in this period.
          </div>
        ) : (
          items.slice(0, 6).map((item) => {
            const style = getIconAndStyle(item.type, item.rawType);
            const Icon = style.icon;

            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-1 group hover:bg-slate-50/60 -mx-2 px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border ${style.bg}`}
                  >
                    <Icon className="w-4 h-4 stroke-[2]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[13px] font-semibold text-slate-900 leading-tight truncate">
                      {item.title}
                    </div>
                    <div className="text-[11px] text-slate-400 font-normal leading-tight mt-0.5 truncate">
                      {item.description}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 ml-3">
                  <div className="text-[12px] font-medium text-slate-700 tabular-nums leading-tight">
                    {item.timeFormatted}
                  </div>
                  <div className="text-[10.5px] text-slate-400 font-normal leading-tight mt-0.5 tabular-nums">
                    {item.durationFormatted}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
