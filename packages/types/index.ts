export type PatcherConfig = {
  version: string;
  executablePath: string | null;
  imageZipHash: string | null;
  cardImageLanguage?: string;
};

export type RemoteInfo = {
  version: string;
  url: string;
};

export type ImageZipInfo = {
  hash: string;
  downloadUrl: string;
};

export type PatchState =
  | "idle"
  | "checking-versions"
  | "update-available"
  | "no-update-needed"
  | "downloading-game"
  | "extracting-game"
  | "checking-images"
  | "downloading-images"
  | "extracting-images"
  | "complete"
  | "error";

export type PatchProgress = {
  phase: "game" | "images" | null;
  percent: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: number; // MB/s
  eta: number; // seconds
};

export type UpdateCheckResult = {
  gameUpdateAvailable: boolean;
  imageUpdateAvailable: boolean;
  currentVersion: string;
  latestVersion: string;
};
