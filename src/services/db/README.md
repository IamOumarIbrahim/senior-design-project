# Database Service Layer (`src/services/db/`)

TypeScript database interface for the DriveSafe desktop client. Manages relational tables, analytical aggregation queries, schema migrations, and demo dataset seeding using WebAssembly `sql.js` (for web browser fallback) and native `better-sqlite3` (in Electron).

## Files

- `databaseService.ts`: Core database manager singleton. Coordinates database initialization, in-memory WebAssembly SQLite execution, local storage binary backups, query dispatching, and transaction commits.
- `queries.ts`: Analytical query definitions and execution engine. Implements SQL statements for:
  - Aggregate dashboard KPIs (total distance, safety score, alert frequency).
  - Time-series trend sampling (PERCLOS, EAR, yaw).
  - Alert categorization breakdowns (phone distraction, drowsy eyes, yawning, camera blindness).
  - Day-of-week and hourly attention heatmaps.
  - Trip list retrieval and single-session event timelines.
- `schema.ts`: DDL SQL schema definition:
  - `trips`: Driving session metadata (timestamps, distance, status, safety score).
  - `alerts`: Categorized driver alert events with severity tiers, confidence scores, and suppression flags.
  - `telemetry`: High-frequency driver metrics (EAR, PERCLOS, head pose angles, vehicle speed).
  - `driver_readiness`: Pre-trip psychometric readiness surveys and risk classifications.
  - `settings`: Key-value application configuration store.
- `seeder.ts`: Synthetic data generator. Populates realistic multi-day driving sessions, commute trips, randomized fatigue/distraction incidents, and baseline metrics for offline testing and product demonstration.
