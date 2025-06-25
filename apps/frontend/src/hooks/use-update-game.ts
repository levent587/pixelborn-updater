import { useState } from "react";
import { useLocalGameVersion } from "./use-game-version";
import { useDownload } from "./use-download";
import { toast } from "sonner";

export function useUpdateGame() {
  const { updateLocalVersion } = useLocalGameVersion();
  const [gameUpdateState, setGameUpdateState] = useState<
    "downloading" | "unzipping" | "idle" | "error"
  >("idle");

  const {
    downloadFile,
    currentProgress,
    currentSpeed,
    currentEta,
    currentBytes,
    totalBytes,
  } = useDownload();

  const downloadGame = async (url: string) => {
    setGameUpdateState("downloading");
    const filePath = await downloadFile(url);
    return filePath;
  };

  const unzipGame = async (zipPath: string, extractTo: string) => {
    setGameUpdateState("unzipping");
    await window.electronAPI.extractZip(zipPath, extractTo);
    setGameUpdateState("idle");
  };

  const startUpdate = async (url: string, latestVersion: string) => {
    try {
      const filePath = await downloadGame(url);
      const extractTo = await window.electronAPI.getGameInstallDir();
      await unzipGame(filePath, extractTo);
      updateLocalVersion(latestVersion);
    } catch (error) {
      toast.error("Error updating game");
      setGameUpdateState("error");
    }
  };

  return {
    startUpdate,
    gameUpdateState,
    currentProgress,
    currentSpeed,
    currentEta,
    currentBytes,
    totalBytes,
  };
}
