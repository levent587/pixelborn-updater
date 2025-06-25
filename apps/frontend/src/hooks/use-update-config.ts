import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { PatcherConfig } from "@pixelborn-updater/types";

export function useUpdateConfig() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (config: PatcherConfig) =>
      window.electronAPI.saveConfig(config),
    onSuccess: (_, variables) => {
      // Update the cache with the new config
      queryClient.setQueryData(["config"], variables);
      queryClient.invalidateQueries({ queryKey: ["config"] });
    },
  });
}
