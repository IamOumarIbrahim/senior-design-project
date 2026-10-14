import React, { useState } from 'react';
import { Car } from 'lucide-react';
import { RecentTripTimeline, RecentTripTimelinePoint } from '../../types';

interface TripTimelineProps {
  timeline: RecentTripTimeline | null;
  loading?: boolean;
  onViewAll?: () => void;
}

export const TripTimeline: React.FC<TripTimelineProps> = ({
  timeline,
  loading = false,
  onViewAll,
}) => {
  const [hoveredPoint, setHoveredPoint] = useState<RecentTripTimelinePoint | null>(null);

  // Fallback milestones from the reference image if timeline data is empty
  const defaultMilestones = [
    '06:12',
    '07:45',
    '09:20',
    '11:03',
    '12:17',
    '14:32',
    '16:08',
    '18:47',
    '20:15',
  ];

  const milestones = timeline?.milestones?.length ? timeline.milestones : defaultMilestones;

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs transition-card hover:border-slate-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
            Recent Trip Timeline
          </h3>
          {timeline && (
            <span className="text-[11.5px] font-medium text-slate-400 bg-slate-100/70 px-2 py-0.5 rounded-md">
              {timeline.distanceKm} km • {timeline.durationFormatted}
            </span>
          )}
        </div>
        <button
          onClick={onViewAll}
          className="text-[12.5px] font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center space-x-1"
        >
          <span>View all</span>
          <span className="text-sm">→</span>
        </button>
      </div>

      {loading ? (
        <div className="h-16 flex items-center justify-center text-slate-400 text-xs">
          Loading trip timeline...
        </div>
      ) : !timeline ? (
        <div className="h-16 flex items-center justify-center text-slate-400 text-xs">
          No driving sessions recorded yet. Monitoring system active and ready.
        </div>
      ) : (
        <div className="relative pt-1 pb-1">
          {/* Timeline Bar Track */}
          <div className="flex items-center space-x-4">
            {/* Car Icon on Left */}
            <div className="text-slate-700 shrink-0">
              <Car className="w-5 h-5 stroke-[2] text-slate-800" />
            </div>

            {/* Horizontal Track Bar with Event Dots */}
            <div className="flex-1 relative py-2">
              {/* Background Line */}
              <div className="w-full h-1.5 bg-slate-100 rounded-full relative" />

              {/* Event Dots */}
              {timeline.points.map((pt) => (
                <div
                  key={pt.id}
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ left: `${pt.percentageOffset}%` }}
                  className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-pointer transition-transform hover:scale-150 z-20 group"
                >
                  <span
                    className="block w-2.5 h-2.5 rounded-full ring-2 ring-white shadow-xs"
                    style={{ backgroundColor: pt.color }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Time Milestone Labels Underneath */}
          <div className="flex items-center space-x-4 mt-2">
            <div className="w-5 shrink-0" />
            <div className="flex-1 flex justify-between text-[11px] font-medium text-slate-400 tabular-nums select-none px-1">
              {milestones.map((m, idx) => (
                <span key={`${m}-${idx}`}>{m}</span>
              ))}
            </div>
          </div>

          {/* Hover Event Popover */}
          {hoveredPoint && (
            <div className="mt-3 text-[11.5px] text-slate-700 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: hoveredPoint.color }}
                />
                <span className="font-semibold text-slate-900">
                  {hoveredPoint.timeFormatted} — {hoveredPoint.title}
                </span>
                <span className="text-slate-500">
                  ({hoveredPoint.description}, ~{hoveredPoint.durationSeconds}s)
                </span>
              </div>
              <span className="text-slate-400 text-[10.5px]">
                Offset: {hoveredPoint.percentageOffset}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
