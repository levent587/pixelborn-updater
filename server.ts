import { Hono } from "hono";
import { mirror } from "./src/mirror";
import { getLatestReleaseAssetInfo } from "./src/mirror/github-releases";
import type { RemoteInfo } from "./types";

const app = new Hono();

setInterval(async () => {
  await mirror().catch((error) => {
    console.error("❌ Error:", error);
  });
}, 1000 * 60 * 1); // every 1 minute

app.get("/api/version", async () => {
  try {
    const assetInfo: RemoteInfo | null = await getLatestReleaseAssetInfo();
    if (!assetInfo) {
      return new Response(JSON.stringify({ error: "No asset info found" }), {
        status: 500,
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
      }
    );
  }
});

export default app;
