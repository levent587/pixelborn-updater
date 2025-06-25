import { createContext, useContext } from "react";
import type { PatcherConfig } from "@pixelborn-updater/types";

export const ConfigContext = createContext<PatcherConfig | null>(null);

export function useConfigContext() {
  const context = useContext(ConfigContext);
  if (context === null) {
    throw new Error("useConfigContext must be used within a ConfigProvider");
  }
  return context;
}
