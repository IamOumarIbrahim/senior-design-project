# System Settings Components (`src/components/settings/`)

Configuration interface for customizing driver thresholds, alert behaviors, and hardware integration parameters.

## Files

- `SettingsView.tsx`: Comprehensive configuration screen providing:
  - **Threshold Adjustments**: Sliders and numerical inputs for EAR blink cutoff, PERCLOS fatigue trigger percentage, head pose yaw glance limits, and eye closure micro-sleep duration.
  - **Alert Configuration**: Volume controls, multi-tier escalation intervals, alert cooldown timers (default 10s), mirror-check glance suppression duration (1.5s), and audio prompt language selection (English / Arabic / Chimes only).
  - **Camera & Hardware Options**: Input source selection (webcam index, RTSP stream, or synthetic simulator), target FPS (30 FPS), resolution (1080p / 720p), and camera occlusion timeout duration.
  - **Database & Storage Controls**: SQLite WAL retention policy, telemetry sampling rates, and diagnostic database maintenance.
