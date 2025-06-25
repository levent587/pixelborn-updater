import { Play, Rocket } from "lucide-react";
import { CardContent, CardHeader, CardTitle } from "./ui/card";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { AutoLaunchCheckbox } from "./auto-launch-checkbox";
import { useAutoLaunch } from "@/hooks/use-auto-launch";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { PatchState } from "./game-status";
import { launchGame } from "@/lib/launch-game";

type LaunchCardProps = {
  currentVersion: string;
  isChecking: boolean;
  patchState: PatchState;
};

export function useLaunchCardLogic({
  isChecking,
  patchState,
}: {
  isChecking: boolean;
  patchState: PatchState;
}) {
  const { isAutoLaunchEnabled, autoLaunchDelay } = useAutoLaunch();
  const [countdown, setCountdown] = useState(autoLaunchDelay);

  const launchEnabled = !isChecking && isAutoLaunchEnabled;

  useEffect(() => {
    if (!launchEnabled) {
      setCountdown(autoLaunchDelay);
      return;
    }

    if (countdown <= 0) {
      launchGame();
      return;
    }

    const timerId = setInterval(() => {
      setCountdown((prev) => prev - 1000);
    }, 1000);

    return () => clearInterval(timerId);
  }, [launchEnabled, countdown, autoLaunchDelay]);

  const getText = () => {
    if (
      patchState === "get-game-version-error" ||
      patchState === "get-image-version-error"
    ) {
      return "Error during update";
    }
    if (patchState === "complete") {
      return "Game is up to date and ready to play!";
    }

    return "In Progress...";
  };

  return { launchEnabled, countdown, getText };
}

export function LaunchCardContent({
  currentVersion,
  isChecking,
  patchState,
}: LaunchCardProps) {
  const { launchEnabled, countdown, getText } = useLaunchCardLogic({
    isChecking,
    patchState,
  });

  return (
    <>
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-slate-200 flex items-center gap-2 text-base">
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{
              duration: 1.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          >
            <Rocket className="w-4 h-4 text-green-500" />
          </motion.div>
          Ready to Launch
        </CardTitle>
        <AutoLaunchCheckbox />
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-300 text-sm">{getText()}</p>
            <p className="text-slate-500 text-xs">Version {currentVersion}</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              disabled={isChecking}
              onClick={launchGame}
              className={cn(
                "h-10 transition-colors",
                launchEnabled
                  ? "bg-orange-500 hover:bg-orange-600 text-white "
                  : "bg-green-600 hover:bg-green-700 text-white"
              )}
            >
              <Play className="w-4 h-4 mr-2" />
              <p className="min-w-28">
                {launchEnabled
                  ? `Launching in ${countdown / 1000}s`
                  : "Launch Game"}
              </p>
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </>
  );
}
