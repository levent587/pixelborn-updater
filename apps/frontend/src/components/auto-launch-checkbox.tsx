import { Checkbox } from "./ui/checkbox";
import { useAutoLaunch } from "@/hooks/use-auto-launch";

export function AutoLaunchCheckbox() {
  const { isAutoLaunchEnabled, handleAutoLaunch } = useAutoLaunch();
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id="auto-launch-progress"
        checked={isAutoLaunchEnabled}
        onCheckedChange={(checked) =>
          handleAutoLaunch(checked === "indeterminate" ? false : checked)
        }
        className="border-slate-600 data-[state=checked]:bg-purple-600"
      />
      <label
        htmlFor="auto-launch-progress"
        className="text-xs font-medium text-slate-300 leading-none"
      >
        Auto-launch
      </label>
    </div>
  );
}
