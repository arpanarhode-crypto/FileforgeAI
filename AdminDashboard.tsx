import { useState } from "react";
import { 
  FileText, 
  Layers, 
  Scissors, 
  Minimize2, 
  ScanText, 
  BrainCircuit, 
  Sparkles, 
  ChevronRight,
  Eye,
  Languages,
  Crown,
  Activity,
  Clock,
  ArrowDownToLine,
  User as UserIcon,
  HelpCircle,
  Database,
  RefreshCw
} from "lucide-react";
import { Page, User, UsageLimits, HistoryItem } from "../types";

interface DashboardLauncherProps {
  user: User | null;
  limits: UsageLimits | null;
  history: HistoryItem[];
  onNavigate: (page: Page) => void;
  onOpenUpgradeModal: () => void;
  onRefreshLimits: () => void;
}

export default function DashboardLauncher({ 
  user, 
  limits, 
  history, 
  onNavigate, 
  onOpenUpgradeModal,
  onRefreshLimits
}: DashboardLauncherProps) {
  const [refreshing, setRefreshing] = useState(false);

  const isPremium = user?.plan === "premium" || limits?.isPremium;

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await onRefreshLimits();
    setTimeout(() => setRefreshing(false), 800);
  };

  const categories = [
    {
      title: "PDF & DOCX Utilities",
      desc: "Instant file formats rendering & compiler suites.",
      items: [
        {
          name: "DOCX to PDF Converter",
          desc: "Extract text layout content and compile beautifully styled PDF documentations.",
          icon: FileText,
          bg: "bg-indigo-500",
          target: "pdf-tools" as Page,
        },
        {
          name: "Merge PDF (Stitcher)",
          desc: "Combine multiple PDF streams chronologically into a single master document.",
          icon: Layers,
          bg: "bg-blue-500",
          target: "pdf-tools" as Page,
        },
        {
          name: "PDF Page Extractor (Split)",
          desc: "Surgically isolate single pages or index brackets to clean layouts.",
          icon: Scissors,
          bg: "bg-emerald-500",
          target: "pdf-tools" as Page,
        },
        {
          name: "PDF Size Optimizer (Compress)",
          desc: "Optimize PDF internal structures to significantly compress file storage sizes.",
          icon: Minimize2,
          bg: "bg-amber-500",
          target: "pdf-tools" as Page,
        },
      ],
    },
    {
      title: "AI & OCR Systems Studio",
      desc: "Multilingual OCR scanner, summarizing models and AI translators.",
      items: [
        {
          name: "Optical Glyph OCR Scanner",
          desc: "Isolate character paths from screenshots, tilted page images or PDF archives.",
          icon: ScanText,
          bg: "bg-pink-500",
          target: "ocr-tools" as Page,
        },
        {
          name: "AI Translation Studio",
          desc: "Translate documents & texts instantly with full support for Indian languages.",
          icon: Languages,
          bg: "bg-emerald-500",
          target: "translation-tools" as Page,
        },
        {
          name: "AI Document Summarizer",
          desc: "Analyze complete files to synthesize clear structured summaries or checklists.",
          icon: BrainCircuit,
          bg: "bg-violet-500",
          target: "ai-tools" as Page,
        },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Header welcome console */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-extrabold tracking-widest text-indigo-500 leading-none">
            Secure Document Workspace
          </span>
          <h2 className="font-display text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2 mt-1">
            Forge AI Control Dashboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Analyze your limits, track history, and select an operational module.
          </p>
        </div>

        <button
          onClick={handleManualRefresh}
          className="flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-55 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 cursor-pointer transition-all active:scale-95"
          disabled={refreshing}
        >
          <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin text-indigo-505" : ""}`} />
          <span>Synchronize Limits</span>
        </button>
      </div>

      {/* 2. Unified SaaS Status Panel Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* User Account / Membership Summary */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800/80 dark:bg-[#0c101c] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-505/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
              Workspace Profile
            </span>
            <div className="flex gap-3 items-center">
              <div className={`h-11 w-11 flex items-center justify-center rounded-2xl font-black select-none text-sm ${
                isPremium 
                  ? "bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-md" 
                  : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
              }`}>
                {user ? user.email.substring(0, 2).toUpperCase() : <UserIcon className="h-5 w-5" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-black truncate text-slate-800 dark:text-slate-200">
                  {user ? user.email : "Local Guest Session"}
                </h4>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${isPremium ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${isPremium ? "text-amber-600 dark:text-amber-500" : "text-emerald-600 dark:text-emerald-500"}`}>
                    {isPremium ? "Pro Membership" : "Free Tier"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2">
            {isPremium ? (
              <div className="rounded-xl bg-amber-50 border border-amber-100 p-2.5 dark:bg-amber-950/20 dark:border-amber-900 text-xxs flex items-center gap-2">
                <Crown className="h-4.5 w-4.5 text-amber-500 animate-pulse flex-shrink-0" />
                <span className="text-amber-800 dark:text-amber-400 font-bold leading-tight">
                  Premium fully active! Watermarks are removed and sizes limits are bypassed.
                </span>
              </div>
            ) : (
              <button
                onClick={onOpenUpgradeModal}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-700 to-violet-600 hover:from-indigo-800 hover:to-violet-700 text-white p-2.5 text-xs font-semibold shadow-md cursor-pointer transition-all active:scale-95 duration-150"
              >
                <Crown className="h-4 w-4 text-amber-400 animate-bounce" />
                <span>Go Pro • Remove Watermarks</span>
              </button>
            )}
          </div>
        </div>

        {/* Translation limits card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800/80 dark:bg-[#0c101c] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
              Translation studio limits
            </span>
            <div className="flex justify-between items-baseline">
              <h3 className="text-xl font-black font-display text-slate-800 dark:text-white leading-none">
                {isPremium ? "Unlimited" : `${limits ? limits.translationWordsLeft : 800}`}
              </h3>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                {isPremium ? "Unrestricted" : "Words left today"}
              </p>
            </div>
            {/* Visual limit gauge */}
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
              <div 
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                style={{ width: isPremium ? '100%' : `${limits ? Math.max(5, (limits.translationWordsLeft / 800) * 100) : 100}%` }}
              />
            </div>
          </div>

          <div className="text-[10px] font-medium text-slate-555 dark:text-slate-400 leading-snug pt-2">
            {isPremium ? (
              "Complete system translated capacity unlocked. Translate endless Indian language pdfs."
            ) : (
              "Upgrade to Pro for limitless batch word counts and direct document PDF conversions."
            )}
          </div>
        </div>

        {/* OCR and conversions limits card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 space-y-4 dark:border-slate-800/80 dark:bg-[#0c101c] shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-2">
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
              Optical vision OCR limits
            </span>
            <div className="flex justify-between items-baseline">
              <h3 className="text-xl font-black font-display text-slate-800 dark:text-white leading-none">
                {isPremium ? "Unlimited" : `${limits ? limits.ocrLeft : 5}`}
              </h3>
              <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-widest">
                {isPremium ? "Unrestricted" : "Scans left today"}
              </p>
            </div>
            {/* Visual limit gauge */}
            <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
              <div 
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: isPremium ? '100%' : `${limits ? Math.max(5, (limits.ocrLeft / 5) * 100) : 100}%` }}
              />
            </div>
          </div>

          <div className="text-[10px] font-medium text-slate-555 dark:text-slate-400 leading-snug pt-2">
            {isPremium ? (
              "Enjoy high-precision layouts transcription using Google Gemini OCR and analysis."
            ) : (
              "Free accounts allow 5 premium scans daily. Exceeding locks access until reset."
            )}
          </div>
        </div>
      </div>

      {/* 3. Operational Module Shelves Categories */}
      <div className="space-y-6">
        <h3 className="text-xs uppercase font-extrabold tracking-widest text-slate-400 dark:text-slate-500 pl-1">
          Available Modules Workspaces
        </h3>
        <div className="grid gap-6 sm:grid-cols-2">
          {categories.flatMap(cat => cat.items).map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                onClick={() => onNavigate(item.target)}
                className="group flex gap-4 p-5 rounded-2xl border border-slate-200 bg-white shadow-xxs hover:shadow-sm hover:border-indigo-300 transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900"
              >
                <div className={`h-11 w-11 flex-shrink-0 flex items-center justify-center rounded-xl ${item.bg} text-white group-hover:scale-105 transition-all`}>
                  <Icon className="h-6 w-6" />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {item.name}
                    </h4>
                    <p className="text-xxs leading-relaxed text-slate-500 dark:text-slate-400 mt-0.5">
                      {item.desc}
                    </p>
                  </div>

                  <div className="mt-3.5 flex items-center text-3xs font-mono font-bold uppercase tracking-widest text-indigo-500 group-hover:text-indigo-650 transition-colors select-none">
                    <span>Initialize environment</span>
                    <ChevronRight className="h-3 w-3 translate-x-0 group-hover:translate-x-1.5 transition-transform" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Users Dynamic Recent Activity Logging System */}
      <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-[#0c101c] shadow-sm space-y-4">
        <div className="flex items-center justify-between pl-1">
          <div className="flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-indigo-505" />
            <h3 className="font-display font-black text-sm text-slate-850 dark:text-white leading-none">
              Historic Activity Log
            </h3>
          </div>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
            {history.length} operations tracked
          </span>
        </div>

        {history.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xxs font-medium border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-900 text-slate-400 dark:text-slate-500 tracking-wider font-extrabold uppercase">
                  <th className="py-2.5 px-3">Date / Timestamp</th>
                  <th className="py-2.5 px-3">Tool Operator</th>
                  <th className="py-2.5 px-3">Primary Document</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/50 dark:divide-slate-900/50">
                {history.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 text-slate-700 dark:text-slate-300">
                    <td className="py-3 px-3 font-mono text-[10px]">
                      {new Date(record.timestamp).toLocaleString(undefined, {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 font-bold uppercase text-[9px] tracking-wider">
                        {record.toolType}
                      </span>
                    </td>
                    <td className="py-3 px-3 max-w-[200px] truncate font-semibold">
                      {record.inputName}
                    </td>
                    <td className="py-3 px-3">
                      <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-55 animate-ping" />
                        Success
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      {record.outputName ? (
                        <a
                          href={`/download/${record.outputName}`}
                          download
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-indigo-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-indigo-400 font-semibold cursor-pointer"
                        >
                          <ArrowDownToLine className="h-3 w-3" />
                          <span>Get Output</span>
                        </a>
                      ) : (
                        <span className="text-slate-405 font-mono text-[9px]">Uncached</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-20s py-10 text-center space-y-2 dark:border-slate-800">
            <Database className="h-7 w-7 text-slate-400 mx-auto" />
            <h5 className="font-display font-medium text-xs text-slate-600 dark:text-slate-400">
              No historical data cataloged
            </h5>
            <p className="text-xxs text-slate-400 max-w-sm mx-auto leading-normal font-medium">
              Daily conversions, summarize threads, and translations are kept intact in local cookies. Process a document file to spawn logs here.
            </p>
          </div>
        )}
      </div>

    </div>
  );
}
