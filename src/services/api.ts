import { dbService } from './db/databaseService';
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
} from '../types';

declare global {
  interface Window {
    driveSafeAPI?: {
      getDashboardKPIs: (filter: DateFilter) => Promise<DashboardKPIs>;
      getTrendData: (filter: DateFilter) => Promise<TrendDataPoint[]>;
      getDetectionBreakdown: (filter: DateFilter) => Promise<DetectionBreakdown>;
      getHeatmapData: (filter?: DateFilter) => Promise<HeatmapCell[]>;
      getRecentDetections: (limit?: number) => Promise<RecentDetectionItem[]>;
      getRecentTripTimeline: () => Promise<RecentTripTimeline | null>;
      getTrips: (filter?: DateFilter) => Promise<Trip[]>;
      getTripDetails: (tripId: number) => Promise<{ trip: Trip; detections: any[] } | null>;
      getStatisticsInsights: (filter?: DateFilter) => Promise<StatisticsInsights>;
      getSettings: () => Promise<SystemSettings>;
      saveSettings: (settings: Partial<SystemSettings>) => Promise<void>;
      clearData: () => Promise<void>;
      reseedDatabase: () => Promise<void>;
      exportDatabase: () => Promise<string>;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
      isElectron: boolean;
    };
  }
}

export const api = {
  isElectron: typeof window !== 'undefined' && !!window.driveSafeAPI?.isElectron,

  async getDashboardKPIs(filter: DateFilter): Promise<DashboardKPIs> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.getDashboardKPIs(filter);
    }
    return dbService.getDashboardKPIs(filter);
  },

  async getTrendData(filter: DateFilter): Promise<TrendDataPoint[]> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.getTrendData(filter);
    }
    return dbService.getTrendData(filter);
  },

  async getDetectionBreakdown(filter: DateFilter): Promise<DetectionBreakdown> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.getDetectionBreakdown(filter);
    }
    return dbService.getDetectionBreakdown(filter);
  },

  async getHeatmapData(filter?: DateFilter): Promise<HeatmapCell[]> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.getHeatmapData(filter);
    }
    return dbService.getHeatmapData(filter);
  },

  async getRecentDetections(limit = 6): Promise<RecentDetectionItem[]> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.getRecentDetections(limit);
    }
    return dbService.getRecentDetections(limit);
  },

  async getRecentTripTimeline(): Promise<RecentTripTimeline | null> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.getRecentTripTimeline();
    }
    return dbService.getRecentTripTimeline();
  },

  async getTrips(filter?: DateFilter): Promise<Trip[]> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.getTrips(filter);
    }
    return dbService.getTrips(filter);
  },

  async getTripDetails(tripId: number) {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.getTripDetails(tripId);
    }
    return dbService.getTripDetails(tripId);
  },

  async getStatisticsInsights(filter?: DateFilter): Promise<StatisticsInsights> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.getStatisticsInsights(filter);
    }
    return dbService.getStatisticsInsights(filter);
  },

  async getSettings(): Promise<SystemSettings> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.getSettings();
    }
    return dbService.getSettings();
  },

  async saveSettings(settings: Partial<SystemSettings>): Promise<void> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.saveSettings(settings);
    }
    return dbService.saveSettings(settings);
  },

  async clearData(): Promise<void> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.clearData();
    }
    return dbService.clearData();
  },

  async reseedDatabase(): Promise<void> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.reseedDatabase();
    }
    return dbService.reseed();
  },

  async exportDatabase(): Promise<string> {
    if (window.driveSafeAPI) {
      return window.driveSafeAPI.exportDatabase();
    }
    return dbService.exportDatabase();
  },

  minimizeWindow(): void {
    window.driveSafeAPI?.minimizeWindow?.();
  },

  maximizeWindow(): void {
    window.driveSafeAPI?.maximizeWindow?.();
  },

  closeWindow(): void {
    window.driveSafeAPI?.closeWindow?.();
  },
};
