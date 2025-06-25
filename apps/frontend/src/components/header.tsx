import { Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";

export function Header() {
  return (
    <div className="text-center space-y-1 relative">
      <h1 className="text-3xl font-bold text-orange-400">Pixelborn</h1>

      <p className="text-slate-300 text-sm">
        Unofficial Community Patcher & Launcher
      </p>

      {/* Disclaimer Icon */}
      <Dialog>
        <DialogTrigger asChild>
          <button className="absolute top-0 left-0 p-2 rounded-md text-slate-200 hover:bg-slate-700">
            <Info className="w-5 h-5" />
          </button>
        </DialogTrigger>
        <DialogContent className="bg-slate-800 border-slate-700 text-slate-200">
          <DialogHeader>
            <DialogTitle className="text-slate-200">Disclaimer</DialogTitle>
            <DialogDescription className="text-slate-400">
              This project is not endorsed by Pixelborn. This is a
              community-created patcher and launcher developed independently.
              Use at your own discretion.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
