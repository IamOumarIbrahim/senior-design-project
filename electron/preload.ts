import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('driveSafeAPI', {
  isElectron: true,
  getDashboardKPIs: (filter: any) => ipcRenderer.invoke('db:getDashboardKPIs', filter),
  getTrendData: (filter: any) => ipcRenderer.invoke('db:getTrendData', filter),
  getDetectionBreakdown: (filter: any) => ipcRenderer.invoke('db:getDetectionBreakdown', filter),
  getHeatmapData: (filter?: any) => ipcRenderer.invoke('db:getHeatmapData', filter),
  getRecentDetections: (limit?: number) => ipcRenderer.invoke('db:getRecentDetections', limit),
  getRecentTripTimeline: () => ipcRenderer.invoke('db:getRecentTripTimeline'),
  getTrips: (filter?: any) => ipcRenderer.invoke('db:getTrips', filter),
  getTripDetails: (tripId: number) => ipcRenderer.invoke('db:getTripDetails', tripId),
  getStatisticsInsights: (filter?: any) => ipcRenderer.invoke('db:getStatisticsInsights', filter),
  getSettings: () => ipcRenderer.invoke('db:getSettings'),
  saveSettings: (settings: any) => ipcRenderer.invoke('db:saveSettings', settings),
  clearData: () => ipcRenderer.invoke('db:clearData'),
  reseedDatabase: () => ipcRenderer.invoke('db:reseedDatabase'),
  exportDatabase: () => ipcRenderer.invoke('db:exportDatabase'),
  minimizeWindow: () => ipcRenderer.send('window:minimize'),
  maximizeWindow: () => ipcRenderer.send('window:maximize'),
  closeWindow: () => ipcRenderer.send('window:close'),
});
