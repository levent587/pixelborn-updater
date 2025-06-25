import { z } from "zod";

export const LanguageCodeSchema = z.enum(["en", "fr", "de", "es", "it", "jp"]);

export type LanguageCode = z.infer<typeof LanguageCodeSchema>;

export const PatcherConfigSchema = z.object({
  version: z.string(),
  executablePath: z.string().nullable(),
  imageZipHash: z.string().nullable(),
  cardImageLanguage: LanguageCodeSchema,
  autoLaunch: z.boolean(),
  autoLaunchDelay: z.number().min(1000).max(10000),
});

export type PatcherConfig = z.infer<typeof PatcherConfigSchema>;

export type RemoteInfo = {
  version: string;
  url: string;
};

export type ImageZipInfo = {
  hash: string;
  downloadUrl: string;
};
