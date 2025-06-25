import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ImageZipInfo, PatcherConfig } from "@pixelborn-updater/types";
import { useLanguage } from "./use-language";
import { useConfigContext } from "@/contexts/config-context";
import { useUpdateConfig } from "./use-update-config";
import { ERROR_CODES } from "@/lib/error-codes";
import { toast } from "sonner";

async function getCardImages(language: string = "en"): Promise<ImageZipInfo> {
  try {
    return await window.electronAPI.getImageZipHash(language);
  } catch (error) {
    console.error("Error fetching card images:", error);
    throw error;
  }
}

export function useLocalImageHash() {
  const config = useConfigContext();
  const updateConfig = useUpdateConfig();
  const queryClient = useQueryClient();

  const updateLocalHash = async (hash: string) => {
    const updatedConfig: PatcherConfig = {
      ...config,
      imageZipHash: hash,
    };

    try {
      await updateConfig.mutateAsync(updatedConfig);
    } catch (error) {
      toast.error("Error saving new image version in config");
    }
  };

  const loadLocalHash = () => {
    queryClient.invalidateQueries({ queryKey: ["config"] });
  };

  return {
    localHash: config.imageZipHash,
    updateLocalHash,
    loadLocalHash,
  };
}

function useLatestImageHash() {
  const { currentLanguage } = useLanguage();
  const queryClient = useQueryClient();
  const { data, isFetching, error } = useQuery({
    queryKey: ["image-hash", currentLanguage],
    queryFn: () => getCardImages(currentLanguage),
    meta: { errCode: ERROR_CODES.GET_IMAGE_ZIP_HASH },
  });

  const loadLatestHash = () => {
    queryClient.invalidateQueries({ queryKey: ["image-hash"] });
  };

  return {
    latestImageHash: data?.hash,
    latestImageUrl: data?.downloadUrl,
    isFetching,
    error,
    loadLatestHash,
  };
}

export function useCardImageVersion() {
  const { localHash, loadLocalHash } = useLocalImageHash();
  const { latestImageHash, latestImageUrl, isFetching, error, loadLatestHash } =
    useLatestImageHash();

  const needsImageUpdate =
    latestImageHash !== undefined && localHash !== latestImageHash;

  return {
    latestImageHash,
    latestImageUrl,
    needsImageUpdate,
    isFetching,
    error,
    loadLatestHash,
    loadLocalHash,
  };
}
