import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DownloadCloud,
  Globe,
  AlertTriangle,
  RotateCcw,
  Play,
} from "lucide-react";
import { useGameVersion } from "@/hooks/use-game-version";
import {
  LocalVersionBadge,
  LatestVersionBadge,
} from "@/components/version-badges";
import { Header } from "@/components/header";
import {
  GameStatusIcon,
  GameStatusText,
  type PatchState,
} from "@/components/game-status";
import { LANGUAGE_MAP, useLanguage } from "@/hooks/use-language";
import { useCardImageVersion } from "@/hooks/use-card-image-version";
import { cn } from "@/lib/utils";
import { useUpdateGame } from "@/hooks/use-update-game";
import { useEffect } from "react";
import { DownloadProgress } from "@/components/download-progress";
import { useUpdateImages } from "@/hooks/use-update-images";
import { LaunchCard } from "@/components/launch-card";
import { AutoLaunchCheckbox } from "@/components/auto-launch-checkbox";
import { Button } from "@/components/ui/button";
import { launchGame } from "@/lib/launch-game";
import { RouterErrorComponent } from "@/components/error-boundary";
import { useHandlePatcherUpdate } from "@/hooks/use-handle-patcher-update";

export const Route = createFileRoute("/")({
  component: App,
  errorComponent: RouterErrorComponent,
});

