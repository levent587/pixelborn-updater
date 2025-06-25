import { CardContent, CardHeader, CardTitle } from "./ui/card";
import { AlertTriangle } from "lucide-react";
import { RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { launchGame } from "@/lib/launch-game";
import { Play } from "lucide-react";

export function ErrorCardContent({
  localVersion,
  onRetry,
}: {
  localVersion: string;
  onRetry: () => void;
}) {
  return (
    <>
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-slate-200 flex items-center gap-2 text-base">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          Patch Error
        </CardTitle>
        <button onClick={onRetry} className="hover:bg-slate-700 rounded-md p-2">
          <RotateCcw className="w-5 h-5 text-red-500" />
        </button>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-slate-300 text-sm">
              An error occurred during patching.
              <br />
              You can try again or launch the game with your current version.
            </p>
            <p className="text-slate-500 text-xs">Version {localVersion}</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={() => {
                launchGame();
              }}
              className={cn(
                "h-10 transition-colors",
                "bg-green-600 hover:bg-green-700 text-white "
              )}
            >
              <Play className="w-4 h-4 mr-2" />
              Launch Game
            </Button>
          </motion.div>
        </div>
      </CardContent>
    </>
  );
}
