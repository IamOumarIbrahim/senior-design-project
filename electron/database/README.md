# Electron Database Engine (`electron/database`)

Contains the SQLite storage schema, seeder, and analytical aggregation query engine.

## Files

| File | Description |
| :--- | :--- |
| `schema.ts` | Complete SQL DDL schema creating tables (`trips`, `detections`, `system_settings`) and indexes for high-speed chronological querying. |
| `queries.ts` | Analytics query engine calculating Dashboard KPIs, 24h trend data points, donut breakdown distributions, 7×24 activity heatmaps, and habit statistics. |
| `seeder.ts` | Generates a 48-trip demo dataset representing 30 days of realistic commuter driving behavior, distraction incidents, and fatigue patterns for offline review. |
