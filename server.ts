import { Hono } from "hono";
import type { RemoteInfo } from "./types";

const app = new Hono();

const GDRIVE_API_KEY = process.env.GDRIVE_API_KEY || "";

const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID || "";

if (!GDRIVE_API_KEY || !GDRIVE_FOLDER_ID) {
  throw new Error("❌ GDRIVE_API_KEY and GDRIVE_FOLDER_ID must be set");
}

async function getRemoteFileInfoFromDrive(): Promise<RemoteInfo> {
  const apiEndpoint = new URL("https://www.googleapis.com/drive/v3/files");
  apiEndpoint.searchParams.set("key", GDRIVE_API_KEY);
  apiEndpoint.searchParams.set("q", `'${GDRIVE_FOLDER_ID}' in parents`);
  apiEndpoint.searchParams.set("fields", "files(id, name)");

  console.log("🔎 Checking Google Drive for the latest version...");
  const response = await fetch(apiEndpoint);
  if (!response.ok) {
    throw new Error(
      `❌ Google Drive API Error: ${response.status} ${response.statusText}`
    );
  }

  const data = (await response.json()) as {
    files: { id: string; name: string }[];
  };

  if (!data.files || data.files.length === 0) {
    throw new Error("❌ No files found in the Google Drive folder.");
  }

  if (data.files.length > 1) {
    console.warn("⚠️ Warning: Multiple files found. Using the first one.");
  }

  const file = data.files[0];
  let versionMatch = file.name.match(/_(\d+(?:\.\d+)*)\.zip$/);

  if (!versionMatch || !versionMatch[1]) {
    console.warn(
      `❌ Could not parse version from filename: ${file.name}. Using filename as version.`
    );
    versionMatch = [file.name];
  }

  return {
    version: versionMatch[1],
    url: `https://drive.google.com/uc?export=download&id=${file.id}`,
  };
}

app.get("/api/version", async () => {
  try {
    const versionInfo = await getRemoteFileInfoFromDrive();

    return new Response(JSON.stringify(versionInfo), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to get remote version info." }),
      {
        status: 500,
      }
    );
  }
});

export default app;
