import { ipcMain, app } from "electron";
import { spawn } from "node:child_process";
import path from "node:path";
import fs from "node:fs/promises";
import AdmZip from "adm-zip";
import type {
  ImageZipInfo,
  PatcherConfig,
  RemoteInfo,
} from "@pixelborn-updater/types";
import { PatcherConfigSchema } from "@pixelborn-updater/types";
import { API_URL } from "@/lib/api";
import os from "os";
import { FailedToStartGameError } from "@/lib/launch-game";
import { getAutoUpdater } from "./auto-updater";
const CONFIG_FILE = "updater.config.json";

function getPixelbornSettingsPath() {
  // This function is only relevant on Windows.
  if (os.platform() !== "win32") {
    return null;
  }

  // %LOCALAPPDATA% resolves to C:\Users\<user>\AppData\Local
  const localAppData = process.env.LOCALAPPDATA;

  if (!localAppData) {
    return null;
  }

  return path.join(
    localAppData,
    "..",
    "LocalLow",
    "Rebellious Software",
    "Pixelborn"
  );
}

function getPixelbornCardImagesPath() {
  const settingsPath = getPixelbornSettingsPath();
  if (!settingsPath) {
    return null;
  }
  return path.join(settingsPath, "Cards", "Key");
}

function getBaseDir(): string {
  return path.resolve(app.getPath("userData"));
}

// Get the config file path
function getConfigPath(): string {
  return path.join(getBaseDir(), CONFIG_FILE);
}

function getGameInstallDir(): string {
  return path.resolve(getBaseDir(), "game");
}

async function saveConfig(config: PatcherConfig): Promise<void> {
  try {
    const configPath = getConfigPath();
    await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to save config:", error);
    throw new Error("Failed to save configuration");
  }
}

function createDefaultConfig(): PatcherConfig {
  return {
    version: "0.0.0",
    executablePath: null,
    imageZipHash: null,
    cardImageLanguage: "en",
    autoLaunch: false,
    autoLaunchDelay: 3000, // 3 seconds
  };
}

// Setup all IPC handlers
export function setupElectronHandlers() {
  // Config management
  ipcMain.handle("get-config", async (): Promise<PatcherConfig> => {
    try {
      const configPath = getConfigPath();
      const configData = await fs.readFile(configPath, "utf-8");
      return PatcherConfigSchema.parse(JSON.parse(configData));
    } catch (error) {
      console.error("Failed to get config:", error);
      const defaultConfig = createDefaultConfig();
      try {
        await saveConfig(defaultConfig);
      } catch (error) {
        console.error("Failed to create config file on error:", error);
      }
      return defaultConfig;
    }
  });

  ipcMain.handle(
    "save-config",
    async (_, config: PatcherConfig): Promise<void> => {
      saveConfig(config);
    }
  );

  // File operations
  ipcMain.handle(
    "file-exists",
    async (_, filePath: string): Promise<boolean> => {
      try {
        await fs.access(filePath);
        return true;
      } catch {
        return false;
      }
    }
  );

  ipcMain.handle("get-install-dir", (): string => {
    return getBaseDir();
  });

  ipcMain.handle("get-game-install-dir", (): string => {
    return getGameInstallDir();
  });

  ipcMain.handle("get-pixelborn-settings-path", (): string | null => {
    return getPixelbornSettingsPath();
  });

  ipcMain.handle("get-pixelborn-card-images-path", (): string | null => {
    return getPixelbornCardImagesPath();
  });

  // Download functionality
  ipcMain.handle(
    "download-file",
    async (event, url: string, downloadId: string): Promise<string> => {
      try {
        const response = await fetch(url);

        if (!response.ok || !response.body) {
          throw new Error(`Download failed: ${response.statusText}`);
        }

        const totalSize = Number(response.headers.get("content-length") || 0);
        if (totalSize < 10000) {
          throw new Error(
            `Download is too small (${totalSize} bytes). Authentication failed.`
          );
        }

        let downloadedSize = 0;
        const chunks: Uint8Array[] = [];

        const reader = response.body.getReader();

        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          chunks.push(value);
          downloadedSize += value.length;

          // Send progress update
          event.sender.send(
            "download-progress",
            downloadId,
            downloadedSize,
            totalSize
          );
        }

        // Save the downloaded file to a temporary location
        const tempDir = path.join(getBaseDir(), "temp");
        await fs.mkdir(tempDir, { recursive: true });

        const tempFilePath = path.join(tempDir, `download_${downloadId}.zip`);
        const buffer = Buffer.concat(chunks);
        await fs.writeFile(tempFilePath, buffer);

        // Store the temp file path for extraction
        // In a real implementation, you might want to use a map to store this
        (global as any).lastDownloadPath = tempFilePath;

        return tempFilePath;
      } catch (error) {
        console.error("Download failed:", error);
        throw error;
      }
    }
  );

  // Extract ZIP functionality
  ipcMain.handle(
    "extract-zip",
    async (_, zipPath: string, extractTo: string): Promise<void> => {
      try {
        // If zipPath is not provided, use the last downloaded file
        const actualZipPath = zipPath || (global as any).lastDownloadPath;

        if (!actualZipPath) {
          throw new Error("No ZIP file to extract");
        }

        // Ensure extract directory exists
        await fs.mkdir(extractTo, { recursive: true });

        // Read and extract ZIP file
        const zipBuffer = await fs.readFile(actualZipPath);
        const zip = new AdmZip(zipBuffer);

        // Extract all files
        await zip.extractAllToAsync(extractTo, true);

        // Clean up temporary file
        if (actualZipPath === (global as any).lastDownloadPath) {
          try {
            await fs.unlink(actualZipPath);
          } catch (cleanupError) {
            console.warn("Failed to clean up temp file:", cleanupError);
          }
          (global as any).lastDownloadPath = null;
        }
      } catch (error) {
        console.error("Extraction failed:", error);
        throw error;
      }
    }
  );

  // Game launching
  ipcMain.handle(
    "start-game",
    async (_, executablePath: string): Promise<void> => {
      try {
        console.log(`Starting game: ${executablePath}`);

        const child = spawn(executablePath, [], {
          detached: true,
          stdio: "ignore",
        });

        child.unref();

        app.quit();
      } catch (error) {
        console.error("Failed to start game:", error);
        throw new FailedToStartGameError(
          `Failed to start game with path: ${executablePath}`
        );
      }
    }
  );

  ipcMain.handle("get-latest-game-version", async (): Promise<RemoteInfo> => {
    const response = await fetch(`${API_URL}/version`);
    if (!response.ok) {
      throw new Error(
        `Failed to fetch latest version: ${response.status} ${response.statusText}`
      );
    }
    const data = await response.json();
    return data;
  });

  ipcMain.handle(
    "get-image-zip-hash",
    async (_, language: string): Promise<ImageZipInfo> => {
      const response = await fetch(`${API_URL}/images/${language}/hash`);
      if (!response.ok) {
        throw new Error(
          `Failed to fetch image hash: ${response.status} ${response.statusText}`
        );
      }
      const data = await response.json();
      return data;
    }
  );

  ipcMain.handle("download-patcher-update", async (): Promise<void> => {
    getAutoUpdater().downloadUpdate();
  });

  ipcMain.handle("quit-and-install", async (): Promise<void> => {
    getAutoUpdater().quitAndInstall();
  });
}

// Clean up function to call on app exit
export function cleanupElectronHandlers() {
  // Clean up any temporary files
  const tempPath = (global as any).lastDownloadPath;
  if (tempPath) {
    fs.unlink(tempPath).catch(console.warn);
  }
}
