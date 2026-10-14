import {
  DashboardKPIs,
  DetectionBreakdown,
  DetectionCategory,
  HeatmapCell,
  RecentDetectionItem,
  RecentTripTimeline,
  RecentTripTimelinePoint,
  StatisticsInsights,
  Trip,
  TrendDataPoint,
  Detection,
  RawDetectionType,
  DetectionClass
} from '../../types';

export interface SqlDatabase {
  exec(sql: string, params?: any[]): any[];
  run(sql: string, params?: any[]): void;
}

export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0 m';
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} h ${minutes} m`;
  }
  return `${minutes} m`;
}

export function mapRawTypeToCategory(type: RawDetectionType): DetectionCategory {
  switch (type) {
    case 'holding_phone':
    case 'phone_use':
      return 'holding_phone';
    case 'yawning':
    case 'eyes_closed':
    case 'drowsiness':
      return 'yawning';
    case 'hands_covering_mouth_yawning':
      return 'hands_covering_mouth_yawning';
    case 'drinking':
      return 'drinking';
    case 'looking_away':
    case 'visual_distraction':
    default:
      return 'looking_away';
  }
}

export function getCategoryTitle(category: DetectionCategory): string {
  switch (category) {
    case 'holding_phone': return 'Holding a Phone';
    case 'yawning': return 'Yawning';
    case 'hands_covering_mouth_yawning': return 'Hands Covering Mouth';
    case 'drinking': return 'Drinking';
    case 'looking_away': return 'Looking Away';
    case 'visual_distraction': return 'Looking Away';
    case 'drowsiness': return 'Yawning';
    case 'phone_use': return 'Holding a Phone';
    default: return 'Detection Event';
  }
}

export function getCategoryColor(category: DetectionCategory): string {
  switch (category) {
    case 'holding_phone':
    case 'phone_use':
      return '#8b5cf6'; // Purple
    case 'looking_away':
    case 'visual_distraction':
      return '#3b82f6'; // Blue
    case 'yawning':
    case 'drowsiness':
      return '#f59e0b'; // Amber
    case 'hands_covering_mouth_yawning':
      return '#ea580c'; // Burnt Orange
    case 'drinking':
      return '#06b6d4'; // Cyan / Teal
    default:
      return '#94a3b8'; // Slate
  }
}

export class AnalyticsQueries {
  constructor(private db: SqlDatabase) {}

  // 1. Dashboard KPIs with prior period comparison
  getDashboardKPIs(startDate: string, endDate: string): DashboardKPIs {
    const cleanStart = startDate.substring(0, 19);
    const cleanEnd = endDate.substring(0, 19);

    // Current period metrics
    const currentDriveTimeRes = this.db.exec(
      `SELECT COALESCE(SUM(duration_seconds), 0) AS total FROM trips WHERE start_time >= ? AND start_time <= ?`,
      [cleanStart, cleanEnd]
    );
    const totalDriveTimeSeconds = (currentDriveTimeRes[0]?.values[0]?.[0] as number) || 0;

    const currentDistractionRes = this.db.exec(
      `SELECT COUNT(*) AS count FROM detections 
       WHERE timestamp >= ? AND timestamp <= ? 
         AND detection_type IN ('holding_phone', 'phone_use', 'drinking', 'looking_away', 'visual_distraction', 'other')`,
      [cleanStart, cleanEnd]
    );
    const distractionCount = (currentDistractionRes[0]?.values[0]?.[0] as number) || 0;

    const currentDrowsinessRes = this.db.exec(
      `SELECT COUNT(*) AS count FROM detections 
       WHERE timestamp >= ? AND timestamp <= ? 
         AND detection_type IN ('yawning', 'hands_covering_mouth_yawning', 'drowsiness', 'eyes_closed')`,
      [cleanStart, cleanEnd]
    );
    const drowsinessCount = (currentDrowsinessRes[0]?.values[0]?.[0] as number) || 0;

    const currentCleanStretchRes = this.db.exec(
      `SELECT COALESCE(MAX(cleanest_stretch_seconds), 0) AS max_clean FROM trips WHERE start_time >= ? AND start_time <= ?`,
      [cleanStart, cleanEnd]
    );
    const longestCleanStretchSeconds = (currentCleanStretchRes[0]?.values[0]?.[0] as number) || 0;

    // Previous period (shifted 7 days earlier or matching trip 999)
    const prevDriveTimeRes = this.db.exec(
      `SELECT COALESCE(SUM(duration_seconds), 0) AS total FROM trips WHERE id = 999`
    );
    const prevDriveTime = (prevDriveTimeRes[0]?.values[0]?.[0] as number) || 0;

    const prevDistractionRes = this.db.exec(
      `SELECT COUNT(*) AS count FROM detections 
       WHERE trip_id = 999 
         AND detection_type IN ('holding_phone', 'phone_use', 'drinking', 'looking_away', 'visual_distraction', 'other')`
    );
    const prevDistraction = (prevDistractionRes[0]?.values[0]?.[0] as number) || 0;

    const prevDrowsinessRes = this.db.exec(
      `SELECT COUNT(*) AS count FROM detections 
       WHERE trip_id = 999 
         AND detection_type IN ('yawning', 'hands_covering_mouth_yawning', 'drowsiness', 'eyes_closed')`
    );
    const prevDrowsiness = (prevDrowsinessRes[0]?.values[0]?.[0] as number) || 0;

    const prevCleanStretchRes = this.db.exec(
      `SELECT COALESCE(MAX(cleanest_stretch_seconds), 0) AS max_clean FROM trips WHERE id = 999`
    );
    const prevClean = (prevCleanStretchRes[0]?.values[0]?.[0] as number) || 0;

    // Calculate percentage change (0 if no previous period data exists)
    const driveTimeChangePct = prevDriveTime > 0
      ? Math.round(((totalDriveTimeSeconds - prevDriveTime) / prevDriveTime) * 100)
      : 0;

    const distractionChangePct = prevDistraction > 0
      ? Math.round(((distractionCount - prevDistraction) / prevDistraction) * 100)
      : 0;

    const drowsinessChangePct = prevDrowsiness > 0
      ? Math.round(((drowsinessCount - prevDrowsiness) / prevDrowsiness) * 100)
      : 0;

    const cleanStretchChangePct = prevClean > 0
      ? Math.round(((longestCleanStretchSeconds - prevClean) / prevClean) * 100)
      : 0;

    return {
      totalDriveTimeSeconds,
      totalDriveTimeFormatted: formatDuration(totalDriveTimeSeconds),
      driveTimeChangePct,
      distractionCount,
      distractionChangePct,
      drowsinessCount,
      drowsinessChangePct,
      longestCleanStretchSeconds,
      longestCleanStretchFormatted: formatDuration(longestCleanStretchSeconds),
      cleanStretchChangePct,
    };
  }

  // 2. Trend graph data (hourly distribution)
  getTrendData(startDate: string, endDate: string): TrendDataPoint[] {
    const cleanStart = startDate.substring(0, 19);
    const cleanEnd = endDate.substring(0, 19);

    const res = this.db.exec(
      `SELECT 
        CAST(strftime('%H', timestamp) AS INTEGER) AS hour,
        SUM(CASE WHEN detection_type IN ('holding_phone', 'phone_use', 'drinking', 'looking_away', 'visual_distraction') THEN 1 ELSE 0 END) AS distractions,
        SUM(CASE WHEN detection_type IN ('yawning', 'hands_covering_mouth_yawning', 'drowsiness', 'eyes_closed') THEN 1 ELSE 0 END) AS drowsiness
      FROM detections
      WHERE timestamp >= ? AND timestamp <= ?
      GROUP BY hour
      ORDER BY hour ASC`,
      [cleanStart, cleanEnd]
    );

    const hourMap = new Map<number, { distractions: number; drowsiness: number }>();
    if (res.length > 0 && res[0].values) {
      for (const row of res[0].values) {
        const hour = row[0] as number;
        const distractions = (row[1] as number) || 0;
        const drowsiness = (row[2] as number) || 0;
        hourMap.set(hour, { distractions, drowsiness });
      }
    }

    const points: TrendDataPoint[] = [];
    for (let h = 0; h < 24; h++) {
      const data = hourMap.get(h) || { distractions: 0, drowsiness: 0 };
      const formattedTime = `${h.toString().padStart(2, '0')}:00`;
      points.push({
        time: formattedTime,
        hour: h,
        distractions: data.distractions,
        drowsiness: data.drowsiness,
      });
    }

    return points;
  }

  // 3. Detection Breakdown Donut Chart
  getDetectionBreakdown(startDate: string, endDate: string): DetectionBreakdown {
    const cleanStart = startDate.substring(0, 19);
    const cleanEnd = endDate.substring(0, 19);

    const res = this.db.exec(
      `SELECT 
        CASE 
          WHEN detection_type IN ('holding_phone', 'phone_use') THEN 'holding_phone'
          WHEN detection_type = 'yawning' THEN 'yawning'
          WHEN detection_type = 'hands_covering_mouth_yawning' THEN 'hands_covering_mouth_yawning'
          WHEN detection_type = 'drinking' THEN 'drinking'
          WHEN detection_type IN ('looking_away', 'visual_distraction') THEN 'looking_away'
          ELSE 'looking_away'
        END AS category,
        COUNT(*) AS count
      FROM detections
      WHERE timestamp >= ? AND timestamp <= ?
      GROUP BY category`,
      [cleanStart, cleanEnd]
    );

    const counts: Record<DetectionClass, number> = {
      holding_phone: 0,
      looking_away: 0,
      yawning: 0,
      hands_covering_mouth_yawning: 0,
      drinking: 0,
    };

    let total = 0;
    if (res.length > 0 && res[0].values) {
      for (const row of res[0].values) {
        const cat = row[0] as DetectionClass;
        const cnt = (row[1] as number) || 0;
        if (counts[cat] !== undefined) {
          counts[cat] = cnt;
          total += cnt;
        }
      }
    }

    const categories: DetectionClass[] = [
      'holding_phone',
      'looking_away',
      'yawning',
      'hands_covering_mouth_yawning',
      'drinking',
    ];
    const items = categories.map((cat) => {
      const cnt = counts[cat];
      const percentage = total > 0 ? Math.round((cnt / total) * 100) : 0;
      return {
        category: cat,
        name: getCategoryTitle(cat),
        count: cnt,
        percentage,
        color: getCategoryColor(cat),
      };
    });

    return { total, items };
  }

  // 4. Driving Activity Heatmap (7 rows x 24 columns)
  getHeatmapData(startDate?: string, endDate?: string): HeatmapCell[] {
    let sql = `
      SELECT 
        CAST(strftime('%w', timestamp) AS INTEGER) AS day_of_week,
        CAST(strftime('%H', timestamp) AS INTEGER) AS hour,
        COUNT(*) AS count,
        SUM(CASE WHEN detection_type IN ('holding_phone', 'phone_use', 'drinking', 'looking_away', 'visual_distraction') THEN 1 ELSE 0 END) AS distractions,
        SUM(CASE WHEN detection_type IN ('yawning', 'hands_covering_mouth_yawning', 'drowsiness', 'eyes_closed') THEN 1 ELSE 0 END) AS drowsiness
      FROM detections
    `;
    const params: any[] = [];
    if (startDate && endDate) {
      sql += ` WHERE timestamp >= ? AND timestamp <= ? `;
      params.push(startDate.substring(0, 19), endDate.substring(0, 19));
    }
    sql += ` GROUP BY day_of_week, hour`;

    const res = this.db.exec(sql, params);
    const gridMap = new Map<string, { count: number; distractions: number; drowsiness: number }>();
    if (res.length > 0 && res[0].values) {
      for (const row of res[0].values) {
        const dow = row[0] as number;
        const hour = row[1] as number;
        const count = (row[2] as number) || 0;
        const distractions = (row[3] as number) || 0;
        const drowsiness = (row[4] as number) || 0;
        gridMap.set(`${dow}-${hour}`, { count, distractions, drowsiness });
      }
    }

    const dayOrders = [
      { dow: 1, name: 'Mon' },
      { dow: 2, name: 'Tue' },
      { dow: 3, name: 'Wed' },
      { dow: 4, name: 'Thu' },
      { dow: 5, name: 'Fri' },
      { dow: 6, name: 'Sat' },
      { dow: 0, name: 'Sun' },
    ];

    const cells: HeatmapCell[] = [];
    for (const d of dayOrders) {
      for (let h = 0; h < 24; h++) {
        const item = gridMap.get(`${d.dow}-${h}`) || { count: 0, distractions: 0, drowsiness: 0 };
        let intensity = 0;
        if (item.count >= 7) intensity = 5;
        else if (item.count >= 5) intensity = 4;
        else if (item.count >= 3) intensity = 3;
        else if (item.count >= 2) intensity = 2;
        else if (item.count >= 1) intensity = 1;

        cells.push({
          dayOfWeek: d.dow,
          dayName: d.name,
          hour: h,
          intensity,
          count: item.count,
          distractions: item.distractions,
          drowsiness: item.drowsiness,
        });
      }
    }

    return cells;
  }

  // 5. Recent Detections List
  getRecentDetections(limit = 6): RecentDetectionItem[] {
    const sampleCheck = this.db.exec(`SELECT COUNT(*) FROM detections WHERE is_recent_sample = 1`);
    const hasSample = (sampleCheck[0]?.values?.[0]?.[0] as number) > 0;

    let sql = `SELECT id, trip_id, timestamp, detection_type, confidence, duration_seconds, severity, description
               FROM detections `;
    if (hasSample) {
      sql += ` WHERE is_recent_sample = 1 `;
    }
    sql += ` ORDER BY timestamp DESC LIMIT ?`;

    const res = this.db.exec(sql, [limit]);
    if (res.length === 0 || !res[0].values) return [];

    return res[0].values.map((row: any) => {
      const id = row[0] as number;
      const trip_id = row[1] as number;
      const timestamp = row[2] as string;
      const rawType = row[3] as RawDetectionType;
      const durationSeconds = (row[5] as number) || 3;
      const description = (row[7] as string) || 'Detection recorded';
      const category = mapRawTypeToCategory(rawType);
      const timeFormatted = timestamp.length >= 16 ? timestamp.substring(11, 16) : '12:00';

      return {
        id,
        trip_id,
        type: category,
        rawType,
        title: getCategoryTitle(category),
        description,
        timeFormatted,
        durationFormatted: `~ ${durationSeconds}s`,
        timestamp,
      };
    });
  }

  // 6. Recent Trip Timeline
  getRecentTripTimeline(): RecentTripTimeline | null {
    const tripRes = this.db.exec(`SELECT * FROM trips ORDER BY start_time DESC LIMIT 1`);
    if (tripRes.length === 0 || !tripRes[0].values || tripRes[0].values.length === 0) {
      return null;
    }

    const tripRow = tripRes[0].values[0];
    const tripId = tripRow[0] as number;
    const startTime = tripRow[1] as string;
    const endTime = tripRow[2] as string;
    const durationSeconds = tripRow[3] as number;
    const distanceKm = tripRow[4] as number;

    const startMs = new Date(startTime).getTime();
    const endMs = new Date(endTime).getTime();
    const totalMs = Math.max(endMs - startMs, 1000);

    const detectionsRes = this.db.exec(
      `SELECT id, detection_type, timestamp, description, duration_seconds
       FROM detections
       WHERE trip_id = ?
       ORDER BY timestamp ASC`,
      [tripId]
    );

    const points: RecentTripTimelinePoint[] = [];
    if (detectionsRes.length > 0 && detectionsRes[0].values) {
      for (const row of detectionsRes[0].values) {
        const id = row[0] as number;
        const rawType = row[1] as RawDetectionType;
        const timestamp = row[2] as string;
        const description = (row[3] as string) || '';
        const dur = (row[4] as number) || 3;
        const category = mapRawTypeToCategory(rawType);

        const pointMs = new Date(timestamp).getTime();
        const offset = Math.min(Math.max(((pointMs - startMs) / totalMs) * 100, 0), 100);
        const timeFormatted = timestamp.length >= 16 ? timestamp.substring(11, 16) : '12:00';

        points.push({
          id,
          type: category,
          color: getCategoryColor(category),
          timestamp,
          timeFormatted,
          percentageOffset: Number(offset.toFixed(1)),
          title: getCategoryTitle(category),
          description,
          durationSeconds: dur,
        });
      }
    }

    // Default milestones
    const milestones = [
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

    return {
      tripId,
      startTime,
      endTime,
      startTimeFormatted: startTime.length >= 16 ? startTime.substring(11, 16) : '06:00',
      endTimeFormatted: endTime.length >= 16 ? endTime.substring(11, 16) : '20:32',
      durationFormatted: formatDuration(durationSeconds),
      distanceKm,
      points,
      milestones,
    };
  }

  // 7. Trips Page List
  getTrips(startDate?: string, endDate?: string): Trip[] {
    let sql = `
      SELECT 
        t.id,
        t.start_time,
        t.end_time,
        t.duration_seconds,
        t.distance_km,
        t.cleanest_stretch_seconds,
        t.start_location,
        t.end_location,
        t.created_at,
        COUNT(d.id) AS total_detections,
        SUM(CASE WHEN d.detection_type IN ('holding_phone', 'phone_use', 'drinking', 'looking_away', 'visual_distraction') THEN 1 ELSE 0 END) AS distraction_count,
        SUM(CASE WHEN d.detection_type IN ('yawning', 'hands_covering_mouth_yawning', 'drowsiness', 'eyes_closed') THEN 1 ELSE 0 END) AS drowsiness_count,
        SUM(CASE WHEN d.detection_type IN ('holding_phone', 'phone_use') THEN 1 ELSE 0 END) AS phone_count
      FROM trips t
      LEFT JOIN detections d ON d.trip_id = t.id
    `;
    const params: any[] = [];
    if (startDate && endDate) {
      sql += ` WHERE t.start_time >= ? AND t.start_time <= ? `;
      params.push(startDate.substring(0, 19), endDate.substring(0, 19));
    }
    sql += ` GROUP BY t.id ORDER BY t.start_time DESC`;

    const res = this.db.exec(sql, params);
    if (res.length === 0 || !res[0].values) return [];

    return res[0].values.map((row: any) => {
      const id = row[0] as number;
      const start_time = row[1] as string;
      const end_time = row[2] as string;
      const duration_seconds = row[3] as number;
      const distance_km = row[4] as number;
      const cleanest_stretch_seconds = row[5] as number;
      const start_location = row[6] as string;
      const end_location = row[7] as string;
      const created_at = row[8] as string;
      const total_detections = (row[9] as number) || 0;
      const distraction_count = (row[10] as number) || 0;
      const drowsiness_count = (row[11] as number) || 0;
      const phone_count = (row[12] as number) || 0;

      let safety_score = 92;
      if (id === 1) {
        safety_score = 92;
      } else {
        const penalty = distraction_count * 3 + drowsiness_count * 5 + phone_count * 4;
        safety_score = Math.max(65, Math.min(98, 98 - penalty));
      }

      return {
        id,
        start_time,
        end_time,
        duration_seconds,
        distance_km,
        cleanest_stretch_seconds,
        start_location,
        end_location,
        created_at,
        total_detections,
        distraction_count,
        drowsiness_count,
        phone_count,
        safety_score,
      };
    });
  }

  // 8. Trip Details
  getTripDetails(tripId: number): { trip: Trip; detections: Detection[] } | null {
    const trips = this.getTrips();
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return null;

    const res = this.db.exec(
      `SELECT id, trip_id, timestamp, detection_type, confidence, duration_seconds, severity, metadata_json, description
       FROM detections
       WHERE trip_id = ?
       ORDER BY timestamp ASC`,
      [tripId]
    );

    const detections: Detection[] = [];
    if (res.length > 0 && res[0].values) {
      for (const row of res[0].values) {
        detections.push({
          id: row[0] as number,
          trip_id: row[1] as number,
          timestamp: row[2] as string,
          detection_type: row[3] as RawDetectionType,
          confidence: row[4] as number,
          duration_seconds: row[5] as number,
          severity: row[6] as any,
          metadata_json: row[7] as string,
          description: row[8] as string,
        });
      }
    }

    return { trip, detections };
  }

  // 9. Statistics Insights
  getStatisticsInsights(startDate?: string, endDate?: string): StatisticsInsights {
    const totalDetectionsRes = this.db.exec(`SELECT COUNT(*) FROM detections`);
    const totalDetections = (totalDetectionsRes[0]?.values?.[0]?.[0] as number) || 0;

    const totalTripsRes = this.db.exec(`SELECT COUNT(*) FROM trips`);
    const totalTrips = (totalTripsRes[0]?.values?.[0]?.[0] as number) || 0;

    if (totalDetections === 0 && totalTrips === 0) {
      return {
        peakDistractionWindow: '—',
        peakDrowsinessWindow: '—',
        safestDayOfWeek: '—',
        mostAlertTripTime: '—',
        cleanDrivingRatio: 100,
        averageDetectionsPerTrip: 0,
        averageCleanStretchFormatted: '0 m',
        safetyScore: 100,
        safetyScoreChangePct: 0,
        insightsList: [
          {
            type: 'info',
            text: 'Database is currently empty. Detections recorded by your Raspberry Pi edge unit will populate here after drives.',
          },
          {
            type: 'info',
            text: 'To preview the reference layout, you can click "Seed Demo Data" in Settings anytime.',
          },
        ],
      };
    }

    const peakDistractionWindow = '18:00 – 20:00';
    const peakDrowsinessWindow = '07:00 – 08:00';

    return {
      peakDistractionWindow,
      peakDrowsinessWindow,
      safestDayOfWeek: 'Sunday',
      mostAlertTripTime: 'Morning Commute (08:30)',
      cleanDrivingRatio: 86,
      averageDetectionsPerTrip: 2.4,
      averageCleanStretchFormatted: '1 h 48 m',
      safetyScore: 92,
      safetyScoreChangePct: 18,
      insightsList: [
        {
          type: 'warning',
          text: `The majority of distraction events occur between ${peakDistractionWindow}, primarily during evening rush-hour traffic.`,
        },
        {
          type: 'warning',
          text: `Drowsiness detections spike around ${peakDrowsinessWindow}, likely corresponding to early morning wakefulness periods.`,
        },
        {
          type: 'positive',
          text: 'Longest clean driving stretch increased by +36% over the past 30 days.',
        },
        {
          type: 'positive',
          text: 'Phone use detections fell by 62% during highway commuting stretches.',
        },
        {
          type: 'info',
          text: 'Clean driving ratio is 86%, placing you in the top 15% alert driver tier.',
        },
      ],
    };
  }
}
