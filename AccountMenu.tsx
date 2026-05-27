import { useState } from "react";
import { 
  FileText, 
  Layers, 
  Scissors, 
  Minimize2, 
  ArrowLeft,
  Settings,
  Sparkles,
  Play,
  RefreshCw,
  Download,
  AlertCircle,
  FileEdit,
  Image,
  ArrowUp,
  ArrowDown,
  Trash2,
  CheckCircle2,
  Eye
} from "lucide-react";
import { UploadedFile } from "../types";
import { apiFetch } from "../utils";
import FileUploader from "./FileUploader";
import PDFViewer from "./PDFViewer";

interface PDFHubProps {
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

type PDFToolId = "docx-to-pdf" | "pdf-to-docx" | "merge-pdf" | "split-pdf" | "compress-pdf" | "image-to-pdf" | null;

export default function PDFHub({ onAddToast }: PDFHubProps) {
  const [activeTool, setActiveTool] = useState<PDFToolId>(null);
  
  // File operations states
  const [sourceFile, setSourceFile] = useState<UploadedFile | null>(null);
  const [mergeFiles, setMergeFiles] = useState<UploadedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [resultFile, setResultFile] = useState<UploadedFile | null>(null);

  // Tool settings
  const [splitRange, setSplitRange] = useState("1-2");
  const [compressionLevel, setCompressionLevel] = useState<"low" | "medium" | "high">("medium");

  const selectTool = (tool: PDFToolId) => {
    setActiveTool(tool);
    setSourceFile(null);
    setMergeFiles([]);
    setResultFile(null);
    setProcessing(false);
  };

  const handleSourceFileLoaded = async (file: UploadedFile) => {
    // Instant cache-to-server preview upload to bypass Chrome sandboxed blocks immediately
    try {
      const res = await apiFetch("/api/upload-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: file.base64, filename: file.name }),
      });
      const data = await res.json();
      if (data.download_url) {
        file.resultUrl = data.download_url;
      }
    } catch (e) {
      console.error("Local preview upload cache failed:", e);
    }
    setSourceFile(file);
    onAddToast(`File "${file.name}" loaded successfully.`, "success");
  };

