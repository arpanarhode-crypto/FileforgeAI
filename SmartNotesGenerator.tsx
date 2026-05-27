import React, { useState, useRef } from "react";
import { 
  FolderSync, 
  Upload, 
  Sparkles, 
  Loader2, 
  Check, 
  X, 
  Download, 
  Settings, 
  Layers, 
  ChevronRight 
} from "lucide-react";
import { apiFetch } from "../utils";

interface QueueItem {
  id: string;
  name: string;
  status: "pending" | "processing" | "success" | "failed";
  url?: string;
}

interface BatchProcessorProps {
  onAddToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function BatchProcessor({ onAddToast }: BatchProcessorProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [tool, setTool] = useState("ocr");
  const [targetLang, setTargetLang] = useState("Hindi");
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      onAddToast("Batch limit is max 5 files.", "error");
      setSelectedFiles(files.slice(0, 5));
    } else {
      setSelectedFiles(files);
    }
  };

  const toBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(",")[1]);
      };
      reader.onerror = error => reject(error);
    });
  };

  const startBatchProcess = async () => {
    if (selectedFiles.length === 0) return;

    setProcessing(true);
    
    // Build initial queue state
    const initialQueue = selectedFiles.map((f, index) => ({
      id: index.toString(),
      name: f.name,
      status: "pending" as const
    }));

    setQueue(initialQueue);
    onAddToast("Deploying batch queue payload...", "info");

    try {
      // Map base64 packages
      const base64Packages = await Promise.all(
        selectedFiles.map(async f => ({
          name: f.name,
          base64: await toBase64(f)
        }))
      );

      // Advance queue items to 'processing'
      setQueue(prev => prev.map(q => ({ ...q, status: "processing" as const })));

      const res = await apiFetch("/api/batch/process", {
        method: "POST",
        body: JSON.stringify({
          files: base64Packages,
          tool,
          targetLang
        })
      });
      const data = await res.json();

      if (data.success) {
        onAddToast("Batch queue processed successfully!", "success");
        setQueue(data.queueResults || []);
      } else {
        onAddToast("Queue processing faulted.", "error");
        setQueue(prev => prev.map(q => ({ ...q, status: "failed" as const })));
      }

    } catch (err: any) {
      onAddToast("Queue error: " + err.message, "error");
      setQueue(prev => prev.map(q => ({ ...q, status: "failed" as const })));
    } finally {
      setProcessing(false);
    }
  };

  const clearBatch = () => {
    setSelectedFiles([]);
    setQueue([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-6" id="batch-processor-root">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-pink-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-3">
          <Layers className="h-7 w-7 text-pink-400" />
          <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight">Active Batch processing Desk</h1>
        </div>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
          Unlock maximum SaaS throughput. Upload up to 5 document structures, choose your tool, and compile outputs simultaneously.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Settings Panel */}
        <div className="lg:col-span-1 space-y-4">
          <div className="p-5 bg-white dark:bg-slate-900 border border-slate-250/70 dark:border-slate-805 rounded-3xl space-y-4">
            
            <div className="flex items-center gap-2 text-pink-600">
              <Settings className="h-4.5 w-4.5" />
              <h3 className="text-xs font-bold uppercase tracking-wider">Queue Configuration</h3>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Operation target</span>
              <select
                value={tool}
                onChange={(e) => setTool(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs dark:bg-slate-950 dark:border-slate-805"
              >
                <option value="ocr">Batch Vision OCR</option>
                <option value="translate">Batch AI Translation Studio</option>
                <option value="compress">Batch Compress Volumes</option>
              </select>
            </div>

            {tool === "translate" && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Target Language</span>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs dark:bg-slate-950 dark:border-slate-805"
                >
                  <option value="Hindi">Hindi (हिन्दी)</option>
                  <option value="Tamil">Tamil (தமிழ்)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                  <option value="Bengali">Bengali (বাংলা)</option>
                </select>
              </div>
            )}

            <div className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Mount Files</span>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full text-center py-5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs font-bold text-slate-400 hover:border-pink-500 cursor-pointer"
              >
                Select up to 5 Files
              </button>
              <input
                type="file"
                ref={fileInputRef}
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase text-slate-400">
                  <span>Selected files ({selectedFiles.length})</span>
                  <button onClick={clearBatch} className="text-rose-500 cursor-pointer hover:underline text-[9px]">Clear All</button>
                </div>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {selectedFiles.map((f, idx) => (
                    <p key={idx} className="text-xxs font-mono truncate text-slate-600 dark:text-slate-400">
                      • {f.name}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={startBatchProcess}
              disabled={selectedFiles.length === 0 || processing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-pink-700 hover:bg-pink-800 disabled:bg-pink-900/30 text-white font-semibold text-xs uppercase tracking-wider rounded-2xl shadow-md cursor-pointer transition-all"
            >
              {processing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing queue...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Trigger Batch Queue</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Queue Viewer Timeline Workspace */}
        <div className="lg:col-span-3">
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-sm space-y-4">
            
            <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
              <FolderSync className="h-5 w-5 text-pink-500" />
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Execution Timeline</h3>
                <p className="text-xxs text-slate-400 font-medium">Tracking sequential execution cycles and package compilation status.</p>
              </div>
            </div>

            {queue.length === 0 ? (
              <div className="text-center py-20 text-slate-450 text-xs">
                Timeline idle. Select target settings and files to execute cycles.
              </div>
            ) : (
              <div className="space-y-4">
                {queue.map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    className="flex justify-between items-center p-4 bg-slate-50/50 dark:bg-slate-950/25 border border-slate-100 dark:border-slate-850 rounded-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center border text-xs font-bold ${
                        item.status === "success" ? "bg-emerald-58/10 border-emerald-500/20 text-emerald-600" :
                        item.status === "failed" ? "bg-rose-50/10 border-rose-500/20 text-rose-500" :
                        "bg-indigo-50/15 border-indigo-500/20 text-slate-400 animate-pulse"
                      }`}>
                        {item.status === "success" && <Check className="h-4" />}
                        {item.status === "failed" && <X className="h-4" />}
                        {item.status === "pending" && <span>{idx + 1}</span>}
                        {item.status === "processing" && <Loader2 className="h-4 w-4 animate-spin" />}
                      </div>
                      
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-350">{item.name}</h4>
                        <span className="text-[10px] text-slate-400 capitalize block">{item.status}</span>
                      </div>
                    </div>

                    {item.status === "success" && item.url && (
                      <a
                        href={item.url}
                        download
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 hover:bg-pink-100 text-pink-700 dark:bg-pink-950 dark:hover:bg-pink-900 dark:text-pink-400 font-bold text-[9px] uppercase tracking-wider rounded-xl cursor-pointer"
                      >
                        <Download className="h-3.5 w-3.5" />
                        <span>Download Result</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
