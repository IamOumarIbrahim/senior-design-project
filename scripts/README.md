# Automation and Utility Scripts (`scripts`)

Contains automated testing, screenshot capture, and validation scripts for the desktop UI and analytics engine.

## Files

| File | Description |
| :--- | :--- |
| `capture-screenshot.js` | Headless Playwright script that renders the dashboard and saves a visual screenshot (`dashboard-rendered.png`). |
| `capture-settings.js` | Headless script capturing the Settings & Privacy tab to verify responsive rendering (`settings-rendered.png`). |
| `test-heatmap-render.js` | Node script verifying that the 7×24 activity heatmap generates valid color-scaled cells across all 168 hours of the week. |
