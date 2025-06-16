export type PatcherConfig = {
  version: string;
  executablePath: string | null;
  imageZipHash: string | null;
};

export type RemoteInfo = {
  version: string;
  url: string;
};
