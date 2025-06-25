import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { PatcherConfig } from "@pixelborn-updater/types";
import { useConfigContext } from "@/contexts/config-context";
import { useUpdateConfig } from "./use-update-config";
import { ERROR_CODES } from "@/lib/error-codes";
import { toast } from "sonner";

export function useLocalGameVersion() {
  const config = useConfigContext();
  const updateConfig = useUpdateConfig();
  const queryClient = useQueryClient();

  const updateLocalVersion = async (version: string) => {
    const updatedConfig: PatcherConfig = {
      ...config,
      version,
    };

    try {
      await updateConfig.mutateAsync(updatedConfig);
    } catch (error) {
      toast.error("Error saving new game version in config");
    }
  };

  const loadLocalVersion = () => {
    queryClient.invalidateQueries({ queryKey: ["config"] });
  };

  return {
    localVersion: config.version,
    updateLocalVersion,
    loadLocalVersion,
  };
}

export function useLatestGameVersion() {
  const queryClient = useQueryClient();
  const { data, isFetching, error } = useQuery({
    queryKey: ["latest-version"],
    queryFn: window.electronAPI.getLatestGameVersion,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 3,
    meta: { errCode: ERROR_CODES.GET_LATEST_GAME_VERSION },
  });

  const loadLatestVersion = () => {
    queryClient.invalidateQueries({ queryKey: ["latest-version"] });
  };

  return {
    latestVersion: data?.version,
    latestVersionUrl: data?.url,
    loadLatestVersion,
    isFetching,
    error,
  };
}

export function useGameVersion() {
  const { localVersion, loadLocalVersion } = useLocalGameVersion();
  const {
    latestVersion,
    latestVersionUrl,
    isFetching,
    error,
    loadLatestVersion,
  } = useLatestGameVersion();
  const needsGameUpdate =
    latestVersion !== undefined && localVersion !== latestVersion;

  return {
    localVersion,
    latestVersion,
    latestVersionUrl,
    needsGameUpdate,
    isFetching,
    error,
    loadLatestVersion,
    loadLocalVersion,
  };
}
