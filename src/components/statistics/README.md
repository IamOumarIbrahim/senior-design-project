# Statistics & Longitudinal Analytics (`src/components/statistics/`)

Advanced reporting view delivering aggregate driver health and vigilance trend analyses over multi-day and multi-month periods.

## Files

- `StatisticsView.tsx`: Comprehensive analytical dashboard rendering:
  - **Fatigue Vulnerability Curves**: Correlation graphs between driving time-of-day (e.g. late night, post-prandial dip) and average PERCLOS elevation.
  - **Distraction Frequency Indices**: Breakdown of distraction events per 100 km driven categorized by phone usage, mirror checks, and off-road glances.
  - **Intervention Efficacy Rates**: Metrics measuring how quickly the driver returned their eyes to the forward roadway following Tier 1 (chime), Tier 2 (voice), and Tier 3 (haptic/buzzer) warnings.
  - **Export Capabilities**: CSV and PDF summary report generation for fleet managers or academic evaluation.
