import { Sun, Moon, Monitor, Sparkles, FolderLock, FileCheck2 } from "lucide-react";
import { Theme, User, UsageLimits } from "../types";
import AccountMenu from "./AccountMenu";

interface NavbarProps {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  activePage: string;
  user: User | null;
  limits: UsageLimits | null;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  onRefreshLimits: () => void;
  onOpenUpgradeModal: () => void;
}

export default function Navbar({ 
  theme, 
  setTheme, 
  activePage,
  user,
  limits,
  onLoginSuccess,
  onLogout,
  onRefreshLimits,
  onOpenUpgradeModal
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/85 px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/85">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-100 dark:shadow-none animate-pulse">
          <FileCheck2 className="h-6 w-6 animate-spin" style={{ animationDuration: '6s' }} id="nav-logo-icon" />
        </div>
        <div>
          <h1 className="font-display text-lg font-black tracking-tight text-slate-850 dark:text-white flex items-center gap-2">
            FileForge
          </h1>
          <p className="hidden text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 sm:block tracking-widest leading-none">
            Universal AI Tool Forge
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="hidden items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300 md:flex">
          <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
          <span>Gemini AI Accelerated</span>
        </div>

        {/* Beautiful Segmented Theme Switcher */}
        <div className="flex items-center rounded-xl bg-slate-100/80 p-1 dark:bg-slate-800/80 border border-slate-200/50 dark:border-slate-750">
          <button
            onClick={() => setTheme("light")}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
              theme === "light"
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-950"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
            title="Light Theme"
          >
            <Sun className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => setTheme("dark")}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-950 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
            title="Dark Theme"
          >
            <Moon className="h-4 w-4" />
          </button>

          <button
            onClick={() => setTheme("system")}
            className={`flex h-7 w-7 items-center justify-center rounded-lg transition-all cursor-pointer ${
              theme === "system"
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-950 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
            }`}
            title="System Preference"
          >
            <Monitor className="h-4 w-4" />
          </button>
        </div>

        {/* Dynamic SaaS Profile dropdown */}
        <AccountMenu 
          user={user}
          limits={limits}
          onLoginSuccess={onLoginSuccess}
          onLogout={onLogout}
          onRefreshLimits={onRefreshLimits}
          onOpenUpgradeModal={onOpenUpgradeModal}
        />
      </div>
    </header>
  );
}
