import { cn } from "@/lib/utils";
import {
  AlertCircle,
  CheckCircle,
  Download,
  GamepadIcon,
  Loader2,
} from "lucide-react";

export type PatchState =
  | "idle"
  | "checking"
  | "downloading-game"
  | "extracting-game"
  | "downloading-images"
  | "extracting-images"
  | "get-game-version-error"
  | "get-image-version-error"
  | "patch-error"
  | "complete";

export function GameStatusIcon({ patchState }: { patchState: PatchState }) {
  const getStatusIcon = () => {
    switch (patchState) {
      case "checking":
        return (
          <AlertCircle className="w-5 h-5 animate-pulse text-yellow-500" />
        );
      case "downloading-game":
      case "downloading-images":
        return <Download className="w-5 h-5 animate-bounce text-blue-500" />;
      case "complete":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "get-game-version-error":
      case "get-image-version-error":
      case "patch-error":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "extracting-game":
      case "extracting-images":
        return <Loader2 className="w-5 h-5 animate-spin text-yellow-500" />;
      default:
        return <GamepadIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  return getStatusIcon();
}

export function GameStatusText({ patchState }: { patchState: PatchState }) {
  const patchStateMap: Record<PatchState, string> = {
    checking: "Checking for updates...",
    "downloading-game": "Downloading game files...",
    "extracting-game": "Extracting game files...",
    "downloading-images": "Downloading Card Images...",
    "extracting-images": "Extracting Card Images...",
    complete: "Update complete!",
    idle: "Ready to play",
    "get-game-version-error": "Error fetching game version",
    "get-image-version-error": "Error fetching image version",
    "patch-error": "Error updating game",
  };

  const isError =
    patchState === "get-game-version-error" ||
    patchState === "get-image-version-error" ||
    patchState === "patch-error";

  return (
    <p className={cn("text-sm", isError ? "text-red-500" : "text-slate-400")}>
      {patchStateMap[patchState]}
    </p>
  );
}
