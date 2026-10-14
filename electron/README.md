# Electron Desktop Main Process (`electron`)

Contains the TypeScript source code for the Electron desktop application wrapper, IPC channels, and native database connection.

## Files

| File | Description |
| :--- | :--- |
| `main.ts` | Main Electron lifecycle controller, window manager, and IPC handler bridge connecting frontend calls to local SQLite storage. |
| `preload.ts` | Secure context-isolated preload script exposing `window.electronAPI` bridge to the React renderer. |
| `types.ts` | Shared TypeScript interfaces and IPC communication contracts. |
| `database/` | Subdirectory containing SQL schemas, analytical queries, and demo dataset seeders. |