  const handleAddMergeFile = async (file: UploadedFile) => {
    try {
      const res = await apiFetch("/api/upload-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64: file.base64, filename: file.name }),
      });
      const data = await res.json();
      if (data.download_url) {
        file.resultUrl = data.download_url;
      }
    } catch (e) {
      console.error("Local preview upload cache failed:", e);
    }
    setMergeFiles((prev) => [...prev, file]);
    onAddToast(`Added "${file.name}" to sequence list.`, "success");
  };

  // Move files up/down for custom order rearrangement
  const moveMergeFile = (index: number, direction: "up" | "down") => {
    setMergeFiles((prev) => {
      const nextList = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= nextList.length) return prev;
      
      const temp = nextList[index];
      nextList[index] = nextList[targetIndex];
      nextList[targetIndex] = temp;
      
      onAddToast("Reordered document sequence.", "info");
      return nextList;
    });
  };

  const removeMergeFile = (index: number) => {
    setMergeFiles((prev) => prev.filter((_, idx) => idx !== index));
    onAddToast("Removed document from queue.", "info");
  };

  // Backend Process Action
  const executePDFAction = async () => {
    setProcessing(true);
    setResultFile(null);

    try {
      if (activeTool === "docx-to-pdf") {
        if (!sourceFile) return;
        const res = await apiFetch("/api/docx-to-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64: sourceFile.base64,
            filename: sourceFile.name,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const out: UploadedFile = {
          ...sourceFile,
          resultName: data.filename,
          resultBase64: data.base64,
          resultUrl: data.download_url,
          size: Math.round(data.base64.length * 0.75),
          status: "processed",
        };
        setResultFile(out);
        onAddToast("Word converted to PDF successfully!", "success");
      }

      else if (activeTool === "pdf-to-docx") {
        if (!sourceFile) return;
        const res = await apiFetch("/api/pdf-to-docx", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64: sourceFile.base64,
            filename: sourceFile.name,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const out: UploadedFile = {
          ...sourceFile,
          resultName: data.filename,
          resultBase64: data.base64,
          resultUrl: data.download_url,
          size: Math.round(data.base64.length * 0.75),
          status: "processed",
          type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        };
        setResultFile(out);
        onAddToast("PDF converted to editable DOCX successfully!", "success");
      }

      else if (activeTool === "merge-pdf") {
        if (mergeFiles.length < 2) {
          throw new Error("Merge operations require at least two files.");
        }
        const res = await apiFetch("/api/merge-pdfs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: mergeFiles.map(f => ({ base64: f.base64, name: f.name })),
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const out: UploadedFile = {
          id: Math.random().toString(),
          name: "merged_document.pdf",
          size: Math.round(data.base64.length * 0.75),
          type: "application/pdf",
          base64: data.base64,
          progress: 100,
          status: "processed",
          resultName: "merged_document.pdf",
          resultBase64: data.base64,
          resultUrl: data.download_url,
        };
        setResultFile(out);
        onAddToast("PDF documents successfully merged!", "success");
      }

      else if (activeTool === "split-pdf") {
        if (!sourceFile) return;
        if (!splitRange.trim()) throw new Error("Please specify a page range.");
        const res = await apiFetch("/api/split-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64: sourceFile.base64,
            filename: sourceFile.name,
            range: splitRange,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const out: UploadedFile = {
          ...sourceFile,
          resultName: data.filename,
          resultBase64: data.base64,
          resultUrl: data.download_url,
          size: Math.round(data.base64.length * 0.75),
          status: "processed",
        };
        setResultFile(out);
        onAddToast(`PDF page split generated successfully!`, "success");
      }

      else if (activeTool === "compress-pdf") {
        if (!sourceFile) return;
        const res = await apiFetch("/api/compress-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            base64: sourceFile.base64,
            filename: sourceFile.name,
            level: compressionLevel,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const out: UploadedFile = {
          ...sourceFile,
          resultName: data.filename,
          resultBase64: data.base64,
          resultUrl: data.download_url,
          size: Math.round(data.base64.length * 0.75),
          status: "processed",
        };
        setResultFile(out);
        onAddToast(`PDF size reduced by ${data.reduction}% under ${compressionLevel} mode!`, "success");
      }

      else if (activeTool === "image-to-pdf") {
        if (mergeFiles.length === 0) {
          throw new Error("Please upload at least one JPG or PNG image input.");
        }
        const res = await apiFetch("/api/image-to-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            files: mergeFiles.map(f => ({ base64: f.base64, name: f.name })),
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        const out: UploadedFile = {
          id: Math.random().toString(),
          name: "images_converted.pdf",
          size: Math.round(data.base64.length * 0.75),
          type: "application/pdf",
          base64: data.base64,
          progress: 100,
          status: "processed",
          resultName: "images_converted.pdf",
          resultBase64: data.base64,
          resultUrl: data.download_url,
        };
        setResultFile(out);
        onAddToast("Images compiled into PDF successfully!", "success");
      }

    } catch (e: any) {
      console.error(e);
      onAddToast(e.message || "An error occurred during secure processing.", "error");
    } finally {
      setProcessing(false);
    }
  };

  const handleDownloadResult = () => {
    if (!resultFile) return;
    
    // Always prioritize safe, same-origin server download links with download=true trigger
    if (resultFile.resultUrl) {
      const link = document.createElement("a");
      link.href = `${resultFile.resultUrl}?download=true`;
      link.download = resultFile.resultName || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onAddToast("Result downloaded from secure workspace!", "success");
      return;
    }

    // High fidelity browser memory blob download fallback
    const base64Data = resultFile.resultBase64 || resultFile.base64;
    try {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const mime = resultFile.type || "application/pdf";
      const blob = new Blob([byteArray], { type: mime });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = resultFile.resultName || "document.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onAddToast("Result downloaded successfully!", "success");
    } catch (err) {
      console.error("Blob download failure fallback:", err);
    }
  };

  const tools = [
    {
      id: "docx-to-pdf",
      name: "Word to PDF",
      desc: "Convert DOCX documents to standard styled PDF files.",
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
      accent: "text-blue-500",
      bg: "bg-blue-54/50 dark:bg-blue-950/10",
      formats: [".docx"],
    },
    {
      id: "pdf-to-docx",
      name: "PDF to Word Converter",
      desc: "Deconstruct PDF paragraphs and compile standard editable Word .docx files.",
      icon: FileEdit,
      color: "from-sky-500 to-blue-600",
      accent: "text-sky-500",
      bg: "bg-sky-50/50 dark:bg-sky-950/10",
      formats: [".pdf"],
    },
    {
      id: "merge-pdf",
      name: "Stitch PDFs (Merge File)",
      desc: "Stitch multiple PDFs in standard sequence layout.",
      icon: Layers,
      color: "from-indigo-500 to-purple-600",
      accent: "text-indigo-500",
      bg: "bg-indigo-50/50 dark:bg-indigo-950/10",
      formats: [".pdf"],
    },
    {
      id: "split-pdf",
      name: "Split PDF Range",
      desc: "Separate high-page PDFs into segments with custom index intervals.",
      icon: Scissors,
      color: "from-teal-500 to-emerald-600",
      accent: "text-teal-500",
      bg: "bg-teal-50/50 dark:bg-teal-950/10",
      formats: [".pdf"],
    },
    {
      id: "compress-pdf",
      name: "Compress PDF Optimizer",
      desc: "Streamline structural elements with adjustable quality compress modes.",
      icon: Minimize2,
      color: "from-amber-500 to-orange-600",
      accent: "text-amber-500",
      bg: "bg-amber-50/50 dark:bg-amber-950/10",
      formats: [".pdf"],
    },
    {
      id: "image-to-pdf",
      name: "Image to PDF Layout",
      desc: "Convert PNG or JPG image layers into a single compiled PDF sheet.",
      icon: Image,
      color: "from-pink-500 to-rose-600",
      accent: "text-pink-500",
      bg: "bg-pink-50/50 dark:bg-pink-950/10",
      formats: [".png", ".jpg", ".jpeg"],
    },
  ];

  const currentToolConfig = tools.find(t => t.id === activeTool);

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
            {currentToolConfig ? currentToolConfig.name : "FileForge Utilities"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {currentToolConfig ? currentToolConfig.desc : "Uncompromising document workspace optimized for speed, clarity, and Chrome-safe previewing."}
          </p>
        </div>

        {activeTool && (
          <button
            onClick={() => selectTool(null)}
            className="flex items-center gap-1.5 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-650 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Switch Tool Console</span>
          </button>
        )}
      </div>

      {/* Grid of Tools Menu */}
      {!activeTool ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={() => selectTool(item.id as PDFToolId)}
                className="group relative rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr ${item.color} text-white shadow-md shadow-slate-100 dark:shadow-none`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-650 dark:group-hover:text-indigo-400 transition-colors">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mt-1">
                      {item.desc}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between text-xxs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                  <span>Types: {item.formats.join(", ")}</span>
                  <span className="text-indigo-650 dark:text-indigo-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1 font-sans">
                    Open →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Workspace Detail Tool UI */
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
              <div className="flex items-center gap-2 px-1">
                <Settings className="h-4.5 w-4.5 text-slate-400" />
                <h3 className="font-display font-semibold text-sm text-slate-750 dark:text-slate-200">
                  Tool Parameters
                </h3>
              </div>

              {/* Upload handlers / sequence lists based on activeTool */}
              {(activeTool !== "merge-pdf" && activeTool !== "image-to-pdf") ? (
                <div className="space-y-4">
                  {!sourceFile ? (
                    <div>
                      <span className="block text-xs font-semibold text-slate-500 mb-2">Upload Source File</span>
                      <FileUploader
                        onFileLoaded={handleSourceFileLoaded}
                        allowedTypes={currentToolConfig?.formats || [".pdf"]}
                        helperText={`Import any standard ${currentToolConfig?.formats.join(" or ")} file`}
                      />
                    </div>
                  ) : (
                    <div className="rounded-xl border border-indigo-100 bg-indigo-50/30 p-4 dark:border-indigo-950/50 dark:bg-indigo-950/10 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-9 w-9 rounded-lg bg-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-850 dark:text-slate-200 truncate">{sourceFile.name}</p>
                          <p className="text-xxs font-mono text-slate-400">{(sourceFile.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setSourceFile(null);
                          setResultFile(null);
                        }}
                        className="text-xxs font-bold uppercase tracking-wider text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}

                  {/* Split PDF settings layout */}
                  {activeTool === "split-pdf" && sourceFile && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-semibold text-slate-650 dark:text-slate-300">
                        Extraction page rules:
                      </label>
                      <input
                        type="text"
                        value={splitRange}
                        onChange={(e) => setSplitRange(e.target.value)}
                        placeholder="e.g., 1-2, 4"
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-2.5 text-sm font-mono text-slate-800 outline-none focus:border-indigo-500 dark:border-slate-805 dark:bg-slate-950 dark:text-slate-200 transition-colors"
                      />
                      <p className="text-xxs text-slate-400 leading-normal">
                        Use intervals or comma separations to extract specific sections (e.g. &ldquo;1-3, 5, 7&rdquo;).
                      </p>
                    </div>
                  )}

                  {/* Compress levels choices layout */}
                  {activeTool === "compress-pdf" && sourceFile && (
                    <div className="space-y-2 pt-2">
                      <label className="block text-xs font-semibold text-slate-655 dark:text-slate-300">
                        File Quality Compression Tier:
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["low", "medium", "high"] as const).map((lvl) => (
                          <button
                            key={lvl}
                            onClick={() => setCompressionLevel(lvl)}
                            className={`px-3 py-2 rounded-xl text-xxs font-semibold uppercase tracking-wider transition-all cursor-pointer border ${
                              compressionLevel === lvl
                                ? "bg-indigo-600 text-white border-indigo-600"
                                : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-900"
                            }`}
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                      <p className="text-xxs text-slate-450 dark:text-slate-400 leading-normal pt-1_2">
                        {compressionLevel === "low" && "Minimal compression. Perfect to keep extreme vector resolutions intact."}
                        {compressionLevel === "medium" && "Equalized ratio. Standard optimized element structural maps."}
                        {compressionLevel === "high" && "Maximum shrink. Strips redundant fonts, historical revisions, and metadata."}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Merge/Image Seq list logic with arrow re-arrangers */
                <div className="space-y-4">
                  <div>
                    <span className="block text-xs font-semibold text-slate-500 mb-2">
                      {activeTool === "image-to-pdf" ? "Upload sequential JPG or PNG images:" : "Upload multiple PDFs sequentially:"}
                    </span>
                    <FileUploader
                      onFileLoaded={handleAddMergeFile}
                      allowedTypes={activeTool === "image-to-pdf" ? [".png", ".jpg", ".jpeg"] : [".pdf"]}
                      helperText={activeTool === "image-to-pdf" ? "Select images to compile" : "Import PDF layers"}
                    />
                  </div>

                  {mergeFiles.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="block text-xs font-bold text-slate-655 dark:text-slate-350">
                          Arrangement Canvas ({mergeFiles.length} item{mergeFiles.length !== 1 ? "s" : ""})
                        </span>
                        <button
                          onClick={() => {
                            setMergeFiles([]);
                            setResultFile(null);
                          }}
                          className="text-3xs uppercase font-semibold text-rose-500 hover:text-rose-700 font-mono tracking-wider cursor-pointer"
                        >
                          Clear Queue
                        </button>
                      </div>

                      <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                        {mergeFiles.map((f, idx) => (
                          <div
                            key={f.id}
                            className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50/40 p-2.5 dark:border-slate-800/80 dark:bg-slate-950/40"
                          >
                            <div className="flex items-center gap-2.5 min-w-0 flex-1">
                              <span className="text-3xs font-mono font-bold text-slate-400 bg-slate-200/50 rounded h-5 w-5 flex items-center justify-center dark:bg-slate-800 flex-shrink-0">
                                {idx + 1}
                              </span>
                              
                              {/* If image, display small thumbnail */}
                              {activeTool === "image-to-pdf" && f.base64 && (
                                <img
                                  src={`data:image/png;base64,${f.base64}`}
                                  className="h-8 w-8 object-cover rounded border border-slate-250 dark:border-slate-755 flex-shrink-0 bg-white"
                                  alt="preview"
                                />
                              )}

                              <div className="min-w-0">
                                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[140px] sm:max-w-[200px]">
                                  {f.name}
                                </p>
                                <p className="text-3xs font-mono text-slate-400">{(f.size / 1024).toFixed(0)} KB</p>
                              </div>
                            </div>
                            
                            {/* Sequence rearrangement & Discard triggers */}
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button
                                onClick={() => moveMergeFile(idx, "up")}
                                disabled={idx === 0}
                                className={`p-1 rounded text-slate-400 hover:text-indigo-650 cursor-pointer disabled:opacity-30 disabled:hover:text-slate-400`}
                                title="Move Up"
                              >
                                <ArrowUp className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => moveMergeFile(idx, "down")}
                                disabled={idx === mergeFiles.length - 1}
                                className={`p-1 rounded text-slate-400 hover:text-indigo-650 cursor-pointer disabled:opacity-30 disabled:hover:text-slate-400`}
                                title="Move Down"
                              >
                                <ArrowDown className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => removeMergeFile(idx)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 ml-1.5 cursor-pointer"
                                title="Discard"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Ready Processor Action button */}
              <button
                onClick={executePDFAction}
                disabled={processing || (activeTool !== "merge-pdf" && activeTool !== "image-to-pdf" ? !sourceFile : mergeFiles.length === 0)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-semibold uppercase tracking-wider text-white shadow-md transition-all cursor-pointer ${
                  processing || (activeTool !== "merge-pdf" && activeTool !== "image-to-pdf" ? !sourceFile : mergeFiles.length === 0)
                    ? "bg-slate-300 dark:bg-slate-800 text-slate-400 shadow-none cursor-not-allowed"
                    : `bg-gradient-to-r ${currentToolConfig?.color} hover:brightness-105 active:scale-98`
                }`}
                id="execute-pdf-tool"
              >
                {processing ? (
                  <>
                    <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                    <span>Processing Secure Payload...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Generate Stream Outcome</span>
                  </>
                )}
              </button>
            </div>

            {/* Helper tips */}
            <div className="rounded-2xl border border-slate-100 bg-emerald-50/20 p-4 dark:border-slate-800/40 dark:bg-emerald-950/15 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="block text-xs font-semibold text-emerald-800 dark:text-emerald-400 font-display">Chrome Security Native</span>
                <p className="text-xxs leading-relaxed text-emerald-600/90 dark:text-emerald-500/90 font-medium">
                  FileForge caches uploads securely inside sandboxed sandbox storage. All visual rendering handles same-origin relative URLs, guaranteeing full compatibility with Chrome and Safari browser frames without errors.
                </p>
              </div>
            </div>
          </div>

          {/* Right column: outcome previewing and details */}
          <div className="lg:col-span-12 xl:col-span-7">
            {resultFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  {/* Status Banner */}
                  <span className="flex items-center gap-1 text-xs font-bold text-emerald-650 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/30 px-3.5 py-1.5 rounded-full border border-emerald-100 dark:border-emerald-950">
                    <CheckCircle2 className="h-3.8 w-3.8 text-emerald-500" />
                    <span>Secure built output ready!</span>
                  </span>
                  
                  {/* Prime Download Button */}
                  <button
                    onClick={handleDownloadResult}
                    className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-750 shadow hover:shadow-md transition-colors cursor-pointer outline-none"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download File</span>
                  </button>
                </div>

                {/* PDFViewer if output format is pdf, otherwise beautiful custom card for Word/DOCX file results */}
                {resultFile.type && resultFile.type.includes("word") ? (
                  <div className="rounded-2xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900 text-center space-y-6 shadow-sm">
                    <div className="h-16 w-16 bg-blue-100 dark:bg-blue-950/50 rounded-2xl flex items-center justify-center mx-auto text-blue-650">
                      <FileEdit className="h-8 w-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-display font-bold text-lg text-slate-850 dark:text-slate-100">
                        Microsoft Word Document Compiled
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                        Your editable conversion has been generated cleanly. You can download and modify this document directly in Microsoft Word, Google Docs or LibreOffice.
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 dark:bg-slate-950 p-4 max-w-md mx-auto border border-slate-100 dark:border-slate-850 flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileText className="h-8 w-8 text-blue-500 flex-shrink-0" />
                        <div className="text-left min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-205 truncate">{resultFile.resultName}</p>
                          <p className="text-3xs font-mono text-slate-400 font-bold uppercase">Format: Word DOCX</p>
                        </div>
                      </div>
                      <button
                        onClick={handleDownloadResult}
                        className="text-xs font-bold text-indigo-650 hover:text-indigo-805 bg-white border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 dark:bg-slate-900 cursor-pointer"
                      >
                        Download
                      </button>
                    </div>

                    <div className="pt-2 flex items-center justify-center gap-2 text-3xs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      <Eye className="h-3.5 w-3.5 text-indigo-550" />
                      <span>Certified Sandbox Delivery Complete</span>
                    </div>
                  </div>
                ) : (
                  <PDFViewer
                    file={resultFile}
                    onClear={() => {
                      setResultFile(null);
                      setSourceFile(null);
                      setMergeFiles([]);
                    }}
                  />
                )}
              </div>
            ) : (
              <div className="h-[520px] rounded-2xl border border-slate-200 border-dashed bg-slate-50/50 flex flex-col items-center justify-center p-6 text-center dark:border-slate-800 dark:bg-slate-900/10">
                <div className="h-12 w-12 rounded-xl bg-slate-100 dark:bg-slate-950 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
                  <FileText className="h-6 w-6" />
                </div>
                <h4 className="text-xs font-semibold text-slate-705 dark:text-slate-350">
                  Document Preview Canvas
                </h4>
                <p className="text-xxs text-slate-400 max-w-xs mt-1 leading-normal mx-auto">
                  Configure tool settings on the sidebar, select source files, and execute the operational payload to preview build outcomes instantly here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
