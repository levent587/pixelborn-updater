import { getLatestFileInfoFromDrive } from "./get-latest-from-source";
import { downloadFromSource } from "./download-from-source";
import {
  createReleaseAndUploadAsset,
  getLatestReleaseVersion,
} from "./github-releases";
import fs from "fs";

let _latestVersion: string | null = null;
let _isMirroring = false;
const WEBHOOK_URL = process.env.WEBHOOK_URL!;

export async function getLatestVersion() {
  if (_latestVersion) {
    return _latestVersion;
  }
  const latestReleaseVersion = await getLatestReleaseVersion();
  if (latestReleaseVersion) {
    _latestVersion = latestReleaseVersion;
  }
  return _latestVersion;
}

async function onNewVersion(version: string) {
  console.log("New version detected:", version);
  await fetch(WEBHOOK_URL, {
    method: "POST",
    body: JSON.stringify({
      content: `New version detected: ${version}`,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export async function mirror() {
  if (_isMirroring) {
    console.log("❌ Already mirroring, skipping...");
    return;
  }
  _isMirroring = true;
  try {
    const fileInfo = await getLatestFileInfoFromDrive();
    const latestVersion = await getLatestVersion();
    if (fileInfo.version === latestVersion) {
      _isMirroring = false;
      return;
    }
    await onNewVersion(fileInfo.version);
    console.log("🔄 Downloading latest version from source...");
    await downloadFromSource(fileInfo.fileId, fileInfo.filename);
    console.log("✅ Download complete.");
    console.log("🔄 Creating release...");
    await createReleaseAndUploadAsset(fileInfo.version, fileInfo.filename);
    console.log("✅ Release created.");
    _latestVersion = fileInfo.version;
    console.log("🔄 Deleting downloaded file...");
    await fs.promises.unlink(fileInfo.filename);
    console.log("✅ File deleted.");
    console.log("🔄 Mirroring complete.");
  } catch (error) {
    console.error("❌ Error mirroring:", error);
  } finally {
    _isMirroring = false;
  }
}
