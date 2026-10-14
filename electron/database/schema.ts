export const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS trips (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  duration_seconds INTEGER NOT NULL,
  distance_km REAL NOT NULL,
  cleanest_stretch_seconds INTEGER NOT NULL DEFAULT 0,
  start_location TEXT DEFAULT 'Home',
  end_location TEXT DEFAULT 'Destination',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS detections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  trip_id INTEGER NOT NULL,
  timestamp TEXT NOT NULL,
  detection_type TEXT NOT NULL,
  confidence REAL NOT NULL DEFAULT 0.9,
  duration_seconds INTEGER NOT NULL DEFAULT 3,
  severity TEXT NOT NULL DEFAULT 'medium',
  metadata_json TEXT DEFAULT '{}',
  description TEXT NOT NULL,
  is_recent_sample INTEGER DEFAULT 0,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS system_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_trips_start_time ON trips(start_time);
CREATE INDEX IF NOT EXISTS idx_detections_timestamp ON detections(timestamp);
CREATE INDEX IF NOT EXISTS idx_detections_trip_id ON detections(trip_id);
CREATE INDEX IF NOT EXISTS idx_detections_type ON detections(detection_type);
`;
