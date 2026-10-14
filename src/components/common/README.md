# Common UI Components (`src/components/common/`)

Shared structural UI elements providing layout framing, navigation routing, and desktop window controls.

## Files

- `Header.tsx`: Application top header bar. Displays current page title, breadcrumb context, system status indicators (e.g. Edge Engine Online / Live), active user profile badge, and quick-action buttons.
- `Sidebar.tsx`: Primary navigation sidebar containing icons and links to all application views: Live Monitor, Dashboard, Trips, Statistics, and Settings. Includes collapsible state and active route highlighting.
- `TitleBar.tsx`: Frameless Electron desktop window bar with drag region and custom minimize, maximize, and close window controls.
