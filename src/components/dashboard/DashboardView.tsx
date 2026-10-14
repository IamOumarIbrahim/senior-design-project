import React from 'react';
import { KpiCardsGrid } from './KpiCard';
import { TrendChart } from './TrendChart';
import { BreakdownChart } from './BreakdownChart';
import { ActivityHeatmap } from './ActivityHeatmap';
import { RecentDetections } from './RecentDetections';
import { TripTimeline } from './TripTimeline';
import {
  DashboardKPIs,
  DetectionBreakdown,
  HeatmapCell,
  RecentDetectionItem,
  RecentTripTimeline,
  TrendDataPoint,
} from '../../types';

interface DashboardViewProps {
  kpis: DashboardKPIs;
  trendData: TrendDataPoint[];
  breakdown: DetectionBreakdown;
  heatmapData: HeatmapCell[];
  recentDetections: RecentDetectionItem[];
  recentTripTimeline: RecentTripTimeline | null;
  loading?: boolean;
  onNavigateToTrips?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  kpis,
  trendData,
  breakdown,
  heatmapData,
  recentDetections,
  recentTripTimeline,
  loading = false,
  onNavigateToTrips,
}) => {
  return (
    <div className="space-y-6">
      {/* 1. Four Summary KPI Cards */}
      <KpiCardsGrid kpis={kpis} loading={loading} />

      {/* 2. Middle Row: Distraction & Drowsiness Trend + Detection Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 xl:col-span-8">
          <TrendChart data={trendData} loading={loading} />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <BreakdownChart breakdown={breakdown} loading={loading} />
        </div>
      </div>

      {/* 3. Lower Row: Heatmap & Timeline on Left, Recent Detections on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-7 xl:col-span-8 space-y-5 flex flex-col justify-between">
          <ActivityHeatmap cells={heatmapData} loading={loading} />
          <TripTimeline
            timeline={recentTripTimeline}
            loading={loading}
            onViewAll={onNavigateToTrips}
          />
        </div>
        <div className="lg:col-span-5 xl:col-span-4">
          <RecentDetections
            items={recentDetections}
            loading={loading}
            onViewAll={onNavigateToTrips}
          />
        </div>
      </div>
    </div>
  );
};
