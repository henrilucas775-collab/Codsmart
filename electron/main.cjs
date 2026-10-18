const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const { getExpenses, saveExpenses } = require('./db.cjs');

ipcMain.handle('expenses:get', () => getExpenses());
ipcMain.handle('expenses:save', (_event, records) => saveExpenses(records));

function createWindow() {
  const win = new BrowserWindow({
    width: 1460,
    height: 940,
    minWidth: 1050,
    minHeight: 700,
    backgroundColor: '#f5f7fb',
    title: 'Gestion des charges',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  const devPort = process.env.VITE_PORT || '5174';

  if (app.isPackaged) {
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    win.loadURL(`http://127.0.0.1:${devPort}`);
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
