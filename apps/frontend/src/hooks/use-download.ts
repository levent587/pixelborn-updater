import { useRef, useState } from "react";

const UI_UPDATE_INTERVAL = 500;

export function useDownload() {
  const [currentProgress, setCurrentProgress] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0); // Bytes per second
  const [currentEta, setCurrentEta] = useState(0); // Seconds
  const [currentBytes, setCurrentBytes] = useState(0); // Bytes
  const [totalBytes, setTotalBytes] = useState(0); // Bytes

  const lastUpdateRef = useRef({ time: 0, bytes: 0 });

  const downloadFile = async (url: string) => {
    setCurrentProgress(0);
    setCurrentSpeed(0);
    setCurrentEta(0);
    setCurrentBytes(0);
    setTotalBytes(0);
    lastUpdateRef.current = { time: Date.now(), bytes: 0 };

    const filePath = await window.electronAPI.downloadFile(
      url,
      (current: number, total: number) => {
        const now = Date.now();
        const timeSinceLastUpdate = now - lastUpdateRef.current.time;

        setCurrentProgress(total > 0 ? (current / total) * 100 : 0);

        if (timeSinceLastUpdate > UI_UPDATE_INTERVAL) {
          const bytesSinceLastUpdate = current - lastUpdateRef.current.bytes;
          const speed = (bytesSinceLastUpdate / timeSinceLastUpdate) * 1000; // Bytes/sec

          const remainingBytes = total - current;
          const eta = speed > 0 ? remainingBytes / speed : 0;
          setCurrentSpeed(speed);
          setCurrentEta(eta);
          setCurrentBytes(current);
          setTotalBytes(total);
          lastUpdateRef.current = { time: now, bytes: current };
        }
      }
    );
    setCurrentProgress(100);
    setCurrentSpeed(0);
    setCurrentEta(0);
    setCurrentBytes(totalBytes);
    setTotalBytes(totalBytes);

    return filePath;
  };

  return {
    downloadFile,
    currentProgress,
    currentSpeed,
    currentEta,
    currentBytes,
    totalBytes,
  };
}
