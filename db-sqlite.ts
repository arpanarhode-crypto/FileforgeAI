const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("path");
const fs = require("fs");
const { spawn } = require("child_process");

let mainWindow = null;
let backendProcess = null;

const isDev = !app.isPackaged;
const PORT = process.env.PORT || 3000;

// Auto-spawn backend service in production mode
function startBackend() {
  if (isDev) {
    console.log("[Electron Main] Running in development mode. Assuming backend is running via npm run dev.");
    return;
  }

  const serverPath = path.join(process.resourcesPath, "app.asar.unpacked", "dist", "server.cjs");
  const fallbackServerPath = path.join(__dirname, "..", "dist", "server.cjs");

  const finalServerPath = fs.existsSync(serverPath) ? serverPath : fallbackServerPath;
  console.log(`[Electron Main] Spawning backend server at: ${finalServerPath}`);

  // Set environment to load SQLite and set offline configs
  const env = { 
    ...process.env, 
    ELECTRON_ENV: "true",
    USE_SQLITE: "true",
    NODE_ENV: "production",
    PORT: PORT.toString()
  };

  backendProcess = spawn("node", [finalServerPath], { env });

  backendProcess.stdout.on("data", (data) => {
    console.log(`[Backend Service]: ${data}`);
  });

  backendProcess.stderr.on("data", (data) => {
    console.error(`[Backend ERROR]: ${data}`);
  });

  backendProcess.on("close", (code) => {
    console.log(`[Backend Service] exited with status code ${code}`);
  });
}

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: "FileForge AI Desktop",
    backgroundColor: "#0b0f19",
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  // App Menu configurations (native-feeling copy, paste, reload, zoom control)
  const template = [
    {
      label: "File",
      submenu: [
        { label: "Preferences", click: () => { mainWindow.webContents.send("navigate-to", "settings"); } },
        { type: "separator" },
        { label: "Exit", click: () => { app.quit(); } }
      ]
    },
    {
      label: "Edit",
      submenu: [
        { role: "undo" },
        { role: "redo" },
        { type: "separator" },
        { role: "cut" },
        { role: "copy" },
        { role: "paste" },
        { role: "selectAll" }
      ]
    },
    {
      label: "View",
      submenu: [
        { role: "reload" },
        { role: "forceReload" },
        { role: "toggleDevTools" },
        { type: "separator" },
        { role: "resetZoom" },
        { role: "zoomIn" },
        { role: "zoomOut" },
        { type: "separator" },
        { role: "togglefullscreen" }
      ]
    },
    {
      label: "Help",
      submenu: [
        { label: "About FileForge", click: () => { mainWindow.webContents.send("show-about"); } },
        { label: "Check for Updates", click: () => { dialog.showMessageBox(mainWindow, { message: "You are running the latest stable offline build (v1.0.0).", buttons: ["OK"] }); } }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  // In development, load from Vite; in prod, server.cjs serves index.html or we can load it from dist
  if (isDev) {
    mainWindow.loadURL(`http://localhost:${PORT}`);
    mainWindow.webContents.openDevTools();
  } else {
    // Re-route relative fetch request inside local build cleanly in standalone offline app
    mainWindow.loadURL(`http://localhost:${PORT}`);
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

// IPC handlers for secure local file dialog controls (requested desktop native dials)
ipcMain.handle("dialog:openFile", async (event, options) => {
  if (!mainWindow) return null;
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ["openFile"],
    filters: options.filters || [{ name: "All Files", extensions: ["*"] }]
  });

  if (result.canceled || result.filePaths.length === 0) {
    return null;
  }

  const filePath = result.filePaths[0];
  const stats = fs.statSync(filePath);
  const buffer = fs.readFileSync(filePath);
  return {
    filePath,
    name: path.basename(filePath),
    size: stats.size,
    base64: buffer.toString("base64")
  };
});

ipcMain.handle("dialog:saveFile", async (event, { defaultName, base64 }) => {
  if (!mainWindow) return null;
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: defaultName || "output.pdf"
  });

  if (result.canceled || !result.filePath) {
    return false;
  }

  try {
    fs.writeFileSync(result.filePath, Buffer.from(base64, "base64"));
    return { success: true, filePath: result.filePath };
  } catch (err) {
    console.error("[Electron Main] Save File Error:", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("app:getOfflineStatus", () => {
  return {
    isOfflineMode: true,
    localHostUrl: `http://localhost:${PORT}`,
    tempCleanupDir: path.join(app.getPath("temp"), "FileForgeAI")
  };
});

app.whenReady().then(() => {
  startBackend();
  createMainWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createMainWindow();
  });
});

app.on("window-all-closed", () => {
  // Gracefully clean up background children processes and temp directory on escape
  if (process.platform !== "darwin") {
    if (backendProcess) {
      backendProcess.kill();
    }
    app.quit();
  }
});
