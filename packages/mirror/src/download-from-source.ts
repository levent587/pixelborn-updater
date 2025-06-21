import { pipeline } from "stream/promises";
import { createWriteStream } from "fs";
import { Readable } from "stream";

const GDRIVE_API_KEY = process.env.GDRIVE_API_KEY || "";

const GDRIVE_FOLDER_ID = process.env.GDRIVE_FOLDER_ID || "";

if (!GDRIVE_API_KEY || !GDRIVE_FOLDER_ID) {
  throw new Error("❌ GDRIVE_API_KEY and GDRIVE_FOLDER_ID must be set");
}

export async function downloadFromSource(
  fileId: string,
  destinationPath: string
) {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?key=${GDRIVE_API_KEY}&alt=media`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Failed to fetch file: ${response.status} ${response.statusText}`
    );
  }

  if (!response.body) {
    throw new Error("Response body is null.");
  }

  const body = Readable.fromWeb(response.body as any);
  const fileStream = createWriteStream(destinationPath);

  await pipeline(body, fileStream);
}
