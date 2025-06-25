import { Progress } from "./ui/progress";

export function DownloadProgress({
  currentSpeed,
  currentEta,
  currentProgress,
  currentBytes,
  totalBytes,
}: {
  currentSpeed: number;
  currentEta: number;
  currentProgress: number;
  currentBytes: number;
  totalBytes: number;
}) {
  const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond === 0) return "0 B/s";
    const units = ["B/s", "KB/s", "MB/s", "GB/s"];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(1024));
    return `${(bytesPerSecond / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
  };

  const formatTime = (seconds: number) => {
    if (seconds === 0) return "0s";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);

    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${secs}s`;
    return `${secs}s`;
  };

  return (
    <>
      <Progress value={currentProgress} className="h-2" />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{formatSpeed(currentSpeed)}</span>
        <span>
          {formatBytes(currentBytes)} / {formatBytes(totalBytes)}
        </span>
        <span>ETA: {formatTime(currentEta)}</span>
      </div>
    </>
  );
}
