import { contextBridge, ipcRenderer } from "electron";
import type {
  ImageZipInfo,
  PatcherConfig,
  RemoteInfo,
} from "@pixelborn-updater/types";

export interface ElectronAPI {
  // Config management
  getConfig: () => Promise<PatcherConfig>;
  saveConfig: (config: PatcherConfig) => Promise<void>;

  // File operations
  fileExists: (path: string) => Promise<boolean>;
  getInstallDir: () => Promise<string>;
  getGameInstallDir: () => Promise<string>;
  getPixelbornSettingsPath: () => Promise<string | null>;
  getPixelbornCardImagesPath: () => Promise<string | null>;

  // Download and extract
  downloadFile: (
    url: string,
    onProgress: (current: number, total: number) => void
  ) => Promise<string>;
  extractZip: (zipPath: string, extractTo: string) => Promise<void>;

  // Game management
  startGame: (executablePath: string) => Promise<void>;

  // Events
  onDownloadProgress: (
    callback: (current: number, total: number) => void
  ) => void;
  removeDownloadProgressListener: (
    callback: (current: number, total: number) => void
  ) => void;

  getLatestGameVersion: () => Promise<RemoteInfo>;
  getImageZipHash: (language: string) => Promise<ImageZipInfo>;
  onUpdateAvailable: (callback: (version: string) => void) => void;
  onUpdateDownloaded: (callback: () => void) => void;
  downloadPatcherUpdate: () => Promise<void>;
  quitAndInstall: () => Promise<void>;
}

contextBridge.exposeInMainWorld("electronAPI", {
  getConfig: (): Promise<PatcherConfig> => ipcRenderer.invoke("get-config"),

  saveConfig: (config: PatcherConfig): Promise<void> =>
    ipcRenderer.invoke("save-config", config),

  fileExists: (path: string): Promise<boolean> =>
    ipcRenderer.invoke("file-exists", path),

  getInstallDir: (): Promise<string> => ipcRenderer.invoke("get-install-dir"),

  getGameInstallDir: (): Promise<string> =>
    ipcRenderer.invoke("get-game-install-dir"),

  getPixelbornSettingsPath: (): Promise<string | null> =>
    ipcRenderer.invoke("get-pixelborn-settings-path"),

  getPixelbornCardImagesPath: (): Promise<string | null> =>
    ipcRenderer.invoke("get-pixelborn-card-images-path"),

  downloadFile: (
    url: string,
    onProgress: (current: number, total: number) => void
  ): Promise<string> => {
    const downloadId = Math.random().toString(36).substring(2, 15);

    // Set up progress listener
    const progressHandler = (
      _event: any,
      id: string,
      current: number,
      total: number
    ) => {
      if (id === downloadId) {
        onProgress(current, total);
      }
    };

    ipcRenderer.on("download-progress", progressHandler);

    return ipcRenderer
      .invoke("download-file", url, downloadId)
      .then((filePath) => {
        return filePath;
      })
      .finally(() => {
        ipcRenderer.removeListener("download-progress", progressHandler);
      });
  },

  extractZip: (zipPath: string, extractTo: string): Promise<void> =>
    ipcRenderer.invoke("extract-zip", zipPath, extractTo),

  startGame: (executablePath: string): Promise<void> =>
    ipcRenderer.invoke("start-game", executablePath),

  getLatestGameVersion: (): Promise<RemoteInfo> =>
    ipcRenderer.invoke("get-latest-game-version"),

  getImageZipHash: (language: string): Promise<ImageZipInfo> =>
    ipcRenderer.invoke("get-image-zip-hash", language),

  onDownloadProgress: (callback: (current: number, total: number) => void) => {
    ipcRenderer.on("download-progress", (_event, id, current, total) => {
      callback(current, total);
    });
  },

  removeDownloadProgressListener: (
    callback: (current: number, total: number) => void
  ) => {
    ipcRenderer.removeAllListeners("download-progress");
    ipcRenderer.removeAllListeners("update-available");
    ipcRenderer.removeAllListeners("update-downloaded");
  },

  onUpdateAvailable: (callback: (version: string) => void) => {
    ipcRenderer.on("update-available", (_event, version) => {
      callback(version);
    });
  },

  onUpdateDownloaded: (callback: () => void) => {
    ipcRenderer.on("update-downloaded", () => {
      callback();
    });
  },

  downloadPatcherUpdate: (): Promise<void> =>
    ipcRenderer.invoke("download-patcher-update"),

  quitAndInstall: (): Promise<void> => ipcRenderer.invoke("quit-and-install"),
} as ElectronAPI);

// Type declaration for global
declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
