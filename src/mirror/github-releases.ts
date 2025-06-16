import { Octokit } from "@octokit/rest";
import fs from "fs";
import path from "path";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN!;
const OWNER = process.env.GITHUB_REPO_OWNER!;
const REPO = process.env.GITHUB_REPO_NAME!;

if (!GITHUB_TOKEN) {
  throw new Error("GITHUB_TOKEN environment variable is not set.");
}

if (!OWNER) {
  throw new Error("GITHUB_REPO_OWNER environment variable is not set.");
}

if (!REPO) {
  throw new Error("GITHUB_REPO_NAME environment variable is not set.");
}

const octokit = new Octokit({ auth: GITHUB_TOKEN });

async function getLatestReleaseInfo() {
  try {
    const response = await octokit.repos.getLatestRelease({
      owner: OWNER,
      repo: REPO,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error getting latest release info:", error);
    return null;
  }
}

async function getReleases() {
  try {
    const response = await octokit.repos.listReleases({
      owner: OWNER,
      repo: REPO,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Error getting release info:", error);
    return null;
  }
}

export async function getLatestReleaseVersion() {
  const response = await getLatestReleaseInfo();
  return response?.tag_name;
}

export async function getLatestReleaseAssetInfo() {
  const response = await getLatestReleaseInfo();
  if (!response) return null;
  if (response.assets.length > 0) {
    // Our latest release has assets, so we can use it
    return {
      version: response.tag_name,
      url: response.assets[0].browser_download_url,
    };
  }

  // Our latest release has no assets, so we need to find the latest release with assets
  const releases = await getReleases();
  if (!releases || releases.length === 0) {
    console.error("❌ No releases found");
    return null;
  }

  // Find the latest release with assets
  const latestRelease = releases.find((release) => release.assets.length > 0);
  if (!latestRelease) {
    console.error("❌ No releases with assets found");
    return null;
  }

  return {
    version: latestRelease.tag_name,
    url: latestRelease.assets[0].browser_download_url,
  };
}

export async function createReleaseAndUploadAsset(
  tag: string,
  assetPath: string
) {
  if (!fs.existsSync(assetPath)) {
    throw new Error(`Asset not found at path: ${assetPath}`);
  }

  // Create release
  console.log(`Creating release for tag: ${tag}...`);
  const releaseResponse = await octokit.repos.createRelease({
    owner: OWNER,
    repo: REPO,
    tag_name: tag,
    name: `Release ${tag}`,
  });
  console.log(`✅ Release created: ${releaseResponse.data.html_url}`);

  // Upload asset
  console.log(`Uploading asset: ${assetPath}...`);
  const assetName = path.basename(assetPath);
  const assetData = fs.readFileSync(assetPath);
  const assetContentType = "application/zip";

  await octokit.repos.uploadReleaseAsset({
    owner: OWNER,
    repo: REPO,
    release_id: releaseResponse.data.id,
    name: assetName,
    data: assetData as any,
    headers: {
      "content-type": assetContentType,
    },
  });
  console.log("✅ Asset uploaded successfully!");
}
