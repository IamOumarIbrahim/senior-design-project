import initSqlJs, { Database, SqlJsStatic } from 'sql.js';
import { SCHEMA_SQL } from './schema';
import { AnalyticsQueries, SqlDatabase } from './queries';
import { seedDatabase } from './seeder';
import {
  DashboardKPIs,
  DetectionBreakdown,
  HeatmapCell,
  RecentDetectionItem,
  RecentTripTimeline,
  StatisticsInsights,
  Trip,
  TrendDataPoint,
  SystemSettings,
  DateFilter,
} from '../../types';

class SqliteServiceWrapper implements SqlDatabase {
  constructor(private db: Database) {}

  exec(sql: string, params?: any[]): any[] {
    if (!params || params.length === 0) {
      return this.db.exec(sql);
    }
    const stmt = this.db.prepare(sql);
    try {
      stmt.bind(params);
      const columns = stmt.getColumnNames();
      const values: any[][] = [];
      while (stmt.step()) {
        values.push(stmt.get());
      }
      return [{ columns, values }];
    } finally {
      stmt.free();
    }
  }

  run(sql: string, params?: any[]): void {
    if (!params || params.length === 0) {
      this.db.run(sql);
    } else {
      this.db.run(sql, params);
    }
  }

  exportBinary(): Uint8Array {
    return this.db.export();
  }
}

export class DatabaseService {
  private db: Database | null = null;
  private wrapper: SqliteServiceWrapper | null = null;
  private queries: AnalyticsQueries | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.initialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const SQL: SqlJsStatic = await initSqlJs({
          locateFile: (file) => {
            // In Vite dev / build, served from /public
            if (typeof window !== 'undefined') {
              return `./${file}`;
            }
            return `./node_modules/sql.js/dist/${file}`;
          },
        });

