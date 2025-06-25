import { useConfigContext } from "@/contexts/config-context";
import { useUpdateConfig } from "./use-update-config";
import type { PatcherConfig } from "@pixelborn-updater/types";
import { toast } from "sonner";

export const useAutoLaunch = () => {
  const config = useConfigContext();
  const updateConfig = useUpdateConfig();

  const handleAutoLaunch = async (checked: boolean) => {
    const updatedConfig: PatcherConfig = {
      ...config,
      autoLaunch: checked,
    };
    try {
      await updateConfig.mutateAsync(updatedConfig);
    } catch (error) {
      toast.error("Error updating auto launch config");
    }
  };

  return {
    isAutoLaunchEnabled: config.autoLaunch,
    autoLaunchDelay: config.autoLaunchDelay,
    handleAutoLaunch,
  };
};
