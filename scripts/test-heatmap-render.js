const fs = require('fs');
const path = require('path');
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

async function run() {
  console.log('--- 1. Initializing SQLite with sample data ---');
  const SQL = await initSqlJs();
  const db = new SQL.Database();
  db.run(SCHEMA_SQL);
  const wrapper = new NodeSqlWrapper(db);
  seedDatabase(wrapper);

  const queries = new AnalyticsQueries(wrapper);
  const heatmap = queries.getHeatmapData();

  console.log(`Heatmap total cells: ${heatmap.length} (expected 168: 7 days x 24 hours)\n`);

  // Render text-based heatmap table
  console.log('Day  | Hours (00 to 23) Intensity Matrix [0=none, 1=pale, 2=soft, 3=orange, 4=burnt, 5=dark]');
  console.log('-----+' + '-'.repeat(72));

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  days.forEach(d => {
    const rowCells = heatmap.filter(c => c.dayName === d);
    const rowStr = rowCells.map(c => ` ${c.intensity} `).join('');
    console.log(`${d.padEnd(4)} |${rowStr}`);
  });

  // Verify rush hours
  console.log('\n--- 2. Verifying Peak Patterns ---');
  const morningCommuteCells = heatmap.filter(c => c.hour === 7 && ['Mon', 'Tue', 'Wed', 'Thu'].includes(c.dayName));
  const eveningCommuteCells = heatmap.filter(c => c.hour === 18 && ['Mon', 'Tue', 'Wed', 'Thu'].includes(c.dayName));

  console.log('Morning rush hour (07:00) intensities on weekdays:', morningCommuteCells.map(c => `${c.dayName}:${c.intensity}`).join(', '));
  console.log('Evening rush hour (18:00) intensities on weekdays:', eveningCommuteCells.map(c => `${c.dayName}:${c.intensity}`).join(', '));

  // Save temporary SQLite database for Electron capture
  const appDataDir = path.join(process.env.APPDATA || '.', 'drivesafe-dashboard', 'data');
  if (!fs.existsSync(appDataDir)) fs.mkdirSync(appDataDir, { recursive: true });
  const dbFile = path.join(appDataDir, 'drivesafe.sqlite');
  fs.writeFileSync(dbFile, Buffer.from(db.export()));
  console.log(`\nSample database saved to ${dbFile} for Electron visual capture.`);
}

run().catch(console.error);
