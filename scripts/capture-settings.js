const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');
const { SCHEMA_SQL } = require('../dist-electron/database/schema');
const { AnalyticsQueries } = require('../dist-electron/database/queries');
const { seedDatabase } = require('../dist-electron/database/seeder');

class NodeSqlWrapper {
  constructor(sqlDb) { this.sqlDb = sqlDb; }
  exec(sql, params) {
    if (!params || params.length === 0) return this.sqlDb.exec(sql);
    const stmt = this.sqlDb.prepare(sql);
    try {
      stmt.bind(params);
      const columns = stmt.getColumnNames();
      const values = [];
      while (stmt.step()) values.push(stmt.get());
      return [{ columns, values }];
    } finally {
      stmt.free();
    }
  }
  run(sql, params) {
    if (!params || params.length === 0) this.sqlDb.run(sql);
    else this.sqlDb.run(sql, params);
  }
}

app.whenReady().then(async () => {
  const SQL = await initSqlJs();
  const dbPath = path.join(app.getPath('userData'), 'data', 'drivesafe.sqlite');
  let db;
  if (fs.existsSync(dbPath)) {
    db = new SQL.Database(fs.readFileSync(dbPath));
  } else {
    db = new SQL.Database();
    db.run(SCHEMA_SQL);
  }
  const wrapper = new NodeSqlWrapper(db);
  seedDatabase(wrapper);
  const queries = new AnalyticsQueries(wrapper);

  ipcMain.handle('db:getDashboardKPIs', async (_, filter) => {
    return queries.getDashboardKPIs(`${filter.startDate}T00:00:00`, `${filter.endDate}T23:59:59`);
  });
  ipcMain.handle('db:getTrendData', async (_, filter) => {
    return queries.getTrendData(`${filter.startDate}T00:00:00`, `${filter.endDate}T23:59:59`);
  });
  ipcMain.handle('db:getDetectionBreakdown', async (_, filter) => {
    return queries.getDetectionBreakdown(`${filter.startDate}T00:00:00`, `${filter.endDate}T23:59:59`);
  });
  ipcMain.handle('db:getHeatmapData', async (_, filter) => {
    if (filter) {
      return queries.getHeatmapData(`${filter.startDate}T00:00:00`, `${filter.endDate}T23:59:59`);
    }
    return queries.getHeatmapData();
  });
  ipcMain.handle('db:getRecentDetections', async (_, limit = 6) => {
    return queries.getRecentDetections(limit);
  });
  ipcMain.handle('db:getRecentTripTimeline', async () => {
    return queries.getRecentTripTimeline();
  });
  ipcMain.handle('db:getTrips', async (_, filter) => {
    if (filter) {
      return queries.getTrips(`${filter.startDate}T00:00:00`, `${filter.endDate}T23:59:59`);
    }
    return queries.getTrips();
  });
  ipcMain.handle('db:getTripDetails', async (_, tripId) => {
    return queries.getTripDetails(tripId);
  });
  ipcMain.handle('db:getStatisticsInsights', async () => {
    return queries.getStatisticsInsights();
  });
  ipcMain.handle('db:getSettings', async () => {
    return {
      databasePath: dbPath,
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
    };
  });

  const win = new BrowserWindow({
    width: 1360,
    height: 960,
    show: false,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, '../dist-electron/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  const distHtml = path.join(__dirname, '../dist/index.html');
  await win.loadFile(distHtml);

  // Wait 1.5s for initial load, then click the Settings button
  setTimeout(async () => {
    try {
      await win.webContents.executeJavaScript(`
        const buttons = Array.from(document.querySelectorAll('nav button'));
        for (const btn of buttons) {
          if (btn.textContent && btn.textContent.includes('Settings')) {
            btn.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
            break;
          }
        }
      `);

      // Wait 2s for Settings page to render and capture
      setTimeout(async () => {
        try {
          const image = await win.webContents.capturePage();
          const outputPath = path.join(__dirname, 'settings-rendered.png');
          fs.writeFileSync(outputPath, image.toPNG());
          console.log('SETTINGS_SCREENSHOT_SAVED:' + outputPath);
        } catch (e) {
          console.error('Settings capture error:', e);
        } finally {
          app.quit();
        }
      }, 2000);
    } catch (err) {
      console.error('Error switching tab:', err);
      app.quit();
    }
  }, 2000);
});
