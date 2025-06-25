import { useState } from "react";
import { useDownload } from "./use-download";
import { useLocalImageHash } from "./use-card-image-version";
import { toast } from "sonner";

class ImageUpdateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUpdateError";
  }
}

export function useUpdateImages() {
  const { updateLocalHash } = useLocalImageHash();
  const [imageUpdateState, setImageUpdateState] = useState<
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

  const downloadImages = async (url: string) => {
    setImageUpdateState("downloading");
    const filePath = await downloadFile(url);
    return filePath;
  };

  const unzipImages = async (zipPath: string, extractTo: string) => {
    setImageUpdateState("unzipping");
    await window.electronAPI.extractZip(zipPath, extractTo);
    setImageUpdateState("idle");
  };

  const startUpdate = async (url: string, latestHash: string) => {
    try {
      const cardImagesPath =
        await window.electronAPI.getPixelbornCardImagesPath();
      if (!cardImagesPath) {
        throw new ImageUpdateError("Pixelborn card images path not found");
      }
      const filePath = await downloadImages(url);

      await unzipImages(filePath, cardImagesPath);
      updateLocalHash(latestHash);
    } catch (error) {
      if (error instanceof ImageUpdateError) {
        toast.error(error.message);
      } else {
        toast.error("Error updating images");
      }
      setImageUpdateState("error");
    }
  };

  return {
    startUpdate,
    imageUpdateState,
    currentProgress,
    currentSpeed,
    currentEta,
    currentBytes,
    totalBytes,
  };
}
