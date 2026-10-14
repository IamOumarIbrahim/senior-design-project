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

async function verify() {
  console.log('=== 1. VERIFYING CLEAN EMPTY DATABASE ===');
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(SCHEMA_SQL);
  const wrapper = new NodeSqlWrapper(db);
  const queries = new AnalyticsQueries(wrapper);

  const cleanKpis = queries.getDashboardKPIs('2026-09-27T00:00:00', '2026-09-27T23:59:59');
  const cleanBreakdown = queries.getDetectionBreakdown('2026-09-27T00:00:00', '2026-09-27T23:59:59');
  const cleanTrips = queries.getTrips();
  const cleanRecents = queries.getRecentDetections();
  const cleanTimeline = queries.getRecentTripTimeline();

  console.log('   - Empty Drive Time:', cleanKpis.totalDriveTimeFormatted);
  console.log('   - Empty Distractions:', cleanKpis.distractionCount);
  console.log('   - Empty Drowsiness:', cleanKpis.drowsinessCount);
  console.log('   - Empty Breakdown Total:', cleanBreakdown.total);
  console.log('   - Empty Trips Count:', cleanTrips.length);
  console.log('   - Empty Recents Count:', cleanRecents.length);
  console.log('   - Empty Timeline:', cleanTimeline === null ? 'null (ready for real trips)' : 'present');

  if (
    cleanKpis.distractionCount !== 0 ||
    cleanKpis.drowsinessCount !== 0 ||
    cleanBreakdown.total !== 0 ||
    cleanTrips.length !== 0 ||
    cleanTimeline !== null
  ) {
    throw new Error('Empty database checks failed!');
  }
  console.log('>>> CLEAN EMPTY DATABASE VERIFICATION PASSED! <<<\n');

  console.log('=== 2. VERIFYING SEEDING DEMO DATASET ===');
  seedDatabase(wrapper);

  const targetDateFilter = {
    startDate: '2026-09-27T00:00:00',
    endDate: '2026-09-27T23:59:59'
  };

  const kpis = queries.getDashboardKPIs(targetDateFilter.startDate, targetDateFilter.endDate);
  console.log('   - Total Drive Time:', kpis.totalDriveTimeFormatted, `(${kpis.driveTimeChangePct}% vs. last week)`);
  console.log('   - Distractions:', kpis.distractionCount, `(${kpis.distractionChangePct}% vs. last week)`);
  console.log('   - Drowsiness:', kpis.drowsinessCount, `(${kpis.drowsinessChangePct}% vs. last week)`);
  console.log('   - Longest Clean Stretch:', kpis.longestCleanStretchFormatted, `(${kpis.cleanStretchChangePct}% vs. last week)`);

  const breakdown = queries.getDetectionBreakdown(targetDateFilter.startDate, targetDateFilter.endDate);
  console.log('   - Total Detections:', breakdown.total);
  breakdown.items.forEach(it => {
    console.log(`   - ${it.name}: ${it.count} (${it.percentage}%)`);
  });

  const recents = queries.getRecentDetections(6);
  console.log('   - Recent Detections (first 6):');
  recents.forEach(r => {
    console.log(`     ${r.timeFormatted} | ${r.title} (${r.description}) ~ ${r.durationFormatted}`);
  });

  const timeline = queries.getRecentTripTimeline();
  console.log('   - Recent Trip Milestones:', timeline?.milestones.join(', '));
  console.log('   - Heatmap Cells:', queries.getHeatmapData().length);
  console.log('   - Total Trips:', queries.getTrips().length);

  const seededChecks = [
    kpis.totalDriveTimeFormatted === '4 h 32 m',
    kpis.distractionCount === 14,
    kpis.drowsinessCount === 3,
    kpis.longestCleanStretchFormatted === '1 h 48 m',
    breakdown.total === 17,
    recents[0].timeFormatted === '14:32',
    recents[1].timeFormatted === '12:17',
    recents[2].timeFormatted === '10:03',
    recents[3].timeFormatted === '09:41',
    recents[4].timeFormatted === '07:28',
    recents[5].timeFormatted === '06:12',
    timeline?.milestones.length === 9,
    queries.getHeatmapData().length === 168
  ];

  if (!seededChecks.every(Boolean)) {
    throw new Error('Seeded reference dataset checks failed!');
  }
  console.log('>>> SEEDED REFERENCE DATASET VERIFICATION PASSED! <<<\n');

  console.log('=== 3. VERIFYING CLEAR DATA OPERATION ===');
  wrapper.run('DELETE FROM detections;');
  wrapper.run('DELETE FROM trips;');

  const clearedKpis = queries.getDashboardKPIs(targetDateFilter.startDate, targetDateFilter.endDate);
  const clearedBreakdown = queries.getDetectionBreakdown(targetDateFilter.startDate, targetDateFilter.endDate);
  const clearedTrips = queries.getTrips();

  console.log('   - Cleared Distractions:', clearedKpis.distractionCount);
  console.log('   - Cleared Drowsiness:', clearedKpis.drowsinessCount);
  console.log('   - Cleared Breakdown Total:', clearedBreakdown.total);
  console.log('   - Cleared Trips Count:', clearedTrips.length);

  if (
    clearedKpis.distractionCount !== 0 ||
    clearedKpis.drowsinessCount !== 0 ||
    clearedBreakdown.total !== 0 ||
    clearedTrips.length !== 0
  ) {
    throw new Error('Clear data checks failed!');
  }
  console.log('>>> CLEAR DATA VERIFICATION PASSED! <<<\n');

  console.log('>>> ALL THREE VERIFICATION SUITES PASSED (CLEAN, SEEDED, CLEARED)! <<<');
}

verify().catch(e => {
  console.error(e);
  process.exit(1);
});
