import React, { useState } from 'react';
import { 
  Car, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  ChevronRight, 
  Calendar,
  Search
} from 'lucide-react';
import { Trip, Detection } from '../../types';
import { formatDuration } from '../../services/db/queries';
import { TripDetailModal } from './TripDetailModal';
import { api } from '../../services/api';

interface TripsViewProps {
  trips: Trip[];
  loading?: boolean;
}

export const TripsView: React.FC<TripsViewProps> = ({ trips, loading = false }) => {
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [tripDetections, setTripDetections] = useState<Detection[]>([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleTripClick = async (trip: Trip) => {
    setSelectedTrip(trip);
    setLoadingDetails(true);
    try {
      const details = await api.getTripDetails(trip.id);
      if (details) {
        setTripDetections(details.detections);
      }
    } catch (e) {
      console.error('Failed to load trip details:', e);
    } finally {
      setLoadingDetails(false);
    }
  };

  const filteredTrips = trips.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.start_location?.toLowerCase().includes(term) ||
      t.end_location?.toLowerCase().includes(term) ||
      t.start_time.includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Top action bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            Driving Sessions
          </h3>
          <p className="text-xs text-slate-500 font-normal mt-0.5">
            Review detailed metrics and safety scores for each trip
          </p>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by location or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200/80 rounded-xl text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 shadow-xs"
          />
        </div>
      </div>

      {/* Trips Table Card */}
      <div className="bg-white border border-slate-200/70 rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            Loading driving sessions...
          </div>
        ) : filteredTrips.length === 0 ? (
          <div className="py-20 text-center text-slate-400 text-xs">
            No driving sessions recorded.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-[13px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11.5px] font-semibold text-slate-500 tracking-wider">
                  <th className="py-3 px-5">TRIP / DATE</th>
                  <th className="py-3 px-4">DURATION</th>
                  <th className="py-3 px-4">DISTANCE</th>
                  <th className="py-3 px-4">DETECTIONS</th>
                  <th className="py-3 px-4">DISTRACTION</th>
                  <th className="py-3 px-4">DROWSINESS</th>
                  <th className="py-3 px-4">CLEANEST STRETCH</th>
                  <th className="py-3 px-4">SAFETY SCORE</th>
                  <th className="py-3 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredTrips.map((trip) => {
                  const s = new Date(trip.start_time);
                  const e = new Date(trip.end_time);
                  const dateStr = s.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const timeRange = `${s.getHours().toString().padStart(2, '0')}:${s.getMinutes().toString().padStart(2, '0')} – ${e.getHours().toString().padStart(2, '0')}:${e.getMinutes().toString().padStart(2, '0')}`;

                  return (
                    <tr
                      key={trip.id}
                      onClick={() => handleTripClick(trip)}
                      className="hover:bg-slate-50/70 cursor-pointer transition-colors group"
                    >
                      <td className="py-4 px-5">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Car className="w-4 h-4 stroke-[2]" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 leading-tight">
                              {dateStr}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              {timeRange}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-semibold text-slate-900">
                        {formatDuration(trip.duration_seconds)}
                      </td>

                      <td className="py-4 px-4 text-slate-600 tabular-nums">
                        {trip.distance_km} km
                      </td>

                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                          {trip.total_detections || 0}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-red-500 font-semibold tabular-nums">
                          {trip.distraction_count || 0}
                        </span>
                      </td>

                      <td className="py-4 px-4">
                        <span className="text-amber-500 font-semibold tabular-nums">
                          {trip.drowsiness_count || 0}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-emerald-600 font-semibold tabular-nums">
                        {formatDuration(trip.cleanest_stretch_seconds)}
                      </td>

                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <span
                            className={`font-bold ${
                              (trip.safety_score || 90) >= 85
                                ? 'text-emerald-600'
                                : (trip.safety_score || 90) >= 70
                                ? 'text-amber-600'
                                : 'text-rose-600'
                            }`}
                          >
                            {trip.safety_score || 90}%
                          </span>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center text-blue-600 text-xs font-semibold group-hover:translate-x-1 transition-transform">
                          <span>Details</span>
                          <ChevronRight className="w-4 h-4 ml-0.5" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trip Details Modal */}
      {selectedTrip && (
        <TripDetailModal
          trip={selectedTrip}
          detections={tripDetections}
          onClose={() => setSelectedTrip(null)}
        />
      )}
    </div>
  );
};
