import { Hono } from "hono";
import { mirror } from "@pixelborn-updater/mirror";
import { getLatestReleaseAssetInfo } from "@pixelborn-updater/mirror";
import type { RemoteInfo } from "@pixelborn-updater/types";

const app = new Hono();

setInterval(
  async () => {
    await mirror().catch((error) => {
      console.error("❌ Error:", error);
    });
  },
  1000 * 60 * 1
); // every 1 minute

app.get("/api/version", async () => {
  try {
    console.log("/api/version called");
    const assetInfo: RemoteInfo | null = await getLatestReleaseAssetInfo();
    if (!assetInfo) {
      return new Response(JSON.stringify({ error: "No asset info found" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify(assetInfo), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get remote version info." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

app.get("/api/images/en/hash", async () => {
  console.log("/api/images/en/hash called");
  const IDENTIFIER = "PBImg";
  const EN_KEY = "Key/EN/S001.zip";

  try {
    const response = await fetch(`https://archive.org/metadata/${IDENTIFIER}/`);
    if (!response.ok) {
      throw new Error(
        `Status Code is not OK: ${response.status} ${response.statusText}`
      );
    }

    const metadata = await response.json();
    const fileMetadata = metadata.files.find(
      (file: any) => file.name === EN_KEY
    );
    if (!fileMetadata) {
      throw new Error("❌ File metadata not found");
    }
    return new Response(
      JSON.stringify({
        hash: fileMetadata.md5,
        downloadUrl: `https://archive.org/download/${IDENTIFIER}/${EN_KEY}`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get image zip hash." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

app.get("/api/images/en-alt/hash", async () => {
  console.log("/api/images/en-alt/hash called");
  const IDENTIFIER = "images-final";
  const EN_ALT_KEY = "pixelbornaltart.zip";

  try {
    const response = await fetch(`https://archive.org/metadata/${IDENTIFIER}/`);
    if (!response.ok) {
      throw new Error(
        `Status Code is not OK: ${response.status} ${response.statusText}`
      );
    }

    const metadata = await response.json();
    const fileMetadata = metadata.files.find(
      (file: any) => file.name === EN_ALT_KEY
    );
    if (!fileMetadata) {
      throw new Error("❌ File metadata not found");
    }
    return new Response(
      JSON.stringify({
        hash: fileMetadata.md5,
        downloadUrl: `https://archive.org/download/${IDENTIFIER}/${EN_ALT_KEY}`,
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to get image zip hash." }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});

export default app;