        // Check if there is a saved binary database in localStorage
        let savedData: Uint8Array | null = null;
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const stored = window.localStorage.getItem('drivesafe_db_bin');
            if (stored) {
              const binStr = atob(stored);
              const len = binStr.length;
              const bytes = new Uint8Array(len);
              for (let i = 0; i < len; i++) {
                bytes[i] = binStr.charCodeAt(i);
              }
              savedData = bytes;
            }
          }
        } catch (e) {
          console.warn('Could not restore database from storage:', e);
        }

        if (savedData) {
          this.db = new SQL.Database(savedData);
        } else {
          this.db = new SQL.Database();
          this.db.run(SCHEMA_SQL);
          this.db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('monitoringActive', 'true');`);
          this.db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('edgeDeviceIp', '192.168.1.142');`);
          this.db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('lastSyncTimestamp', '2026-09-27T14:21:00Z');`);
          this.db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('hardwareDevice', 'Raspberry Pi 5 + Raspberry Pi AI Kit (Hailo NPU)');`);
          this.db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('cameraModel', 'Logitech Brio 100 (1080p 30 FPS)');`);
          this.db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('audioAlertsEnabled', 'true');`);
          this.db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('databasePath', 'local://drivesafe.sqlite');`);
          this.persist();
        }

        this.wrapper = new SqliteServiceWrapper(this.db);
        this.queries = new AnalyticsQueries(this.wrapper);
        this.initialized = true;
      } catch (err) {
        console.error('Failed to initialize SQLite database:', err);
        throw err;
      }
    })();

    return this.initPromise;
  }

  private persist() {
    try {
      if (this.db && typeof window !== 'undefined' && window.localStorage) {
        const binary = this.db.export();
        let binaryString = '';
        for (let i = 0; i < binary.length; i++) {
          binaryString += String.fromCharCode(binary[i]);
        }
        window.localStorage.setItem('drivesafe_db_bin', btoa(binaryString));
      }
    } catch (e) {
      console.warn('Storage persistence failed (storage quota or disabled):', e);
    }
  }

  async getDashboardKPIs(filter: DateFilter): Promise<DashboardKPIs> {
    await this.init();
    const start = `${filter.startDate}T00:00:00Z`;
    const end = `${filter.endDate}T23:59:59Z`;
    return this.queries!.getDashboardKPIs(start, end);
  }

  async getTrendData(filter: DateFilter): Promise<TrendDataPoint[]> {
    await this.init();
    const start = `${filter.startDate}T00:00:00Z`;
    const end = `${filter.endDate}T23:59:59Z`;
    return this.queries!.getTrendData(start, end);
  }

  async getDetectionBreakdown(filter: DateFilter): Promise<DetectionBreakdown> {
    await this.init();
    const start = `${filter.startDate}T00:00:00Z`;
    const end = `${filter.endDate}T23:59:59Z`;
    return this.queries!.getDetectionBreakdown(start, end);
  }

  async getHeatmapData(filter?: DateFilter): Promise<HeatmapCell[]> {
    await this.init();
    if (filter) {
      const start = `${filter.startDate}T00:00:00Z`;
      const end = `${filter.endDate}T23:59:59Z`;
      return this.queries!.getHeatmapData(start, end);
    }
    return this.queries!.getHeatmapData();
  }

  async getRecentDetections(limit = 6): Promise<RecentDetectionItem[]> {
    await this.init();
    return this.queries!.getRecentDetections(limit);
  }

  async getRecentTripTimeline(): Promise<RecentTripTimeline | null> {
    await this.init();
    return this.queries!.getRecentTripTimeline();
  }

  async getTrips(filter?: DateFilter): Promise<Trip[]> {
    await this.init();
    if (filter) {
      const start = `${filter.startDate}T00:00:00Z`;
      const end = `${filter.endDate}T23:59:59Z`;
      return this.queries!.getTrips(start, end);
    }
    return this.queries!.getTrips();
  }

  async getTripDetails(tripId: number) {
    await this.init();
    return this.queries!.getTripDetails(tripId);
  }

  async getStatisticsInsights(filter?: DateFilter): Promise<StatisticsInsights> {
    await this.init();
    if (filter) {
      const start = `${filter.startDate}T00:00:00Z`;
      const end = `${filter.endDate}T23:59:59Z`;
      return this.queries!.getStatisticsInsights(start, end);
    }
    return this.queries!.getStatisticsInsights();
  }

  async getSettings(): Promise<SystemSettings> {
    await this.init();
    const res = this.wrapper!.exec('SELECT key, value FROM system_settings');
    const settingsMap = new Map<string, string>();
    if (res.length > 0 && res[0].values) {
      for (const row of res[0].values) {
        settingsMap.set(row[0] as string, row[1] as string);
      }
    }

    return {
      databasePath: settingsMap.get('databasePath') || 'local://drivesafe.sqlite',
      monitoringActive: settingsMap.get('monitoringActive') !== 'false',
      edgeDeviceIp: settingsMap.get('edgeDeviceIp') || '192.168.1.142',
      lastSyncTimestamp: settingsMap.get('lastSyncTimestamp') || '2026-09-27T14:21:00Z',
      hardwareDevice: settingsMap.get('hardwareDevice') || 'Raspberry Pi 5 + Raspberry Pi AI Kit (Hailo NPU)',
      cameraModel: settingsMap.get('cameraModel') || 'Logitech Brio 100 (1080p 30 FPS)',
      audioAlertsEnabled: settingsMap.get('audioAlertsEnabled') !== 'false',
      classesMonitored: [
        'Holding a phone',
        'Yawning',
        'Hands covering mouth while yawning',
        'Drinking',
        'Looking away',
      ],
      privacyTelemetryDisabled: true,
    };
  }

  async saveSettings(settings: Partial<SystemSettings>): Promise<void> {
    await this.init();
    for (const [k, v] of Object.entries(settings)) {
      this.wrapper!.run(
        `INSERT INTO system_settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value`,
        [k, String(v)]
      );
    }
    this.persist();
  }

  async clearData(): Promise<void> {
    await this.init();
    this.wrapper!.run('DELETE FROM detections;');
    this.wrapper!.run('DELETE FROM trips;');
    this.persist();
  }

  async reseed(): Promise<void> {
    await this.init();
    seedDatabase(this.wrapper!);
    this.persist();
  }

  async exportDatabase(): Promise<string> {
    await this.init();
    const trips = this.queries!.getTrips();
    const res = this.wrapper!.exec('SELECT * FROM detections');
    return JSON.stringify({ trips, detections: res[0]?.values || [] }, null, 2);
  }
}

export const dbService = new DatabaseService();
