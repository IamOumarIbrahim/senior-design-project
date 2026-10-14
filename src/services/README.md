# Service Layer (`src/services/`)

Bridge and abstraction layer facilitating communications between React frontend components, the Electron main process, and the underlying SQLite database.

## Files

- `api.ts`: Unified API bridge interface. Detects whether the frontend is running inside an Electron desktop window or a standalone web browser:
  - In Electron: delegates requests across IPC channels via `window.driveSafeAPI`.
  - In Browser: falls back gracefully to `dbService` using browser-compatible local storage and mock telemetry.
  - Exposes typed methods for KPIs, trend data, alert breakdowns, heatmap distributions, trips, settings mutations, database export, and window management.

## Subdirectories

- `db/`: Database service layer implementing SQL schema initialization, query execution, seed generation, and CRUD operations.
