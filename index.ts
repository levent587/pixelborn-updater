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

  const userAgent =
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36";

  const initialResponse = await fetch(url, {
    headers: { "User-Agent": userAgent },
  });

  if (!initialResponse.ok) {
    throw new Error(`Initial request failed: ${initialResponse.statusText}`);
  }

  const cookies = initialResponse.headers.getSetCookie();
  if (!cookies || cookies.length === 0) {
    throw new Error("Google Drive download cookie not found.");
  }

  const responseText = await initialResponse.text();

  // Extract url and params (needed for validation)

  const actionMatch = responseText.match(/action="([^"]+)"/);
  if (!actionMatch || !actionMatch[1]) {
    throw new Error("Could not find form action URL in HTML response.");
  }
  const formActionUrl = actionMatch[1].replace(/&amp;/g, "&");

  const inputs = [
    ...responseText.matchAll(
      /<input type="hidden" name="([^"]+)" value="([^"]*)"/g
    ),
  ];
  if (inputs.length === 0) {
    throw new Error("Could not find hidden input fields in HTML response.");
  }

  const params = new URLSearchParams();
  for (const input of inputs) {
    params.append(input[1], input[2]);
  }

  const finalDownloadUrl = `${formActionUrl}?${params.toString()}`;

  const response = await fetch(finalDownloadUrl, {
    headers: {
      "User-Agent": userAgent,
      Cookie: cookies.join("; "),
    },
  });

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
