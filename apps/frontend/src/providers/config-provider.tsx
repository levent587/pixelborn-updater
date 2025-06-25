import { useSuspenseQuery } from "@tanstack/react-query";
import { ConfigContext } from "../contexts/config-context";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

const getConfig = () => window.electronAPI.getConfig();

function ConfigLoadingFallback() {
  return (
    <div className="h-screen p-3 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a]">
      <div className="max-w-3xl mx-auto gap-4 h-full flex flex-col items-center justify-center">
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.1s" }}
            ></div>
            <div
              className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            ></div>
          </div>
          <p className="text-slate-300 text-lg">Loading Application...</p>
          <Skeleton className="h-4 w-48 mx-auto bg-slate-700/50" />
        </div>
      </div>
    </div>
  );
}

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const { data: config } = useSuspenseQuery({
    queryKey: ["config"],
    queryFn: getConfig,
    staleTime: Infinity,
  });

  return (
    <Suspense fallback={<ConfigLoadingFallback />}>
      <ConfigContext.Provider value={config}>{children}</ConfigContext.Provider>
    </Suspense>
  );
}
