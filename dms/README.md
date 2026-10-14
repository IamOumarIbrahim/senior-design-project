# Driver Monitoring System (DMS) — Edge Engine Module

This directory contains the Python-based edge perception, temporal filtering, nuisance suppression, and local logging engine for the in-cabin Driver Monitoring System.

## Files and Responsibilities

| File | Description |
| :--- | :--- |
| `__init__.py` | Package entry point exposing core perception, tracking, suppression, and server classes. |
| `__main__.py` | Direct execution router for `python -m dms`. |
| `cli.py` | Command-line interface offering subcommands (`live`, `dry-run`, `calibrate`, `readiness`, `rest-stops`, `test`). |
| `camera.py` | Handles 1080p 30 FPS video ingestion from physical webcams, recorded video files, and photorealistic synthetic driver emulation. |
| `blindness.py` | Camera obstruction verification calculating average brightness and Laplacian variance; triggers warnings if the lens is covered or blinded for $\ge 3$s. |
| `roi.py` | Driver-centered Region of Interest (ROI) tracking. Dynamically centers and crops a smooth 640×640 window on the driver's face to conserve compute and increase FPS. |
| `detector.py` | YOLO11n / YOLOv8n object detector identifying driver inattention cues (holding phone, drinking, yawning, hand over mouth, closed eyes) with heuristic fallback. |
| `eye_tracker.py` | Computes Left and Right Eye Aspect Ratio (EAR), normalized eye closure fraction, blink counts, prolonged closure (>1.5s micro-sleep), and rolling 60s valid-time PERCLOS. |
| `temporal_filter.py` | Continuous-time Exponential Moving Average (EMA) filter calculated over elapsed seconds ($dt$), ensuring invariant spike suppression across variable frame rates. |
| `suppression.py` | Nuisance alert suppression handling mirror-check glances (<1.5s ignored), alert cooldown windows, and hysteresis entry/exit thresholds. |
| `alerts.py` | Multi-tier asynchronous alert dispatcher playing WAV chimes, buzzers, and bilingual voice warnings (English and Arabic) without stalling inference. |
| `calibration.py` | 20-second driver baseline calibration measuring natural eye aspect ratio and setting personalized 99th-percentile confidence thresholds. |
| `readiness.py` | Pre-trip driver fatigue and readiness survey scoring fitness to drive and providing actionable rest recommendations. |
| `rest_stops.py` | GPS & POI rest stop recommendation service calculating great-circle distances to regional highway service stations and rest areas. |
| `database.py` | Power-cut-safe SQLite WAL-mode event logger recording session trips, detection incidents, calibrations, and readiness checks into `drivesafe.sqlite`. |
| `engine.py` | Central pipeline coordinator fusing camera ingestion, ROI tracking, detection, EAR/PERCLOS, temporal filtering, alert dispatching, and HUD overlay generation. |
| `server.py` | Multi-threaded HTTP and MJPEG streaming bridge exposing REST endpoints (`/api/status`, `/api/frame`, `/api/video_feed`, `/api/calibrate`, etc.) for the Electron UI. |

## Usage

```bash
# Launch live monitoring with default camera
python -m dms live

# Launch live monitoring with synthetic generator and HTTP bridge
python -m dms live --source synthetic --port 8765

# Run automated validation dry-run
python -m dms dry-run --frames 100

# Perform 20-second baseline calibration
python -m dms calibrate --driver-id Driver-01
```
