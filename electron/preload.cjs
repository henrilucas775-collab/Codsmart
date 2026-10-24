const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getExpenses: () => ipcRenderer.invoke('expenses:get'),
  saveExpenses: (records) => ipcRenderer.invoke('expenses:save', records),
  getPayroll: () => ipcRenderer.invoke('payroll:get'),
  savePayroll: (data) => ipcRenderer.invoke('payroll:save', data),
  importReceipt: () => ipcRenderer.invoke('receipts:import'),
  scanReceipt: () => ipcRenderer.invoke('receipts:scan'),
  openReceipt: (file) => ipcRenderer.invoke('receipts:open', file)
});
