import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import fs from 'fs';
import initSqlJs, { Database } from 'sql.js';
import { SCHEMA_SQL } from './database/schema';
import { AnalyticsQueries } from './database/queries';
import { seedDatabase } from './database/seeder';

let mainWindow: BrowserWindow | null = null;
let db: Database | null = null;
let queries: AnalyticsQueries | null = null;
let dbFilePath = '';

function getDbPath(): string {
  const dataDir = path.join(app.getPath('userData'), 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  return path.join(dataDir, 'drivesafe.sqlite');
}

function persistDatabase() {
  if (db && dbFilePath) {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(dbFilePath, buffer);
    } catch (e) {
      console.error('Failed to persist database file:', e);
    }
  }
}

class NodeSqlWrapper {
  constructor(private sqlDb: Database) {}
  exec(sql: string, params?: any[]): any[] {
    if (!params || params.length === 0) {
      return this.sqlDb.exec(sql);
    }
    const stmt = this.sqlDb.prepare(sql);
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
      this.sqlDb.run(sql);
    } else {
      this.sqlDb.run(sql, params);
    }
    persistDatabase();
  }
}

async function initDatabase() {
  const SQL = await initSqlJs();
  dbFilePath = getDbPath();

  if (fs.existsSync(dbFilePath)) {
    try {
      const fileBuffer = fs.readFileSync(dbFilePath);
      db = new SQL.Database(fileBuffer);
    } catch (e) {
      console.warn('Could not read existing database, creating fresh one:', e);
      db = new SQL.Database();
      db.run(SCHEMA_SQL);
      db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('monitoringActive', 'true');`);
      db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('edgeDeviceIp', '192.168.1.142');`);
      db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('lastSyncTimestamp', '2026-09-27T14:21:00Z');`);
      db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('hardwareDevice', 'Raspberry Pi 5 + Raspberry Pi AI Kit (Hailo NPU)');`);
      db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('cameraModel', 'Logitech Brio 100 (1080p 30 FPS)');`);
      db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('audioAlertsEnabled', 'true');`);
      persistDatabase();
    }
  } else {
    db = new SQL.Database();
    db.run(SCHEMA_SQL);
    db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('monitoringActive', 'true');`);
    db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('edgeDeviceIp', '192.168.1.142');`);
    db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('lastSyncTimestamp', '2026-09-27T14:21:00Z');`);
    db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('hardwareDevice', 'Raspberry Pi 5 + Raspberry Pi AI Kit (Hailo NPU)');`);
    db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('cameraModel', 'Logitech Brio 100 (1080p 30 FPS)');`);
    db.run(`INSERT OR IGNORE INTO system_settings (key, value) VALUES ('audioAlertsEnabled', 'true');`);
    persistDatabase();
  }

  const wrapper = new NodeSqlWrapper(db);
  queries = new AnalyticsQueries(wrapper);
}

function registerIpcHandlers() {
  ipcMain.handle('db:getDashboardKPIs', async (_, filter) => {
    const start = `${filter.startDate}T00:00:00Z`;
    const end = `${filter.endDate}T23:59:59Z`;
    return queries!.getDashboardKPIs(start, end);
  });

  ipcMain.handle('db:getTrendData', async (_, filter) => {
    const start = `${filter.startDate}T00:00:00Z`;
    const end = `${filter.endDate}T23:59:59Z`;
    return queries!.getTrendData(start, end);
  });

  ipcMain.handle('db:getDetectionBreakdown', async (_, filter) => {
    const start = `${filter.startDate}T00:00:00Z`;
    const end = `${filter.endDate}T23:59:59Z`;
    return queries!.getDetectionBreakdown(start, end);
  });

  ipcMain.handle('db:getHeatmapData', async (_, filter) => {
    if (filter) {
      const start = `${filter.startDate}T00:00:00Z`;
      const end = `${filter.endDate}T23:59:59Z`;
      return queries!.getHeatmapData(start, end);
    }
    return queries!.getHeatmapData();
  });

  ipcMain.handle('db:getRecentDetections', async (_, limit = 6) => {
    return queries!.getRecentDetections(limit);
  });

  ipcMain.handle('db:getRecentTripTimeline', async () => {
    return queries!.getRecentTripTimeline();
  });

  ipcMain.handle('db:getTrips', async (_, filter) => {
    if (filter) {
      const start = `${filter.startDate}T00:00:00Z`;
      const end = `${filter.endDate}T23:59:59Z`;
      return queries!.getTrips(start, end);
    }
    return queries!.getTrips();
  });

  ipcMain.handle('db:getTripDetails', async (_, tripId) => {
    return queries!.getTripDetails(tripId);
  });

  ipcMain.handle('db:getStatisticsInsights', async (_, filter) => {
    if (filter) {
      const start = `${filter.startDate}T00:00:00Z`;
      const end = `${filter.endDate}T23:59:59Z`;
      return queries!.getStatisticsInsights(start, end);
    }
    return queries!.getStatisticsInsights();
  });

  ipcMain.handle('db:getSettings', async () => {
    const res = db!.exec('SELECT key, value FROM system_settings');
    const settingsMap = new Map<string, string>();
    if (res.length > 0 && res[0].values) {
      for (const row of res[0].values) {
        settingsMap.set(row[0] as string, row[1] as string);
      }
    }
    return {
      databasePath: dbFilePath,
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
  });

  ipcMain.handle('db:saveSettings', async (_, settings) => {
    for (const [k, v] of Object.entries(settings)) {
      db!.run(
        `INSERT INTO system_settings (key, value) VALUES ('${k}', '${v}') ON CONFLICT(key) DO UPDATE SET value = excluded.value;`
      );
    }
    persistDatabase();
  });

  ipcMain.handle('db:clearData', async () => {
    db!.run('DELETE FROM detections; DELETE FROM trips;');
    persistDatabase();
  });

  ipcMain.handle('db:reseedDatabase', async () => {
    seedDatabase(new NodeSqlWrapper(db!));
    persistDatabase();
  });

  ipcMain.handle('db:exportDatabase', async () => {
    const trips = queries!.getTrips();
    const res = db!.exec('SELECT * FROM detections');
    return JSON.stringify({ trips, detections: res[0]?.values || [] }, null, 2);
  });

  // Window control IPC
  ipcMain.on('window:minimize', () => mainWindow?.minimize());
  ipcMain.on('window:maximize', () => {
    if (mainWindow?.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow?.maximize();
    }
  });
  ipcMain.on('window:close', () => mainWindow?.close());
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1120,
    minHeight: 720,
    frame: false, // frameless window for macOS traffic lights look
    titleBarStyle: 'hidden',
    backgroundColor: '#f8fafc',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const devUrl = process.env.VITE_DEV_SERVER_URL;
  const distPath = path.join(__dirname, '../dist/index.html');

  if (devUrl) {
    mainWindow.loadURL(devUrl);
  } else if (fs.existsSync(distPath)) {
    mainWindow.loadFile(distPath);
  } else {
    mainWindow.loadURL('http://localhost:5173');
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await initDatabase();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  persistDatabase();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
