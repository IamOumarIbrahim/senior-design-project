# Dashboard Components (`src/components/dashboard/`)

Analytical and summary widgets comprising the primary post-trip and fleet monitoring dashboard.

## Files

- `ActivityHeatmap.tsx`: Calendar / hourly matrix visualization displaying historical driver attention and alert frequency patterns across times of day and days of the week.
- `BreakdownChart.tsx`: Donut and bar charts detailing alert classifications (phone distraction, drowsy eyes closed, yawning, optical camera occlusion).
- `DashboardView.tsx`: Main dashboard screen combining aggregate metrics, high-priority notifications, fleet-wide safety scores, and trend graphs into a unified responsive layout.
- `KpiCard.tsx`: Reusable key performance indicator widget with dynamic trend indicators, percentage deltas, baseline comparisons, and alert severity color coding.
- `RecentDetections.tsx`: Live feed log card showing the most recent detection events with timestamps, cue labels, confidence percentages, and alert escalation tiers.
- `TrendChart.tsx`: Time-series chart rendering PERCLOS, Eye Aspect Ratio (EAR), and head pose yaw variations across driving sessions using Recharts.
- `TripTimeline.tsx`: Sequential timeline component showing driving sessions, alert milestones, rest stops, and calibration checkpoints along a route.
