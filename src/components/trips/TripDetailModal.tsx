import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Smartphone, 
  Eye, 
  Car,
  Filter
} from 'lucide-react';
import { Trip, Detection } from '../../types';
import { formatDuration, getCategoryColor, getCategoryTitle, mapRawTypeToCategory } from '../../services/db/queries';

interface TripDetailModalProps {
  trip: Trip;
  detections: Detection[];
  onClose: () => void;
}

export const TripDetailModal: React.FC<TripDetailModalProps> = ({
  trip,
  detections,
  onClose,
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const sDate = new Date(trip.start_time);
  const eDate = new Date(trip.end_time);

  const startFormatted = `${sDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} • ${sDate.getHours().toString().padStart(2, '0')}:${sDate.getMinutes().toString().padStart(2, '0')}`;

  const endFormatted = `${eDate.getHours().toString().padStart(2, '0')}:${eDate.getMinutes().toString().padStart(2, '0')}`;

  const filteredDetections = detections.filter((d) => {
    if (filterType === 'all') return true;
    const cat = mapRawTypeToCategory(d.detection_type);
    return cat === filterType;
  });

  const tripStartMs = new Date(trip.start_time).getTime();
  const tripEndMs = new Date(trip.end_time).getTime();
  const totalMs = Math.max(tripEndMs - tripStartMs, 1000);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200/80 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Car className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                Trip Details #{trip.id}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {startFormatted} – {endFormatted}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 stroke-[2]" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5">
              <span className="text-[11px] font-medium text-slate-400 block">
                Total Duration
              </span>
              <span className="text-base font-bold text-slate-900">
                {formatDuration(trip.duration_seconds)}
              </span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5">
              <span className="text-[11px] font-medium text-slate-400 block">
                Distance
              </span>
              <span className="text-base font-bold text-slate-900">
                {trip.distance_km} km
              </span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5">
              <span className="text-[11px] font-medium text-slate-400 block">
                Cleanest Stretch
              </span>
              <span className="text-base font-bold text-emerald-600">
                {formatDuration(trip.cleanest_stretch_seconds)}
              </span>
            </div>
            <div className="bg-slate-50/80 border border-slate-200/60 rounded-xl p-3.5">
              <span className="text-[11px] font-medium text-slate-400 block">
                Safety Score
              </span>
              <span className="text-base font-bold text-blue-600">
                {trip.safety_score || 92} / 100
              </span>
            </div>
          </div>

          {/* Locations */}
          <div className="flex items-center space-x-3 text-xs text-slate-600 bg-blue-50/50 border border-blue-100/60 rounded-xl p-3">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="font-semibold text-slate-800">
              {trip.start_location || 'Home'}
            </span>
            <span className="text-slate-400">→</span>
            <span className="font-semibold text-slate-800">
              {trip.end_location || 'Destination'}
            </span>
          </div>

          {/* Trip Timeline Bar */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-[13px] font-bold text-slate-900">
                Trip Timeline ({detections.length} Events)
              </h4>
              <span className="text-[11px] text-slate-400">
                Colored dots represent logged alert triggers
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full relative my-3">
              {detections.map((d) => {
                const ptMs = new Date(d.timestamp).getTime();
                const offset = Math.min(Math.max(((ptMs - tripStartMs) / totalMs) * 100, 0), 100);
                const cat = mapRawTypeToCategory(d.detection_type);
                return (
                  <span
                    key={d.id}
                    title={`${new Date(d.timestamp).toLocaleTimeString()}: ${d.description}`}
                    style={{
                      left: `${offset}%`,
                      backgroundColor: getCategoryColor(cat),
                    }}
                    className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full ring-2 ring-white shadow-xs cursor-pointer"
                  />
                );
              })}
            </div>
          </div>

          {/* Event Log Filter Tabs */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-[13px] font-bold text-slate-900">
                Detection Log
              </h4>
              <div className="flex items-center space-x-1 text-xs overflow-x-auto pb-1">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'holding_phone', label: 'Phone' },
                  { id: 'looking_away', label: 'Looking Away' },
                  { id: 'yawning', label: 'Yawning' },
                  { id: 'hands_covering_mouth_yawning', label: 'Covering Mouth' },
                  { id: 'drinking', label: 'Drinking' },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setFilterType(t.id)}
                    className={`px-2 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                      filterType === t.id
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {filteredDetections.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  No detection events in this category.
                </div>
              ) : (
                filteredDetections.map((d) => {
                  const cat = mapRawTypeToCategory(d.detection_type);
                  const dDate = new Date(d.timestamp);
                  const time = `${dDate.getHours().toString().padStart(2, '0')}:${dDate.getMinutes().toString().padStart(2, '0')}:${dDate.getSeconds().toString().padStart(2, '0')}`;

                  return (
                    <div
                      key={d.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50/70 border border-slate-200/50 text-xs"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: getCategoryColor(cat) }}
                        />
                        <div>
                          <span className="font-semibold text-slate-800">
                            {getCategoryTitle(cat)}
                          </span>
                          <span className="text-slate-500 ml-2">
                            — {d.description}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-slate-500">
                        <span>Confidence: {Math.round(d.confidence * 100)}%</span>
                        <span>Duration: ~{d.duration_seconds}s</span>
                        <span className="font-mono text-slate-700 font-semibold">{time}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
