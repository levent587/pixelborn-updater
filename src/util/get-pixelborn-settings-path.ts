import path from "path";
import os from "os";

export function getPixelbornSettingsPath() {
  // This function is only relevant on Windows.
  if (os.platform() !== "win32") {
    return null;
  }

  // %LOCALAPPDATA% resolves to C:\Users\<user>\AppData\Local
  const localAppData = process.env.LOCALAPPDATA;

  if (!localAppData) {
    return null;
  }

  return path.join(
    localAppData,
    "..",
    "LocalLow",
    "Rebellious Software",
    "Pixelborn"
  );
}
