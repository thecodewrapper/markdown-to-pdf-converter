const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktop', {
  openFile: () => ipcRenderer.invoke('file:open'),
  saveFile: (payload) => ipcRenderer.invoke('file:save', payload),
  exportPdf: (payload) => ipcRenderer.invoke('pdf:export', payload),
  onMenuAction: (callback) => {
    ['open', 'save', 'export'].forEach((action) => {
      ipcRenderer.on(`menu:${action}`, () => callback(action));
    });
  },
  onExportComplete: (callback) => ipcRenderer.on('pdf:complete', (_event, filePath) => callback(filePath))
});
