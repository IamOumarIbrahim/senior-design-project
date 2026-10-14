# Trips & Session Replay (`src/components/trips/`)

Trip session history, filtering, and second-by-second forensic replay components.

## Files

- `TripsView.tsx`: Tabular overview of recorded driving sessions. Lists trip date, start/end time, duration, distance, safety score, alert count, and readiness status with sorting and search filters.
- `TripDetailModal.tsx`: Detailed forensic inspection modal for an individual trip:
  - Displays full synchronized telemetry timeline (EAR, PERCLOS, head yaw, speed).
  - Annotates alert events with exact millisecond timestamps and escalation tiers.
  - Lists driver readiness pre-trip survey answers.
  - Maps rest stops suggested during the journey.
