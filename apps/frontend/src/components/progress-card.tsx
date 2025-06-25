import { CardContent, CardHeader, CardTitle } from "./ui/card";
import { AutoLaunchCheckbox } from "./auto-launch-checkbox";
import { GameStatusText } from "./game-status";
import { DownloadProgress } from "./download-progress";
import { motion } from "framer-motion";
import type { PatchState } from "./game-status";

export function ProgressCardContent({
  patchState,
  currentProgress,
  currentSpeed,
  currentEta,
  currentBytes,
  totalBytes,
}: {
  patchState: PatchState;
  currentProgress: number;
  currentSpeed: number;
  currentEta: number;
  currentBytes: number;
  totalBytes: number;
}) {
  return (
    <>
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-slate-200 flex items-center gap-2 text-base">
          Download Progress
        </CardTitle>
        <AutoLaunchCheckbox />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-slate-300">
              <GameStatusText patchState={patchState} />
            </span>
            <motion.span
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 0.5,
                repeat: Number.POSITIVE_INFINITY,
              }}
              className="text-slate-400"
            >
              {Math.round(currentProgress)}%
            </motion.span>
          </div>
          <DownloadProgress
            currentSpeed={currentSpeed}
            currentEta={currentEta}
            currentProgress={currentProgress}
            currentBytes={currentBytes}
            totalBytes={totalBytes}
          />
        </div>
      </CardContent>
    </>
  );
}
