import React, { useState, useEffect, useCallback } from 'react';
import { TitleBar } from './components/common/TitleBar';
import { Sidebar, NavItem } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { DashboardView } from './components/dashboard/DashboardView';
import { LiveMonitorView } from './components/live/LiveMonitorView';
import { TripsView } from './components/trips/TripsView';
import { StatisticsView } from './components/statistics/StatisticsView';
import { SettingsView } from './components/settings/SettingsView';
import { api } from './services/api';
import {
  DashboardKPIs,
  DateFilter,
  DetectionBreakdown,
  HeatmapCell,
  RecentDetectionItem,
  RecentTripTimeline,
  StatisticsInsights,
  SystemSettings,
  Trip,
  TrendDataPoint,
} from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<NavItem>('dashboard');
  const [dateFilter, setDateFilter] = useState<DateFilter>({
    preset: 'today',
    startDate: '2026-09-27',
    endDate: '2026-09-27',
    label: 'Sep 27, 2026',
  });

  const [loading, setLoading] = useState(true);

  // Dashboard Data State
  const [kpis, setKpis] = useState<DashboardKPIs>({
    totalDriveTimeSeconds: 0,
    totalDriveTimeFormatted: '0 m',
    driveTimeChangePct: 0,
    distractionCount: 0,
    distractionChangePct: 0,
    drowsinessCount: 0,
    drowsinessChangePct: 0,
    longestCleanStretchSeconds: 0,
    longestCleanStretchFormatted: '0 m',
    cleanStretchChangePct: 0,
  });

  const [trendData, setTrendData] = useState<TrendDataPoint[]>([]);
  const [breakdown, setBreakdown] = useState<DetectionBreakdown>({
    total: 0,
    items: [
      { category: 'visual_distraction', name: 'Visual Distraction', count: 0, percentage: 0, color: '#3b82f6' },
      { category: 'drowsiness', name: 'Drowsiness', count: 0, percentage: 0, color: '#f59e0b' },
      { category: 'phone_use', name: 'Phone Use', count: 0, percentage: 0, color: '#8b5cf6' },
      { category: 'other', name: 'Other', count: 0, percentage: 0, color: '#94a3b8' },
    ],
  });

  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [recentDetections, setRecentDetections] = useState<RecentDetectionItem[]>([]);
  const [recentTripTimeline, setRecentTripTimeline] = useState<RecentTripTimeline | null>(null);

  // Trips & Statistics & Settings
  const [trips, setTrips] = useState<Trip[]>([]);
  const [statisticsInsights, setStatisticsInsights] = useState<StatisticsInsights>({
    peakDistractionWindow: '18:00 – 20:00',
    peakDrowsinessWindow: '07:00 – 08:00',
    safestDayOfWeek: 'Sunday',
    mostAlertTripTime: 'Morning Commute',
    cleanDrivingRatio: 86,
    averageDetectionsPerTrip: 2.4,
    averageCleanStretchFormatted: '1 h 15 m',
    safetyScore: 91,
    safetyScoreChangePct: 18,
    insightsList: [],
  });

  const [settings, setSettings] = useState<SystemSettings>({
    databasePath: 'local://drivesafe.sqlite',
    monitoringActive: true,
    edgeDeviceIp: '192.168.1.142',
    lastSyncTimestamp: '2026-09-27T14:21:00Z',
    hardwareDevice: 'Raspberry Pi 5 + Raspberry Pi AI Kit (Hailo NPU)',
    cameraModel: 'Logitech Brio 100 (1080p 30 FPS)',
    audioAlertsEnabled: true,
    classesMonitored: [
      'Holding a phone',
      'Yawning',
      'Hands covering mouth while yawning',
      'Drinking',
      'Looking away',
    ],
    privacyTelemetryDisabled: true,
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [
        fetchedKpis,
        fetchedTrend,
        fetchedBreakdown,
        fetchedHeatmap,
        fetchedRecent,
        fetchedTimeline,
        fetchedTrips,
        fetchedStats,
        fetchedSettings,
      ] = await Promise.all([
        api.getDashboardKPIs(dateFilter),
        api.getTrendData(dateFilter),
        api.getDetectionBreakdown(dateFilter),
        api.getHeatmapData(dateFilter.preset === 'today' || dateFilter.preset === 'yesterday' ? undefined : dateFilter),
        api.getRecentDetections(6),
        api.getRecentTripTimeline(),
        api.getTrips(dateFilter.preset === 'today' ? undefined : dateFilter),
        api.getStatisticsInsights(dateFilter),
        api.getSettings(),
      ]);

      setKpis(fetchedKpis);
      setTrendData(fetchedTrend);
      setBreakdown(fetchedBreakdown);
      setHeatmapData(fetchedHeatmap);
      setRecentDetections(fetchedRecent);
      setRecentTripTimeline(fetchedTimeline);
      setTrips(fetchedTrips);
      setStatisticsInsights(fetchedStats);
      setSettings(fetchedSettings);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [dateFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Tab Title & Subtitle helper
  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'dashboard':
        return {
          title: 'Driving Overview',
          subtitle: 'Your driving safety at a glance',
        };
      case 'live':
        return {
          title: 'In-Cabin Live Monitor & Tablet',
          subtitle: 'Real-time edge driver attention, micro-sleep detection, and adaptive alerts',
        };
      case 'trips':
        return {
          title: 'Trip History',
          subtitle: 'Review individual driving routes and detection logs',
        };
      case 'statistics':
        return {
          title: 'Long-term Statistics',
          subtitle: 'Identify recurring driving habits and trend progressions',
        };
      case 'settings':
        return {
          title: 'Settings & Privacy',
          subtitle: 'Configure local storage, hardware connection, and thresholds',
        };
    }
  };

  const headerInfo = getHeaderInfo();

  return (
    <div className="flex min-h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Frameless macOS Titlebar */}
      <TitleBar />

      {/* Left Navigation Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        monitoringActive={settings.monitoringActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 ml-60 pt-14 pb-12 px-8 min-h-screen overflow-y-auto">
        <div className="max-w-[1400px] mx-auto">
          {/* Header with Title, Subtitle, and Date Selector */}
          <Header
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            dateFilter={dateFilter}
            onDateFilterChange={setDateFilter}
          />

          {/* Active Page View */}
          {currentTab === 'dashboard' && (
            <DashboardView
              kpis={kpis}
              trendData={trendData}
              breakdown={breakdown}
              heatmapData={heatmapData}
              recentDetections={recentDetections}
              recentTripTimeline={recentTripTimeline}
              loading={loading}
              onNavigateToTrips={() => setCurrentTab('trips')}
            />
          )}

          {currentTab === 'live' && (
            <LiveMonitorView />
          )}

          {currentTab === 'trips' && (
            <TripsView trips={trips} loading={loading} />
          )}

          {currentTab === 'statistics' && (
            <StatisticsView
              insights={statisticsInsights}
              trendData={trendData}
              breakdown={breakdown}
              heatmapData={heatmapData}
              loading={loading}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsView
              settings={settings}
              onSettingsSaved={loadData}
              onReseedCompleted={loadData}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
