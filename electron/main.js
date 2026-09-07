const { app, BrowserWindow, shell } = require('electron');
const path = require('path');

let mainWindow = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Traffix AI — Centralized City-Wide ANPR Dashboard',
    icon: path.join(__dirname, '../assets/images/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
    autoHideMenuBar: false,
    backgroundColor: '#0f172a',
  });

  const devUrl = 'http://localhost:8081';
  const prodPath = path.join(__dirname, '../dist/index.html');

  if (isDev) {
    // In development mode, connect to the live Expo Metro web dev server
    mainWindow.loadURL(devUrl).catch(() => {
      console.log('Retrying connection to Expo web dev server at ' + devUrl + '...');
      setTimeout(() => {
        if (mainWindow) mainWindow.loadURL(devUrl);
      }, 2000);
    });
  } else {
    // In production, load the pre-built static web assets
    mainWindow.loadFile(prodPath);
  }

  // Open external links in the default OS browser rather than inside Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
