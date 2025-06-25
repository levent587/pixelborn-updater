import { useQueryClient } from "@tanstack/react-query";
import type { LanguageCode, PatcherConfig } from "@pixelborn-updater/types";
import { useUpdateConfig } from "./use-update-config";
import { useConfigContext } from "@/contexts/config-context";
import {
  DE,
  ES,
  FR,
  IT,
  JP,
  US,
  type FlagComponent,
} from "country-flag-icons/react/3x2";
import { toast } from "sonner";

export const LANGUAGE_MAP: Record<
  LanguageCode,
  { name: string; flag: FlagComponent; enabled: boolean }
> = {
  en: { name: "English", flag: US, enabled: true },
  fr: { name: "French", flag: FR, enabled: false },
  de: { name: "German", flag: DE, enabled: false },
  es: { name: "Spanish", flag: ES, enabled: false },
  it: { name: "Italian", flag: IT, enabled: false },
  jp: { name: "Japanese", flag: JP, enabled: false },
};

export function useLanguage() {
  const config = useConfigContext();
  const updateConfig = useUpdateConfig();
  const queryClient = useQueryClient();

  const changeLanguage = async (newLanguage: LanguageCode) => {
    const updatedConfig: PatcherConfig = {
      ...config,
      cardImageLanguage: newLanguage,
    };

    try {
      await updateConfig.mutateAsync(updatedConfig);
      queryClient.invalidateQueries({ queryKey: ["image-hash"] });
    } catch (error) {
      toast.error("Error saving new language in config");
    }
  };

  return {
    availableLanguages: Object.keys(LANGUAGE_MAP).filter(
      (lang) => LANGUAGE_MAP[lang as LanguageCode].enabled
    ) as LanguageCode[],
    currentLanguage: config.cardImageLanguage,
    currentLanguageName: LANGUAGE_MAP[config.cardImageLanguage].name,
    changeLanguage,
  };
}
