import path from "node:path";

import AdmZip from "adm-zip";
import cliProgress from "cli-progress";
import { spawn } from "node:child_process";
import process from "node:process";
import type { PatcherConfig, RemoteInfo } from "./types";

const CONFIG_FILE = "updater.config.json";

const INSTALL_DIR = path.dirname(process.execPath);
const CONFIG_DIR = INSTALL_DIR;

const API_URL = process.env.API_URL || "http://localhost:3000";

const GAME_EXECUTABLE = "Pixelborn.exe";

async function getRemoteVersionInfo(): Promise<RemoteInfo> {
  try {
    const response = await fetch(`${API_URL}/api/version`);
    if (!response.ok) {
      throw new Error(
        `Status Code is not OK: ${response.status} ${response.statusText}`
      );
    }
    return await response.json();
  } catch (error) {
    throw new Error(`❌ Error fetching remote version info: ${error}`);
  }
}

async function getConfig(): Promise<PatcherConfig> {
  const configFile = Bun.file(path.join(CONFIG_DIR, CONFIG_FILE));
  if (await configFile.exists()) {
    return await configFile.json();
  }
  return { version: "0.0.0", executablePath: null };
}

async function saveConfig(config: PatcherConfig): Promise<void> {
  await Bun.write(
    path.join(CONFIG_DIR, CONFIG_FILE),
    JSON.stringify(config, null, 2)
  );
}

async function downloadAndUnzip(url: string): Promise<void> {
  console.log("🌐 Downloading new version...");

  const response = await fetch(url);

  if (!response.ok || !response.body) {
    throw new Error(`Final download failed: ${response.statusText}`);
  }

  const totalSize = Number(response.headers.get("content-length") || 0);
  if (totalSize < 10000) {
    throw new Error(
      `Download is too small (${totalSize} bytes). Authentication failed.`
    );
  }

  const progressBar = new cliProgress.SingleBar(
    {},
    cliProgress.Presets.shades_classic
  );
  progressBar.start(totalSize, 0);

  let downloadedSize = 0;
  const chunks: Uint8Array[] = [];
  for await (const chunk of response.body as any) {
    chunks.push(chunk);
    downloadedSize += chunk.length;
    progressBar.update(downloadedSize);
  }

  progressBar.stop();
  console.log("📦 Unzipping files...");

  const buffer = Buffer.concat(chunks);
  const zip = new AdmZip(buffer);
  zip.extractAllTo(INSTALL_DIR, true);

  console.log("✅ Unzip complete.");
}

function startGame(executablePath: string): void {
  console.log(`🚀 Starting game and exiting updater...`);

  const child = spawn(executablePath, [], {
    detached: true,
    stdio: "ignore",
  });

  child.unref();
}
async function main() {
  console.log("--- Pixelborn Updater ---");

  const remoteInfo = await getRemoteVersionInfo();

  const localConfig = await getConfig();

  console.log(`- Local version:  ${localConfig.version}`);
  console.log(`- Remote version: ${remoteInfo.version}`);
  if (
    localConfig.version === remoteInfo.version &&
    localConfig.executablePath &&
    (await Bun.file(localConfig.executablePath).exists())
  ) {
    console.log("✅ Game is up to date.");
    startGame(localConfig.executablePath);
  } else {
    console.log("🔄 New version available or game not found. Updating...");
    await downloadAndUnzip(remoteInfo.url);

    const newExecutablePath = path.join(INSTALL_DIR, GAME_EXECUTABLE);
    const newConfig: PatcherConfig = {
      version: remoteInfo.version,
      executablePath: newExecutablePath,
    };

    await saveConfig(newConfig);
    console.log("✨ Update complete.");
    startGame(newExecutablePath);
  }
}

main().catch((err) => {
  console.error("\nAn unexpected error occurred:", err.message);
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});
