import { useState } from "react";
import { 
  Sparkles, 
  BrainCircuit, 
  FileSearch, 
  Settings2, 
  Check, 
  Clipboard, 
  Download, 
  Trash2, 
  ListOrdered, 
  AlignLeft, 
  Activity, 
  RefreshCw 
} from "lucide-react";
import { UploadedFile } from "../types";
import { apiFetch } from "../utils";
import FileUploader from "./FileUploader";

interface AIHubProps {
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
  // Let's allow seeding preloaded files from previous tabs
  preloadedFile?: UploadedFile | null;
  onClearPreload?: () => void;
}

type SummaryStyle = "bullets" | "comprehensive" | "action" | "short";

export default function AIHub({ onAddToast, preloadedFile, onClearPreload }: AIHubProps) {
  const [sourceFile, setSourceFile] = useState<UploadedFile | null>(preloadedFile || null);
  const [summaryStyle, setSummaryStyle] = useState<SummaryStyle>("bullets");
  const [summaryText, setSummaryText] = useState<string | null>(null);
  const [summaryDownloadUrl, setSummaryDownloadUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleFileLoaded = (file: UploadedFile) => {
    setSourceFile(file);
    setSummaryText(null);
    setSummaryDownloadUrl(null);
    onAddToast(`Loaded "${file.name}" for Gemini Document analysis.`, "success");
  };

  const handleSummarize = async () => {
    if (!sourceFile) return;
    setProcessing(true);
    setSummaryText(null);
    setSummaryDownloadUrl(null);

    // Mimetype mapping
    let mimeType = sourceFile.type;
    if (sourceFile.name.endsWith(".pdf")) mimeType = "application/pdf";
    if (sourceFile.name.endsWith(".docx")) mimeType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
    if (sourceFile.name.endsWith(".png")) mimeType = "image/png";
    if (sourceFile.name.endsWith(".jpg") || sourceFile.name.endsWith(".jpeg")) mimeType = "image/jpeg";

    try {
      const res = await apiFetch("/api/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: sourceFile.base64,
          filename: sourceFile.name,
          mimeType: mimeType,
          summaryStyle: summaryStyle,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setSummaryText(data.summary);
      setSummaryDownloadUrl(data.download_url || null);
      onAddToast("Document summarized using Gemini AI successfully!", "success");
    } catch (e: any) {
      console.error(e);
      onAddToast(e.message || "Failed to make Gemini Document Analysis call.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!summaryText) return;
    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    onAddToast("Document summary copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadDoc = () => {
    if (!summaryText || !sourceFile) return;

    if (summaryDownloadUrl) {
      const link = document.createElement("a");
      link.href = `${summaryDownloadUrl}?download=true`;
      link.download = sourceFile.name.replace(/\.[^/.]+$/, "") + `_summary_${summaryStyle}.md`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onAddToast("Summary Markdown file downloaded from workspace!", "success");
      return;
    }

    const cleanName = sourceFile.name.replace(/\.[^/.]+$/, "") + `_summary_${summaryStyle}.md`;
    const blob = new Blob([summaryText], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddToast("Summary Markdown file downloaded!", "success");
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Gemini Document Analyzer & Summarizer
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Let Gemini digest your text and files. Generate instant outlines, summaries, or structured todo logs instantly.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left config pane */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center gap-2 px-1">
              <BrainCircuit className="h-5 w-5 text-indigo-500" />
              <h3 className="font-display font-semibold text-sm text-slate-700 dark:text-slate-200">
                AI Summary Director
              </h3>
            </div>

            {/* Document upload box */}
            {!sourceFile ? (
              <FileUploader
                onFileLoaded={handleFileLoaded}
                allowedTypes={[".pdf", ".docx", ".png", ".jpg", ".jpeg"]}
                helperText="Supports PDF, Word, PNG, JPG files"
              />
            ) : (
              <div className="space-y-4">
                <div className="rounded-xl border border-dashed border-indigo-200 bg-indigo-50/25 p-3.5 dark:border-indigo-950/40 dark:bg-indigo-950/15 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-9 w-9 bg-indigo-500 text-white flex items-center justify-center rounded-lg">
                      <FileSearch className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{sourceFile.name}</p>
                      <p className="text-xxs font-mono text-slate-400">
                        {(sourceFile.size / (1024 * 1024)).toFixed(2)} MB • {sourceFile.name.split(".").pop()?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSourceFile(null);
                      setSummaryText(null);
                      if (onClearPreload) onClearPreload();
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove File"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Summary style configs */}
                <div className="space-y-3 pt-2">
                  <span className="block text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Settings2 className="h-3.5 w-3.5" />
                    <span>Choose Target Outline Template:</span>
                  </span>

                  <div className="grid grid-cols-2 gap-2.5">
                    {/* Style 1: Bullets */}
                    <button
                      onClick={() => setSummaryStyle("bullets")}
                      className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        summaryStyle === "bullets"
                          ? "border-indigo-500 bg-indigo-50/30 text-indigo-950 ring-1 ring-indigo-500/30 dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-200"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold font-display">
                        <ListOrdered className="h-3.5 w-3.5" />
                        <span>Bullets</span>
                      </span>
                      <span className="text-xxs opacity-80 mt-1">Multi-page deep outlines.</span>
                    </button>

                    {/* Style 2: Action Roadmap */}
                    <button
                      onClick={() => setSummaryStyle("action")}
                      className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        summaryStyle === "action"
                          ? "border-indigo-500 bg-indigo-50/30 text-indigo-950 ring-1 ring-indigo-500/30 dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-200"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold font-display">
                        <Activity className="h-3.5 w-3.5" />
                        <span>Action Map</span>
                      </span>
                      <span className="text-xxs opacity-80 mt-1">Todo logs & key tasks.</span>
                    </button>

                    {/* Style 3: Executive Comprehensive */}
                    <button
                      onClick={() => setSummaryStyle("comprehensive")}
                      className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        summaryStyle === "comprehensive"
                          ? "border-indigo-500 bg-indigo-50/30 text-indigo-950 ring-1 ring-indigo-500/30 dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-200"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold font-display">
                        <Sparkles className="h-3.5 w-3.5 hover:scale-110" />
                        <span>Detailed</span>
                      </span>
                      <span className="text-xxs opacity-80 mt-1">Comprehensive digest.</span>
                    </button>

                    {/* Style 4: Paragraph */}
                    <button
                      onClick={() => setSummaryStyle("short")}
                      className={`flex flex-col p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        summaryStyle === "short"
                          ? "border-indigo-500 bg-indigo-50/30 text-indigo-950 ring-1 ring-indigo-500/30 dark:border-indigo-400 dark:bg-indigo-950/20 dark:text-indigo-200"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-900 dark:text-slate-400"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-xs font-bold font-display">
                        <AlignLeft className="h-3.5 w-3.5" />
                        <span>Paragraph</span>
                      </span>
                      <span className="text-xxs opacity-80 mt-1">Elegant 1-paragraph summary.</span>
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleSummarize}
                  disabled={processing}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:brightness-105 active:scale-98 cursor-pointer disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-all"
                  id="execute-summarize"
                >
                  {processing ? (
                    <>
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                      <span>Synthesizing Outline with Gemini...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      <span>Summarize Document</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Gemini Capabilities note */}
          <div className="rounded-2xl border border-slate-150 bg-indigo-50/20 p-4 dark:border-slate-800 dark:bg-indigo-950/20 space-y-2 lg:col-span-5 h-fit">
            <h4 className="text-xs font-semibold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5 font-display">
              <Sparkles className="h-4 w-4 text-violet-500" />
              <span>Full Document Context</span>
            </h4>
            <p className="text-xxs leading-relaxed text-slate-500 dark:text-slate-400">
              Our analyzer accepts high resolution raw file pipelines. Gemini parses the full syntax model, cross-references indexes, strips irrelevant visual noises, and produces structured analytical summaries instantly with high factual coverage.
            </p>
          </div>
        </div>

        {/* Right Pane: summary output console */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[500px] overflow-hidden">
            {/* Control bar */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500 dark:bg-indigo-950/40">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-display">
                  Gemini Deep Summary Panel
                </span>
              </div>

              {summaryText && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xxs font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-450 dark:hover:bg-slate-900"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3 w-3 text-emerald-500" />
                        <span className="text-emerald-500 font-semibold">Done</span>
                      </>
                    ) : (
                      <>
                        <Clipboard className="h-3 w-3" />
                        <span>Copy Output</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleDownloadDoc}
                    className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xxs font-semibold text-indigo-600 hover:bg-indigo-100 cursor-pointer dark:bg-indigo-950 dark:text-indigo-400"
                  >
                    <Download className="h-3 w-3" />
                    <span>Download MD</span>
                  </button>
                </div>
              )}
            </div>

            {/* Output view container */}
            <div className="flex-1 overflow-y-auto p-6 text-slate-700 dark:text-slate-300 bg-slate-55 dark:bg-slate-950 leading-relaxed max-w-none">
              {summaryText ? (
                <div className="space-y-4 font-sans text-sm selection:bg-indigo-100 dark:selection:bg-indigo-950">
                  {/* Clean custom styling for Gemini markdown summary */}
                  <div className="prose prose-slate dark:prose-invert max-w-none space-y-4">
                    {/* Render plain block format of markdown lines cleanly */}
                    {summaryText.split("\n").map((line, idx) => {
                      if (line.startsWith("### ")) {
                        return <h3 key={idx} className="font-display font-bold text-base text-slate-850 dark:text-slate-100 mt-5 mb-2">{line.replace("### ", "")}</h3>;
                      }
                      if (line.startsWith("## ")) {
                        return <h2 key={idx} className="font-display font-bold text-lg text-indigo-950 dark:text-white mt-6 mb-3 border-b border-slate-100 pb-1 dark:border-slate-800">{line.replace("## ", "")}</h2>;
                      }
                      if (line.startsWith("# ")) {
                        return <h1 key={idx} className="font-display font-black text-xl text-indigo-950 dark:text-white mt-8 mb-4">{line.replace("# ", "")}</h1>;
                      }
                      if (line.startsWith("- ") || line.startsWith("* ")) {
                        return <li key={idx} className="list-disc ml-4 text-slate-650 dark:text-slate-300 my-1">{line.replace(/^[-*]\s+/, "")}</li>;
                      }
                      if (/^\d+\.\s+/.test(line)) {
                        return <li key={idx} className="list-decimal ml-4 text-slate-650 dark:text-slate-300 my-1">{line.replace(/^\d+\.\s+/, "")}</li>;
                      }
                      return <p key={idx} className="my-2 leading-relaxed">{line}</p>;
                    })}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 dark:text-slate-500">
                  <BrainCircuit className="h-10 w-10 mb-3 text-slate-300 dark:text-slate-755 animate-pulse" />
                  <p className="text-xs font-semibold">Ready for Deep Document Summary</p>
                  <p className="text-xxs text-slate-400/80 max-w-xs mt-1">
                    Upload your document on the left panel, pick an digest template style (bullets, executive paragraph, activity todo tracker), and hit summarize.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
