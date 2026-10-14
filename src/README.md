# React Desktop & Tablet Frontend (`src`)

Contains the React 18, TypeScript, Tailwind CSS, and Recharts frontend application for the DriveSafe post-drive analytics dashboard and in-cabin tablet interface.

## Directory Structure

| Directory | Purpose |
| :--- | :--- |
| `components/` | Modular React components organized by feature tab (dashboard, live monitor, trips, statistics, settings). |
| `services/` | Universal data layer abstraction supporting native Electron IPC and browser SQL.js execution. |
| `types/` | TypeScript type definitions for trips, detection events, KPI summaries, and telemetry. |

## Core Files

- `App.tsx`: Main application orchestrator managing navigation state, date filtering, data loading, and view switching.
- `main.tsx`: React application root mounting the DOM element.
- `index.css`: Global Tailwind CSS rules and custom scrollbar styling.
