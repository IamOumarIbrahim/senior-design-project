import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { HeatmapCell } from '../../types';

interface ActivityHeatmapProps {
  cells: HeatmapCell[];
  loading?: boolean;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  cells,
  loading = false,
}) => {
  const [hoveredCell, setHoveredCell] = useState<HeatmapCell | null>(null);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 24 }, (_, i) => i);
  const timeLabels = [
    { hour: 0, label: '00:00' },
    { hour: 3, label: '03:00' },
    { hour: 6, label: '06:00' },
    { hour: 9, label: '09:00' },
    { hour: 12, label: '12:00' },
    { hour: 15, label: '15:00' },
    { hour: 18, label: '18:00' },
    { hour: 21, label: '21:00' },
  ];

  // Helper to get cell by day name and hour
  const getCell = (day: string, hour: number): HeatmapCell => {
    return (
      cells.find((c) => c.dayName === day && c.hour === hour) || {
        dayOfWeek: 0,
        dayName: day,
        hour,
        intensity: 0,
        count: 0,
        distractions: 0,
        drowsiness: 0,
      }
    );
  };

  // Color mapping based on intensity 0 - 5 matching reference
  const getCellColor = (intensity: number) => {
    switch (intensity) {
      case 5:
        return 'bg-[#991b1b]'; // Deep crimson
      case 4:
        return 'bg-[#ea580c]'; // Burnt orange
      case 3:
        return 'bg-[#fb923c]'; // Orange
      case 2:
        return 'bg-[#fed7aa]'; // Soft peach
      case 1:
        return 'bg-[#ffedd5]'; // Very pale peach
      case 0:
      default:
        return 'bg-[#fafafa] border border-slate-100/50'; // Neutral inactive
    }
  };

  return (
    <div className="bg-white border border-slate-200/70 rounded-2xl p-5 shadow-xs transition-card hover:border-slate-300">
      {/* Header and Intensity Legend */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">
          Driving Activity Heatmap
        </h3>

        <div className="flex items-center space-x-2 text-[11px] font-medium text-slate-500">
          <span>Low</span>
          <div className="flex items-center space-x-0.5">
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-[#ffedd5]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-[#fed7aa]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-[#fb923c]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-[#ea580c]" />
            <span className="w-3.5 h-3.5 rounded-[2.5px] bg-[#991b1b]" />
          </div>
          <span>High</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[2]" />
        </div>
      </div>

      {/* Grid Container */}
      <div className="relative">
        {loading ? (
          <div className="h-44 flex items-center justify-center text-slate-400 text-sm">
            Loading heatmap...
          </div>
        ) : (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[500px]">
              {/* Rows for Mon - Sun */}
              <div className="space-y-1.5">
                {days.map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <span className="w-7 text-[11px] font-medium text-slate-400 select-none">
                      {day}
                    </span>
                    <div 
                      className="flex-1 grid gap-1"
                      style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
                    >
                      {hours.map((h) => {
                        const cell = getCell(day, h);
                        return (
                          <div
                            key={h}
                            onMouseEnter={() => setHoveredCell(cell)}
                            onMouseLeave={() => setHoveredCell(null)}
                            className={`h-4.5 rounded-[2.5px] cursor-pointer transition-all hover:scale-110 hover:ring-2 hover:ring-blue-400/50 ${getCellColor(
                              cell.intensity
                            )}`}
                          />
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Time tick labels at bottom */}
              <div className="flex items-center space-x-2 mt-2">
                <span className="w-7" />
                <div className="flex-1 flex justify-between text-[10px] text-slate-400 font-medium px-1 select-none">
                  {timeLabels.map((tl) => (
                    <span key={tl.label}>{tl.label}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hover Tooltip display */}
        {hoveredCell && (
          <div className="mt-2 text-[11.5px] text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800">
                {hoveredCell.dayName} at {hoveredCell.hour.toString().padStart(2, '0')}:00
              </span>
              {' — '}
              <span>
                {hoveredCell.count === 0
                  ? 'No detection events'
                  : `${hoveredCell.count} event${hoveredCell.count > 1 ? 's' : ''} (${hoveredCell.distractions} distraction, ${hoveredCell.drowsiness} drowsiness)`}
              </span>
            </div>
            <span className="text-slate-400 text-[10.5px]">Intensity: {hoveredCell.intensity}/5</span>
          </div>
        )}
      </div>
    </div>
  );
};
