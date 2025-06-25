import { toast } from "sonner";

export class FailedToStartGameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FailedToStartGameError";
  }
}

export const launchGame = async () => {
  try {
    const installDir = await window.electronAPI.getGameInstallDir();
    await window.electronAPI.startGame(`${installDir}/Pixelborn.exe`);
  } catch (error) {
    if (error instanceof FailedToStartGameError) {
      toast.error(error.message);
    } else {
      toast.error("Failed to start game");
    }
  }
};
