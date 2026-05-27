import { Eye, Download, Trash2, Maximize, FileSpreadsheet, Sparkles, Wand2 } from "lucide-react";
import { UploadedFile } from "../types";

interface PDFViewerProps {
  file: UploadedFile;
  onClear: () => void;
  onQuickAction?: (action: 'ai' | 'ocr') => void;
}

export default function PDFViewer({ file, onClear, onQuickAction }: PDFViewerProps) {
  const getEmbedSource = () => {
    // 1. If we have a backend file resultUrl, prioritize that direct stream to prevent any browser blocks
    if (file.resultUrl) {
      return file.resultUrl;
    }
    // 2. Otherwise fall back to secure local browser memory Blob URL instead of raw data URIs
    try {
      const base64Data = file.resultBase64 || file.base64;
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      return URL.createObjectURL(blob);
    } catch (e) {
      console.error("Failed to generate safe preview blob:", e);
      return `data:application/pdf;base64,${file.resultBase64 || file.base64}`;
    }
  };

  const handleDownload = () => {
    // 1. Prefer safe server stream link
    if (file.resultUrl) {
      const link = document.createElement("a");
      link.href = `${file.resultUrl}?download=true`;
      link.download = file.resultName || file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    // 2. Local memory blob download fallback
    const base64Data = file.resultBase64 || file.base64;
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = file.resultName || file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to trigger local blob download:", e);
    }
  };

  const handleFullScreen = () => {
    if (file.resultUrl) {
      window.open(file.resultUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const base64Data = file.resultBase64 || file.base64;
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e) {
      console.error("Failed to open fullscreen preview:", e);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden flex flex-col h-[600px] transition-all">
      {/* Viewer Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
            <Eye className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate font-display">
              {file.resultName || file.name}
            </h3>
            <p className="text-xxs font-mono text-slate-400 dark:text-slate-500">
              {(file.size / (1024 * 1024)).toFixed(2)} MB • {file.resultName ? "Processed Outcome" : "Source Document"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onQuickAction && (
            <>
              <button
                onClick={() => onQuickAction('ai')}
                className="flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xxs font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors cursor-pointer dark:bg-indigo-950/50 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
                title="Summarize with Gemini"
              >
                <Sparkles className="h-3 w-3" />
                <span>Summarize</span>
              </button>
              <button
                onClick={() => onQuickAction('ocr')}
                className="flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xxs font-semibold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-755"
                title="Extract markdown text"
              >
                <Wand2 className="h-3 w-3" />
                <span>Extract Text</span>
              </button>
            </>
          )}

          <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-800 mx-1.5" />

          <button
            onClick={handleFullScreen}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer transition-colors"
            title="Open Fullscreen Page"
          >
            <Maximize className="h-4 w-4" />
          </button>
          <button
            onClick={handleDownload}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer transition-colors"
            title="Download PDF"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            onClick={onClear}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/40 cursor-pointer transition-colors"
            title="Erase document"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Embedded Render Frame */}
      <div className="flex-1 bg-slate-100 dark:bg-slate-950 relative">
        <iframe
          src={getEmbedSource()}
          className="absolute inset-0 w-full h-full border-0"
          title="PDF Display Canvas"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}
