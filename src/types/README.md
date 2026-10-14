# TypeScript Type Definitions (`src/types/`)

Type contracts, interfaces, and enumeration types ensuring static type safety across React components, Electron IPC channels, and database queries.

## Files

- `index.ts`: Central type definition module containing:
  - `DetectionClass` & `DetectionCategory`: Computer vision cue classifications (`holding_phone`, `yawning`, `drinking`, `looking_away`, `eyes_closed`).
  - `SeverityLevel`: Multi-tier alert urgency rankings (`low`, `medium`, `high`, `critical`).
  - `Trip`: Relational representation of a driving session including duration, distance, cleanliness metrics, and aggregate safety score (0–100).
  - `Detection`: Forensic record of an in-cabin alert or driver attention anomaly.
  - `DashboardKPIs`: Aggregate metrics displayed on executive summary cards.
  - `TrendDataPoint`: Time-bucketed series points for Recharts visualizations.
  - `HeatmapCell`: Two-dimensional distribution coordinates for hourly activity matrices.
  - `SystemSettings`: Persisted system configuration options.
  - `DateFilter`: Temporal query constraints (`all`, `day`, `week`, `month`).