function App() {
  useHandlePatcherUpdate();

  const {
    error: gameError,
    latestVersion,
    localVersion,
    latestVersionUrl,
    needsGameUpdate,
    isFetching: isLatestVersionLoading,
    loadLatestVersion,
    loadLocalVersion,
  } = useGameVersion();

  const {
    error: imageError,
    needsImageUpdate,
    isFetching: isLatestImageHashLoading,
    loadLatestHash,
    loadLocalHash,
    latestImageUrl,
    latestImageHash,
  } = useCardImageVersion();

  const {
    startUpdate: startUpdateGame,
    gameUpdateState,
    currentProgress: gameProgress,
    currentSpeed: gameSpeed,
    currentEta: gameEta,
    currentBytes: gameCurrentBytes,
    totalBytes: gameTotalBytes,
  } = useUpdateGame();

  const {
    startUpdate: startUpdateImages,
    imageUpdateState,
    currentProgress: imageProgress,
    currentSpeed: imageSpeed,
    currentEta: imageEta,
    currentBytes: imageCurrentBytes,
    totalBytes: imageTotalBytes,
  } = useUpdateImages();

  const isUpdatingGame =
    gameUpdateState !== "idle" && gameUpdateState !== "error";
  const isUpdatingImages =
    imageUpdateState !== "idle" && imageUpdateState !== "error";
  const isUpdating = isUpdatingGame || isUpdatingImages;
  const isChecking = isLatestVersionLoading || isLatestImageHashLoading;

  const currentProgress = isUpdatingGame ? gameProgress : imageProgress;
  const currentSpeed = isUpdatingGame ? gameSpeed : imageSpeed;
  const currentEta = isUpdatingGame ? gameEta : imageEta;
  const currentBytes = isUpdatingGame ? gameCurrentBytes : imageCurrentBytes;
  const totalBytes = isUpdatingGame ? gameTotalBytes : imageTotalBytes;

  const getPatchState = (): PatchState => {
    if (isChecking) {
      return "checking";
    }
    if (gameUpdateState === "downloading") {
      return "downloading-game";
    }
    if (gameUpdateState === "unzipping") {
      return "extracting-game";
    }
    if (imageUpdateState === "downloading") {
      return "downloading-images";
    }
    if (imageUpdateState === "unzipping") {
      return "extracting-images";
    }
    if (gameError) {
      return "get-game-version-error";
    }
    if (imageError) {
      return "get-image-version-error";
    }
    if (gameUpdateState === "error" || imageUpdateState === "error") {
      return "patch-error";
    }
    return "complete";
  };

  const { currentLanguage, changeLanguage, availableLanguages } = useLanguage();

  useEffect(() => {
    if (isChecking) return;
    if (isUpdating) return;

    // Handle game update
    if (!latestVersionUrl || !latestVersion) {
      // TODO show error
      return;
    }
    if (needsGameUpdate) {
      startUpdateGame(latestVersionUrl, latestVersion);
      return;
    }

    // Handle image update
    if (!latestImageUrl || !latestImageHash) {
      // TODO show error
      return;
    }

    if (needsImageUpdate) {
      console.log("starting image update");
      startUpdateImages(latestImageUrl, latestImageHash);
      return;
    }
  }, [needsGameUpdate, needsImageUpdate, isChecking]);

  return (
    <div className="h-screen p-3 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]">
      <div className="max-w-3xl mx-auto gap-4 h-full flex flex-col">
        <Header />
        {/* Status and Language Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2 flex items-center justify-between min-h-12">
              <CardTitle className="text-slate-200 flex items-center gap-2 text-base">
                <GameStatusIcon patchState={getPatchState()} />
                Game Status
              </CardTitle>
              <button
                className={cn(
                  "p-2 rounded-md hover:bg-slate-700",
                  getPatchState() === "checking" && "animate-pulse"
                )}
                onClick={() => {
                  loadLocalVersion();
                  loadLatestVersion();
                  loadLatestHash();
                  loadLocalHash();
                }}
              >
                <DownloadCloud className="w-5 h-5 text-slate-200" />
              </button>
            </CardHeader>
            <CardContent className="space-y-2">
              <GameStatusText patchState={getPatchState()} />
              <div className="flex min-h-12 items-center gap-2">
                <LocalVersionBadge version={localVersion} />
                {needsGameUpdate && (
                  <LatestVersionBadge
                    latestVersion={latestVersion}
                    isLoading={isLatestVersionLoading}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Language Selection Card */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2 flex items-center justify-between  min-h-12">
              <CardTitle className="text-slate-200 flex items-center gap-2 text-base">
                <Globe className="w-5 h-5" />
                Card Images
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-sm text-slate-400">
                Language for card images:
              </p>
              <div className="min-h-12 flex items-center">
                <Select value={currentLanguage} onValueChange={changeLanguage}>
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-slate-200 h-8 min-w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 ">
                    {availableLanguages.map((lang) => (
                      <SelectItem
                        key={lang}
                        value={lang}
                        className="text-slate-200 focus:bg-slate-700 focus:text-slate-200 min-w-36"
                      >
                        <span className="flex items-center gap-2">
                          {/* Need title to make it work */}
                          {LANGUAGE_MAP[lang].flag({ title: "" })}
                          <span>{LANGUAGE_MAP[lang].name}</span>
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Progress/Launch Card Container */}
        <div className="relative min-h-44 overflow-hidden">
          <AnimatePresence mode="wait">
            {isUpdating && (
              <motion.div
                key="progress-card"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Card className="h-full bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-slate-200 flex items-center gap-2 text-base">
                        Download Progress
                      </CardTitle>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="flex items-center space-x-2"
                      >
                        <AutoLaunchCheckbox />
                      </motion.div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <motion.span
                          key={getPatchState()}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-slate-300"
                        >
                          <GameStatusText patchState={getPatchState()} />
                        </motion.span>
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
                </Card>
              </motion.div>
            )}

            {getPatchState() !== "patch-error" &&
              !isUpdating &&
              !isChecking &&
              latestVersion !== undefined && (
                <LaunchCard
                  currentVersion={localVersion}
                  isChecking={isChecking}
                  patchState={getPatchState()}
                />
              )}

            {getPatchState() === "patch-error" && (
              <motion.div
                key="error-card"
                initial={{ opacity: 0, x: -100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute inset-0"
              >
                <Card className="h-full bg-slate-800/50 border-red-500/20">
                  <CardHeader className="pb-2 flex items-center justify-between">
                    <CardTitle className="text-slate-200 flex items-center gap-2 text-base">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      Patch Error
                    </CardTitle>
                    <button
                      onClick={() => {
                        loadLocalVersion();
                        loadLatestVersion();
                        loadLatestHash();
                        loadLocalHash();
                      }}
                      className="hover:bg-slate-700 rounded-md p-2"
                    >
                      <RotateCcw className="w-5 h-5 text-red-500" />
                    </button>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0 }}
                        className="space-y-1"
                      >
                        <p className="text-slate-300 text-sm">
                          An error occurred during patching.
                          <br />
                          You can try again or launch the game with your current
                          version.
                        </p>
                        <p className="text-slate-500 text-xs">
                          Version {localVersion}
                        </p>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
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
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-auto text-xs text-slate-300 text-center"
        >
          <p>© 2025 Community Project. Not affiliated with Pixelborn.</p>
        </motion.div>
      </div>
    </div>
  );
}
