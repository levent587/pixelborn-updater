import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import type { ErrorComponentProps } from "@tanstack/react-router";

interface ErrorBoundaryProps {
  error: unknown;
  reset?: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  const handleReload = () => {
    if (reset) {
      reset();
    } else {
      window.location.reload();
    }
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    if (error && typeof error === "object" && "message" in error) {
      return String(error.message);
    }
    return "An unexpected error occurred";
  };

  const getErrorStack = (error: unknown): string | null => {
    if (error instanceof Error && error.stack) {
      return error.stack;
    }
    if (
      error &&
      typeof error === "object" &&
      "stack" in error &&
      typeof error.stack === "string"
    ) {
      return error.stack;
    }
    return null;
  };

  const errorMessage = getErrorMessage(error);
  const errorStack = getErrorStack(error);
  const [showStack, setShowStack] = useState(false);

  return (
    <div className="h-screen p-3 bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="max-w-md w-full"
      >
        <Card className="bg-slate-800/50 border-red-500/20 shadow-2xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-slate-200 flex items-center gap-3 text-xl">
              <motion.div
                animate={{ rotate: [0, -10, 10, -5, 5, 0] }}
                transition={{ duration: 0.6, ease: "easeInOut" }}
              >
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </motion.div>
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <p className="text-slate-300 text-sm leading-relaxed">
                We encountered an unexpected error while loading the
                application. This might be a temporary issue.
              </p>

              <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700">
                <p className="text-red-400 text-xs font-mono break-words">
                  {errorMessage}
                </p>
              </div>

              {errorStack && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowStack(!showStack)}
                    className="h-auto p-1 text-slate-400 hover:text-slate-300 hover:bg-slate-700/50"
                  >
                    {showStack ? (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronRight className="w-3 h-3 mr-1" />
                    )}
                    <span className="text-xs">
                      {showStack ? "Hide" : "Show"} Stack Trace
                    </span>
                  </Button>
                  <AnimatePresence>
                    {showStack && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="bg-slate-950/50 rounded-lg p-3 border border-slate-600 max-h-40 overflow-y-auto"
                      >
                        <pre className="text-red-300 text-xs font-mono whitespace-pre-wrap break-words">
                          {errorStack}
                        </pre>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <p className="text-slate-400 text-xs">
                Try reloading the application. If the problem persists, please
                contact support.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-2"
            >
              <Button
                onClick={handleReload}
                className="w-full bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reload App
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

// TanStack Router specific error component
export function RouterErrorComponent({ error, reset }: ErrorComponentProps) {
  return <ErrorBoundary error={error} reset={reset} />;
}
