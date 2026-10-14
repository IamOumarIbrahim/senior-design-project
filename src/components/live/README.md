# Live Monitor In-Cabin Tablet View (`src/components/live/`)

Real-time in-cabin dashboard component designed for vehicle mounting on tablet or dashboard displays.

## Files

- `LiveMonitorView.tsx`: Comprehensive live telemetry and interactive driver interface featuring:
  - **Streaming Video Canvas**: Receives real-time MJPEG feed from `dms/server.py` (port 8765) or falls back to synthetic driver simulator with live HUD bounding boxes and eye trackers.
  - **Physical LED Status Bar Simulation**: Multi-state pulsing LED strip visualizer (Normal Green, Warning Amber, Critical Red) matching the physical hardware LED bar.
  - **Driver Metrics Telemetry**: Live digital meters for EAR (Eye Aspect Ratio), 60-second rolling PERCLOS (Percentage Eye Closure), Head Yaw angle, and detected driver cues.
  - **Baseline Calibration Card**: Interactive 20-second calibration countdown with real-time stability progress bar and calculated personalized thresholds.
  - **Pre-Trip Readiness Survey Modal**: Standardized psychometric questionnaire (sleep duration, hours awake, physical fatigue, caffeine/medication) with safety advisory scoring before starting long highway trips.
  - **UAE Highway Rest Stop Suggestions**: Contextual card displaying the nearest rest areas and ENOC/ADNOC fuel plazas along UAE corridors (E11 Sheikh Zayed Rd, E311 Sheikh Mohammad Bin Zayed Rd, E611 Emirates Rd) with calculated driving distance and minutes away.
  - **Multi-Modal Alert Test Bench**: Interactive trigger buttons to preview bilingual voice alerts (English and Arabic), warning chimes, and critical buzzer sounds.
  - **Live Cue Simulation Controls**: Developer/test buttons to simulate phone distraction, yawning, eye micro-sleep, and return to normal driving without requiring a physical camera.
