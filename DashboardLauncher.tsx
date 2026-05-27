import { 
  FileCheck2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  ScanText, 
  BrainCircuit, 
  ShieldCheck, 
  Cpu 
} from "lucide-react";
import { Page } from "../types";

interface HomeOverviewProps {
  onNavigate: (page: Page) => void;
}

export default function HomeOverview({ onNavigate }: HomeOverviewProps) {
  const steps = [
    {
      title: "1. Select document",
      text: "Load your targeted files (PDF, DOCX, or images) into our local workspace sandbox securely.",
    },
    {
      title: "2. Choose tool settings",
      text: "Set desired split indexes, compilation sequence orders, or custom AI summaries templates.",
    },
    {
      title: "3. Run & Download",
      text: "Get optimized output files immediately with instant browser renders and secure save paths.",
    },
  ];

  const highlights = [
    {
      icon: FileText,
      title: "Document Core Hub",
      desc: "Merge, split, shrink PDFs, or convert DOCX streams into beautiful PDF sheets gracefully.",
      tab: "pdf-tools" as Page,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      icon: ScanText,
      title: "Vision OCR",
      desc: "Instant high-fidelity transcription of scanned pages, Slanted images, or handwriting.",
      tab: "ocr-tools" as Page,
      color: "text-teal-500 bg-teal-50 dark:bg-teal-950/40 dark:text-teal-400",
    },
    {
      icon: BrainCircuit,
      title: "Document AI",
      desc: "Let Gemini build bullet-point summaries, actionable roadmaps, or executive todo lists.",
      tab: "ai-tools" as Page,
      color: "text-indigo-505 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400",
    },
  ];

  return (
    <div className="space-y-12 py-4">
      {/* Hero card section heading */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Sparkles className="h-3 w-3" />
          <span>Next-Generation Document Utility Workspace</span>
        </span>
        <h1 className="font-display text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl leading-none">
          Simplify your files with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">FileForge</span>
        </h1>
        <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
          Fast document conversion, PDF file binders, split-range extractors, optical character OCR scanners, and Gemini-powered smart assistants in one secure sandbox.
        </p>
        <div className="pt-2 flex justify-center">
          <button
            onClick={() => onNavigate("dashboard")}
            className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-6 py-3.5 text-sm font-semibold text-white shadow-md shadow-indigo-100 hover:brightness-105 active:scale-98 transition-all cursor-pointer dark:shadow-none"
            id="hero-dashboard-btn"
          >
            <span>Launch Toolkit Desk</span>
            <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>

      {/* Highlights Hub segment */}
      <div className="grid gap-6 sm:grid-cols-3">
        {highlights.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => onNavigate(item.tab)}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
            >
              <div className="space-y-4">
                <div className={`inline-flex h-11 w-11 items-center justify-center rounded-xl ${item.color}`}>
                  <Icon className="h-5.5 w-5.5 animate-pulse" />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 text-xxs font-mono text-indigo-600 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                <span>Configure Tool →</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Stepper Guide */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950/40 space-y-6">
        <h3 className="font-display text-lg font-bold text-slate-800 dark:text-slate-200 text-center">
          How FileForge Works
        </h3>
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((step, idx) => (
            <div key={idx} className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-slate-100 dark:border-slate-850 shadow-xxs">
              <h4 className="font-display text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-1">
                {step.title}
              </h4>
              <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Safe security checks footer banner */}
      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 rounded-2xl border border-emerald-100 bg-emerald-50/15 p-6 dark:border-emerald-900/30 dark:bg-emerald-950/10">
        <div className="flex items-start gap-3 max-w-sm">
          <ShieldCheck className="h-7 w-7 text-emerald-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400 font-display">
              Enterprise Grade Privacy Safeguard
            </h4>
            <p className="text-xxs leading-relaxed text-slate-500 dark:text-slate-400">
              We never save document copies or transcription databases. File arrays run directly inside stateless sandboxed memory, clearing immediately on execution.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3 max-w-sm">
          <Cpu className="h-7 w-7 text-indigo-500 flex-shrink-0 mt-0.5 animate-pulse" />
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 font-display">
              Multi-Model AI Extraction
            </h4>
            <p className="text-xxs leading-relaxed text-slate-500 dark:text-slate-400">
              OCR and Summaries features capitalize directly on Google Gemini Flash structures for premium reading comprehensions across languages.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
