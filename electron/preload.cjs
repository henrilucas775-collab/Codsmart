const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getExpenses: () => ipcRenderer.invoke('expenses:get'),
  saveExpenses: (records) => ipcRenderer.invoke('expenses:save', records)
});
