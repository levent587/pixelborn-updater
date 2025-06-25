import { useEffect } from "react";
import { toast } from "sonner";

export function useHandlePatcherUpdate() {
  useEffect(() => {
    window.electronAPI.onUpdateAvailable((version) => {
      const id = toast.info(`Update available: ${version}`, {
        action: {
          label: "Download",
          onClick: () => {
            toast.dismiss(id);
            toast.success("Downloading update...", { duration: Infinity });
            window.electronAPI.downloadPatcherUpdate();
          },
        },
        duration: Infinity,
      });
    });

    window.electronAPI.onUpdateDownloaded(() => {
      toast.dismiss();
      toast.success("Update downloaded", {
        action: {
          label: "Install",
          onClick: () => {
            window.electronAPI.quitAndInstall();
          },
        },
        duration: Infinity,
      });
    });
  }, []);
}
