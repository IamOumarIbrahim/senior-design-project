# React Component Architecture (`src/components/`)

Modular UI component hierarchy for the DriveSafe in-cabin telemetry and post-trip analytics application built with React 18, Tailwind CSS, Lucide icons, and Recharts.

## Subdirectories

- `common/`: Global framing and navigation elements including application header, title bar, and sidebar navigation.
- `dashboard/`: Fleet overview and real-time operational dashboard widgets (KPIs, trend charts, risk breakdowns, recent detections).
- `live/`: In-cabin live driver monitoring view featuring streaming video HUD, physical LED status simulation, calibration progress, pre-trip readiness survey, and highway rest stop suggestions.
- `settings/`: System configuration panels for edge detection thresholds, alert volumes, language preferences (English/Arabic), and camera device selection.
- `statistics/`: Advanced longitudinal driving analytics, PERCLOS fatigue trends, eye glance distribution, and alert frequency reports.
- `trips/`: Trip log table, session filtering, and detailed trip playback modal with second-by-second telemetry inspection.
