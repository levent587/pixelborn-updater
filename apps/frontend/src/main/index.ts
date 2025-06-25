import { app, BrowserWindow, Menu } from "electron";
import path from "node:path";
import {
  setupElectronHandlers,
  cleanupElectronHandlers,
} from "./electron-handlers";
import isDev from "electron-is-dev";
import { getAutoUpdater } from "./auto-updater";

if (require("electron-squirrel-startup")) {
  app.quit();
}
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (!mainWindow) return;
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  });

  let mainWindow: BrowserWindow | null = null;

  const createWindow = async (): Promise<void> => {
    mainWindow = new BrowserWindow({
      height: 600,
      width: 900,
      minHeight: 575,
      minWidth: 800,
      webPreferences: {
        preload: path.join(__dirname, "../preload/preload.cjs"),
        nodeIntegration: false,
        contextIsolation: true,
      },
      autoHideMenuBar: true,
      backgroundColor: "#0f172a",
      show: false,
      title: `Pixelborn Updater v${app.getVersion()}`,
    });

    Menu.setApplicationMenu(null);

    const startURL = isDev
      ? "http://localhost:5173/"
      : `file://${path.join(__dirname, "../renderer/index.html")}`;

    mainWindow.loadURL(startURL);
    mainWindow.once("ready-to-show", async () => {
      mainWindow?.show();
      getAutoUpdater().autoDownload = false;
      await getAutoUpdater().checkForUpdates();
    });
    mainWindow.on("closed", () => (mainWindow = null));
  };

  app.on("ready", () => {
    setupElectronHandlers();
    createWindow();
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      cleanupElectronHandlers();
      app.quit();
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });

  app.on("before-quit", () => {
    cleanupElectronHandlers();
  });

  getAutoUpdater().on("update-available", (info) => {
    mainWindow?.webContents.send("update-available", info.version);
  });
  getAutoUpdater().on("update-downloaded", (info) => {
    mainWindow?.webContents.send("update-downloaded", info.version);
  });
}
