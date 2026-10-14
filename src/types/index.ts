export type DetectionClass =
  | 'holding_phone'
  | 'yawning'
  | 'hands_covering_mouth_yawning'
  | 'drinking'
  | 'looking_away';

export type RawDetectionType =
  | DetectionClass
  | 'visual_distraction'
  | 'phone_use'
  | 'eyes_closed'
  | 'drowsiness'
  | 'other';

export type DetectionCategory =
  | DetectionClass
  | 'visual_distraction'
  | 'drowsiness'
  | 'phone_use'
  | 'other';

export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Trip {
  id: number;
  start_time: string;
  end_time: string;
  duration_seconds: number;
  distance_km: number;
  cleanest_stretch_seconds: number;
  start_location?: string;
  end_location?: string;
  created_at: string;
  // Computed aggregations
  total_detections?: number;
  distraction_count?: number;
  drowsiness_count?: number;
  phone_count?: number;
  safety_score?: number; // 0 - 100
}

export interface Detection {
  id: number;
  trip_id: number;
  timestamp: string;
  detection_type: RawDetectionType;
  confidence: number;
  duration_seconds: number;
  severity: SeverityLevel;
  metadata_json: string;
  description: string;
}

export interface DashboardKPIs {
  totalDriveTimeSeconds: number;
  totalDriveTimeFormatted: string; // e.g. "4 h 32 m"
  driveTimeChangePct: number; // e.g. +12

  distractionCount: number; // e.g. 14
  distractionChangePct: number; // e.g. -53

  drowsinessCount: number; // e.g. 3
  drowsinessChangePct: number; // e.g. -70

  longestCleanStretchSeconds: number;
  longestCleanStretchFormatted: string; // e.g. "1 h 48 m"
  cleanStretchChangePct: number; // e.g. +36
}

export interface TrendDataPoint {
  time: string; // "00:00", "01:00", etc.
  hour: number;
  distractions: number;
  drowsiness: number;
}

export interface DetectionBreakdownItem {
  category: DetectionCategory;
  name: string;
  count: number;
  percentage: number;
  color: string;
}

export interface DetectionBreakdown {
  total: number;
  items: DetectionBreakdownItem[];
}

export interface HeatmapCell {
  dayOfWeek: number; // 0 = Sun, 1 = Mon, ..., 6 = Sat
  dayName: string;   // "Mon", "Tue", etc.
  hour: number;      // 0 - 23
  intensity: number; // 0 - 5 (0: none, 1: very low, ..., 5: peak)
  count: number;
  distractions: number;
  drowsiness: number;
}

export interface RecentDetectionItem {
  id: number;
  trip_id: number;
  type: DetectionCategory;
  rawType: RawDetectionType;
  title: string;       // e.g. "Visual Distraction"
  description: string; // e.g. "Looked away from road"
  timeFormatted: string; // e.g. "14:32"
  durationFormatted: string; // e.g. "~ 4s"
  timestamp: string;
}

export interface RecentTripTimelinePoint {
  id: number;
  type: DetectionCategory;
  color: string;
  timestamp: string;
  timeFormatted: string;
  percentageOffset: number; // 0 - 100% along the trip duration
  title: string;
  description: string;
  durationSeconds: number;
}

export interface RecentTripTimeline {
  tripId: number;
  startTime: string;
  endTime: string;
  startTimeFormatted: string;
  endTimeFormatted: string;
  durationFormatted: string;
  distanceKm: number;
  points: RecentTripTimelinePoint[];
  milestones: string[]; // e.g. ["06:12", "07:45", "09:20", ...]
}

export type DateFilterPreset = 'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom';

export interface DateFilter {
  preset: DateFilterPreset;
  startDate: string; // "YYYY-MM-DD"
  endDate: string;   // "YYYY-MM-DD"
  label: string;     // e.g. "Sep 27, 2026"
}

export interface StatisticsInsights {
  peakDistractionWindow: string; // e.g. "18:00 – 20:00"
  peakDrowsinessWindow: string;   // e.g. "07:00 – 08:00"
  safestDayOfWeek: string;       // e.g. "Sunday"
  mostAlertTripTime: string;      // e.g. "Morning Commute"
  cleanDrivingRatio: number;     // e.g. 84%
  averageDetectionsPerTrip: number;
  averageCleanStretchFormatted: string;
  safetyScore: number;           // e.g. 88
  safetyScoreChangePct: number;  // e.g. +18
  insightsList: {
    type: 'positive' | 'warning' | 'info';
    text: string;
  }[];
}

export interface SystemSettings {
  databasePath: string;
  monitoringActive: boolean;
  edgeDeviceIp: string;
  lastSyncTimestamp: string;
  hardwareDevice: string;
  cameraModel: string;
  audioAlertsEnabled: boolean;
  classesMonitored: string[];
  privacyTelemetryDisabled: boolean;
  alertThresholdDistractionSec?: number;
  alertThresholdDrowsinessSec?: number;
}
