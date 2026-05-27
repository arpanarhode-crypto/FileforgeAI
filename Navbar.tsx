import { 
  Home, 
  LayoutGrid, 
  FileText, 
  ScanText, 
  BrainCircuit, 
  ChevronRight,
  Info,
  Languages,
  MessageSquare,
  Award,
  BookOpen,
  Layers,
  ShieldCheck
} from "lucide-react";
import { Page } from "../types";

interface SidebarProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

export default function Sidebar({ activePage, setActivePage }: SidebarProps) {
  const menuItems = [
    { id: "home", label: "Overview Home", icon: Home, desc: "Welcome & onboarding" },
    { id: "dashboard", label: "Unified Hub", icon: LayoutGrid, desc: "Tools launcher desk" },
    { id: "pdf-chat", label: "AI PDF Chat", icon: MessageSquare, desc: "Chat index with PDF details" },
    { id: "resume-analyzer", label: "Resume ATS Review", icon: Award, desc: "Optimize ATS compatibility" },
    { id: "smart-notes", label: "Smart Study Notes", icon: BookOpen, desc: "Summaries, flashcards & MCQs" },
    { id: "batch-process", label: "Batch process", icon: Layers, desc: "Multi-file sequential queue" },
    { id: "pdf-tools", label: "PDF & DOCX Tools", icon: FileText, desc: "Convert, split, merge, shrink" },
    { id: "ocr-tools", label: "Vision OCR Studio", icon: ScanText, desc: "Scans to editable Markdown" },
    { id: "translation-tools", label: "AI Translation", icon: Languages, desc: "Multilingual Indian suite" },
    { id: "ai-tools", label: "Document Summaries", icon: BrainCircuit, desc: "Gemini document summarize" },
    { id: "admin-dashboard", label: "Admin Analytics", icon: ShieldCheck, desc: "Platform metrics breakdown" }
  ];

  return (
    <aside className="w-68 flex-shrink-0 border-r border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div>
          <span className="text-xxs font-mono font-semibold tracking-wider text-slate-400 dark:text-slate-500 uppercase px-3">
            Navigation Console
          </span>
          <nav className="mt-2 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActivePage(item.id as Page)}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition-all duration-200 text-left cursor-pointer group ${
                    isActive
                      ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50 dark:bg-slate-900 dark:text-indigo-400 dark:ring-slate-800/50"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900/50 dark:hover:text-slate-200"
                  }`}
                  id={`nav-item-${item.id}`}
                >
                  <Icon className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400"}`} />
                  <div className="flex-1">
                    <span className="block font-medium">{item.label}</span>
                    <span className="block text-xxs font-normal text-slate-400 dark:text-slate-500 group-hover:text-slate-500 dark:group-hover:text-slate-400 leading-none mt-0.5">
                      {item.desc}
                    </span>
                  </div>
                  {isActive && <ChevronRight className="h-4 w-4 text-indigo-500" />}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="rounded-xl border border-slate-200/80 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
          <div className="flex gap-2 text-indigo-600 dark:text-indigo-400 mb-1">
            <Info className="h-4.5 w-4.5 flex-shrink-0 mt-0.5" />
            <h4 className="text-xs font-semibold uppercase tracking-wider font-display">SaaS Powered</h4>
          </div>
          <p className="text-xxs leading-relaxed text-slate-500 dark:text-slate-400">
            Powered by high-performance base64 transmission pipeline. Standardized for high accuracy data indexing.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
        <div className="flex items-center gap-2 px-3">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xxs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Cloud Run Engine Live
          </span>
        </div>
      </div>
    </aside>
  );
}
