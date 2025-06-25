import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";

function BadgeSkeleton() {
  return <Skeleton className="w-6 h-3" />;
}

export function LocalVersionBadge({ version }: { version: string }) {
  return (
    <Badge
      variant="outline"
      className="text-slate-300 border-slate-600 text-xs min-w-24 text-start"
    >
      Current: {version}
    </Badge>
  );
}

export function LatestVersionBadge({
  latestVersion,
  isLoading,
}: {
  latestVersion: string | undefined;
  isLoading: boolean;
}) {
  return (
    <Badge className="bg-orange-500/90 hover:bg-orange-600/90 text-xs">
      Latest: {isLoading ? <BadgeSkeleton /> : latestVersion}
    </Badge>
  );
}
