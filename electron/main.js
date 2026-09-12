const { app, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const http = require('http');

let mainWindow = null;
let aiDaemonProcess = null;

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

/**
 * Find the Python interpreter for the Traffix_Ai sidecar
 */
function getPythonPath(aiRootDir) {
  const isWin = process.platform === 'win32';
  const venvPython = isWin
    ? path.join(aiRootDir, 'venv', 'Scripts', 'python.exe')
    : path.join(aiRootDir, 'venv', 'bin', 'python');

  if (fs.existsSync(venvPython)) {
    return venvPython;
  }
  return isWin ? 'python' : 'python3';
}

/**
 * Check if the AI stream daemon is responding on port 8002
 */
function checkAiDaemonHealth(port = 8002) {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/health`, { timeout: 400 }, (res) => {
      resolve(res.statusCode === 200);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Kill any leftover process on port 8002 to ensure AI stdout/stderr is bound to THIS terminal
 */
function killOrphanProcessOnPort(port = 8002) {
  try {
    if (process.platform === 'win32') {
      const out = require('child_process').execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = out.split('\n');
      for (const line of lines) {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid && !isNaN(Number(pid))) {
          require('child_process').execSync(`taskkill /PID ${pid} /F`);
        }
      }
    } else {
      require('child_process').execSync(`fuser -k ${port}/tcp 2>/dev/null || true`);
    }
  } catch {}
}

/**
 * Start the Python AI stream server as an embedded background sidecar
 */
async function startAiDaemon() {
  killOrphanProcessOnPort(8002);
  await new Promise((r) => setTimeout(r, 200));

  const aiRootDir = path.resolve(__dirname, '../../Traffix_Ai');
  const streamServerScript = path.join(aiRootDir, 'server', 'stream_server.py');
  const pythonPath = getPythonPath(aiRootDir);

  if (!fs.existsSync(streamServerScript)) {
    console.warn(`[ELECTRON-AI] ⚠️ stream_server.py not found at: ${streamServerScript}`);
    return;
  }

  console.log(`[ELECTRON-AI] 🧠 Launching embedded AI stream sidecar (${pythonPath})...`);

  try {
    aiDaemonProcess = spawn(pythonPath, [streamServerScript], {
      cwd: aiRootDir,
      detached: false,
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });

    aiDaemonProcess.stdout.on('data', (data) => {
      const text = data.toString();
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.trim()) {
          console.log(`[AI-ENGINE] ${line.trim()}`);
        }
      }
    });

    aiDaemonProcess.stderr.on('data', (data) => {
      const text = data.toString();
      const lines = text.split('\n');
      for (const line of lines) {
        if (line.trim() && !line.includes('INFO:')) {
          console.log(`[AI-ENGINE] ${line.trim()}`);
        }
      }
    });

    aiDaemonProcess.on('error', (err) => {
      console.error('[ELECTRON-AI] ❌ Failed to spawn AI sidecar process:', err.message);
    });

    aiDaemonProcess.on('exit', (code, signal) => {
      console.log(`[ELECTRON-AI] AI sidecar process exited with code ${code}, signal ${signal}`);
      aiDaemonProcess = null;
    });

    // Wait for the server to be healthy
    for (let attempt = 0; attempt < 25; attempt++) {
      await new Promise((r) => setTimeout(r, 250));
      if (await checkAiDaemonHealth(8002)) {
        console.log('[ELECTRON-AI] 🚀 Traffix_Ai sidecar initialized and ready on port 8002!');
        return;
      }
    }
    console.warn('[ELECTRON-AI] ⚠️ AI sidecar started, but health endpoint is taking longer to respond.');
  } catch (err) {
    console.error('[ELECTRON-AI] ❌ Error launching AI daemon:', err);
  }
}

/**
 * Cleanly terminate the Python AI sidecar process
 */
function stopAiDaemon() {
  if (aiDaemonProcess && !aiDaemonProcess.killed) {
    console.log('[ELECTRON-AI] 🛑 Stopping Traffix_Ai stream sidecar process...');
    try {
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', aiDaemonProcess.pid, '/f', '/t']);
      } else {
        aiDaemonProcess.kill('SIGTERM');
      }
    } catch (err) {
      console.error('[ELECTRON-AI] Error stopping AI daemon:', err);
    }
    aiDaemonProcess = null;
  }
}

// Attach process termination hooks
process.on('exit', stopAiDaemon);
process.on('SIGINT', () => {
  stopAiDaemon();
  process.exit(0);
});
process.on('SIGTERM', () => {
  stopAiDaemon();
  process.exit(0);
});

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
    mainWindow.loadURL(devUrl).catch(() => {
      console.log('Retrying connection to Expo web dev server at ' + devUrl + '...');
      setTimeout(() => {
        if (mainWindow) mainWindow.loadURL(devUrl);
      }, 2000);
    });
  } else {
    mainWindow.loadFile(prodPath);
  }

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

app.whenReady().then(async () => {
  // 1. Launch local Python AI stream sidecar
  await startAiDaemon();

  // 2. Create the Desktop Window
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('before-quit', stopAiDaemon);
app.on('will-quit', stopAiDaemon);

app.on('window-all-closed', () => {
  stopAiDaemon();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
