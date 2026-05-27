import { useState, useRef } from "react";
import { 
  ScanText, 
  Wand2, 
  Clipboard, 
  Check, 
  Download, 
  Trash2, 
  FileSearch, 
  Sparkles, 
  Layers, 
  RefreshCw,
  Sliders,
  Sparkle,
  Table,
  Grid,
  Edit2
} from "lucide-react";
import { UploadedFile } from "../types";
import { apiFetch } from "../utils";
import FileUploader from "./FileUploader";

interface OCRHubProps {
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function OCRHub({ onAddToast }: OCRHubProps) {
  const [sourceFile, setSourceFile] = useState<UploadedFile | null>(null);
  const [ocrText, setOcrText] = useState<string | null>(null);
  const [ocrDownloadUrl, setOcrDownloadUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  // Advanced SaaS enhancements
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [selectedFilter, setSelectedFilter] = useState<"original" | "mono" | "sharpen" | "contrast">("original");
  
  // OCR Cleanup & Table Extraction
  const [cleaning, setCleaning] = useState(false);
  const [extractingTable, setExtractingTable] = useState(false);
  const [tableData, setTableData] = useState<any[][] | null>(null);
  const [csvDownloadUrl, setCsvDownloadUrl] = useState<string | null>(null);
  const [isEditingTable, setIsEditingTable] = useState(false);

  const handleFileLoaded = (file: UploadedFile) => {
    setSourceFile(file);
    setOcrText(null);
    setOcrDownloadUrl(null);
    setTableData(null);
    onAddToast(`Loaded "${file.name}" for OCR indexing.`, "success");
  };

  const executeOCR = async () => {
    if (!sourceFile) return;
    setProcessing(true);
    setOcrText(null);
    setOcrDownloadUrl(null);

    let mimeType = sourceFile.type;
    if (sourceFile.name.endsWith(".pdf")) mimeType = "application/pdf";
    if (sourceFile.name.endsWith(".png")) mimeType = "image/png";
    if (sourceFile.name.endsWith(".jpg") || sourceFile.name.endsWith(".jpeg")) mimeType = "image/jpeg";

    try {
      const res = await apiFetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64: sourceFile.base64,
          filename: sourceFile.name,
          mimeType: mimeType,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setOcrText(data.text);
      setOcrDownloadUrl(data.download_url);
      onAddToast("Optical character transcription finished!", "success");
    } catch (e: any) {
      console.error(e);
      onAddToast(e.message || "Failed to parse OCR context from document.", "error");
    } finally {
      setProcessing(false);
    }
  };

  // AI OCR Cleanup Handler
  const triggerCleanup = async () => {
    if (!ocrText) return;
    setCleaning(true);
    onAddToast("AI Restorer fixing formatting & Indian spelling details...", "info");

    try {
      const res = await apiFetch("/api/ocr/cleanup", {
        method: "POST",
        body: JSON.stringify({
          text: ocrText,
          language: "Indian Multilingual English/Hindi"
        })
      });
      const data = await res.json();

      if (data.success) {
        setOcrText(data.cleanedText);
        onAddToast("Speech & paragraphs restored seamlessly!", "success");
      } else {
        onAddToast(data.error || "Failed to cleanse OCR text.", "error");
      }
    } catch (_) {
      onAddToast("AI Cleanup failed.", "error");
    } finally {
      setCleaning(false);
    }
  };

  // AI Table Extractor Handler
  const triggerTableExtraction = async () => {
    if (!sourceFile) return;
    setExtractingTable(true);
    onAddToast("Gemini model extracting tabular structures...", "info");

    try {
      const res = await apiFetch("/api/table/extract", {
        method: "POST",
        body: JSON.stringify({
          filename: sourceFile.name,
          base64: sourceFile.base64
        })
      });
      const data = await res.json();

      if (data.success) {
        setTableData(data.tableData || []);
        setCsvDownloadUrl(data.csvUrl);
        onAddToast("Dynamic interactive spreadsheet compiled!", "success");
      } else {
        onAddToast(data.error || "No tabular outlines detected.", "error");
      }
    } catch (_) {
      onAddToast("Table extraction failed.", "error");
    } finally {
      setExtractingTable(false);
    }
  };

  const handleCopy = () => {
    if (!ocrText) return;
    navigator.clipboard.writeText(ocrText);
    setCopied(true);
    onAddToast("Extracted transcription copied to clipboard!", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadText = () => {
    if (!ocrText || !sourceFile) return;

    if (ocrDownloadUrl) {
      const link = document.createElement("a");
      link.href = `${ocrDownloadUrl}?download=true`;
      link.download = sourceFile.name.replace(/\.[^/.]+$/, "") + "_transcribed_ocr.txt";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onAddToast("Transcription plain-text downloaded!", "success");
      return;
    }

    const cleanName = sourceFile.name.replace(/\.[^/.]+$/, "") + "_transcribed_ocr.txt";
    const blob = new Blob([ocrText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = cleanName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onAddToast("Transcription plain-text downloaded!", "success");
  };

  const handleCellEdit = (rowIdx: number, colIdx: number, val: string) => {
    if (!tableData) return;
    const copiedData = [...tableData];
    copiedData[rowIdx][colIdx] = val;
    setTableData(copiedData);
  };

  // Compute CSS filter string for real-time visual enhancement mockup
  const getFilterStyle = () => {
    let style = `brightness(${brightness}%) contrast(${contrast}%)`;
    if (selectedFilter === "mono") style += " grayscale(100%)";
    if (selectedFilter === "sharpen") style += " saturate(150%)";
    if (selectedFilter === "contrast") style += " contrast(180%)";
    return style;
  };

  return (
    <div className="space-y-6" id="enhanced-ocr-root">
      {/* Page header */}
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-slate-800 dark:text-slate-100">
          Vision OCR & Table Extractor Studio
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Extract text immediately, restore Indian speech structures, parse invoices, or download interactive spreadsheets.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        {/* Left pane: File Configuration & Document Scanner Enhancements */}
        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <div className="flex items-center gap-2 px-1">
              <ScanText className="h-5 w-5 text-indigo-500" />
              <h3 className="font-display font-semibold text-sm text-slate-700 dark:text-slate-200">
                OCR Input Workspace
              </h3>
            </div>

            {!sourceFile ? (
              <FileUploader
                onFileLoaded={handleFileLoaded}
                allowedTypes={[".pdf", ".png", ".jpg", ".jpeg"]}
                helperText="Supports multi-page PDFs, PNG, JPG scans"
              />
            ) : (
              <div className="space-y-4">
                
                {/* File summary item layout */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 text-white flex items-center justify-center">
                      <FileSearch className="h-5.5 w-5.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">{sourceFile.name}</p>
                      <p className="text-xxs font-mono text-slate-400 uppercase">
                        {(sourceFile.size / (1024 * 1024)).toFixed(2)} MB • {sourceFile.name.split(".").pop()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSourceFile(null);
                      setOcrText(null);
                      setTableData(null);
                    }}
                    className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                    title="Remove File"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>

                {/* Simulated Real-Time Document Enhancer Slider Controls */}
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-150 dark:border-slate-850 space-y-3">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 leading-none">
                    <Sliders className="h-3.5 w-3.5" />
                    <span>Real-Time Scan Enhancer (Feature #9)</span>
                  </span>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold justify-between flex">
                        <span>Brightness</span>
                        <span>{brightness}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={brightness}
                        onChange={(e) => setBrightness(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold justify-between flex">
                        <span>Contrast</span>
                        <span>{contrast}%</span>
                      </label>
                      <input 
                        type="range" 
                        min="50" 
                        max="150" 
                        value={contrast}
                        onChange={(e) => setContrast(parseInt(e.target.value))}
                        className="w-full accent-indigo-600 h-1 bg-slate-200 dark:bg-slate-800 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Filter switches */}
                  <div className="grid grid-cols-4 gap-1 pt-1.5">
                    {[
                      { id: "original", label: "Original" },
                      { id: "mono", label: "Mono / B&W" },
                      { id: "sharpen", label: "Saturate" },
                      { id: "contrast", label: "Contrast" }
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setSelectedFilter(f.id as any)}
                        className={`py-1 rounded text-[8px] font-bold uppercase ${
                          selectedFilter === f.id 
                            ? "bg-indigo-600 text-white" 
                            : "bg-slate-100 dark:bg-slate-900 text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  {/* Custom CSS Filtered preview if it's an image */}
                  {!sourceFile.name.endsWith(".pdf") && (
                    <div className="rounded-xl overflow-hidden max-h-24 bg-black flex items-center justify-center relative mt-2 border border-slate-200 dark:border-slate-800 shadow-inner">
                      <img 
                        src={`data:image/png;base64,${sourceFile.base64}`} 
                        alt="Scanned Preview" 
                        style={{ filter: getFilterStyle() }}
                        className="h-full object-contain max-w-full opacity-80"
                      />
                      <span className="absolute bottom-1 right-1.5 bg-black/60 text-[8px] font-mono font-bold tracking-widest text-emerald-400 px-1.5 py-0.5 rounded uppercase">
                        Real-Time Tuning
                      </span>
                    </div>
                  )}

                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={executeOCR}
                    disabled={processing}
                    className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 py-3 text-xs font-semibold uppercase tracking-wider text-white shadow-md hover:brightness-105 active:scale-98 cursor-pointer disabled:bg-slate-350 dark:disabled:bg-slate-805 transition-all"
                  >
                    {processing ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Wand2 className="h-4 w-4" />
                        <span>Extract Text (OCR)</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={triggerTableExtraction}
                    disabled={extractingTable}
                    className="flex items-center justify-center gap-2 rounded-xl bg-slate-900 border border-slate-800 text-white py-3 text-xs font-semibold uppercase tracking-wider shadow-md hover:bg-slate-800 active:scale-98 cursor-pointer disabled:bg-slate-350 dark:disabled:bg-slate-805 transition-all"
                  >
                    {extractingTable ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Table className="h-4 w-4" />
                        <span>Table Extractor</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-150 bg-indigo-50/20 p-4 dark:border-slate-815 dark:bg-indigo-950/20 space-y-2">
            <h4 className="text-xs font-semibold text-indigo-800 dark:text-indigo-400 flex items-center gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span>Full-Stack Document Intelligence</span>
            </h4>
            <p className="text-xxs leading-relaxed text-slate-500 dark:text-slate-400">
              Enhanced with multi-page segmentation, real-time contrast filtering, cleanups for multi-lingual transcriptions, and CSV compiler table structures.
            </p>
          </div>
        </div>

        {/* Right pane: Extracted text console OR Editable Structured Table */}
        <div className="lg:col-span-12 xl:col-span-7">
          
          {/* Layout when table data exists */}
          {tableData ? (
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[520px] overflow-hidden animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-805 dark:bg-slate-950/70">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
                    <Grid className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-705 dark:text-slate-300 block">
                      AI Tabular Spreadsheet (Feature #5)
                    </span>
                    <span className="text-[9px] text-slate-400 font-medium block">Double-click headers or cells to edit data</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsEditingTable(!isEditingTable)}
                    className="flex items-center gap-1 px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xxs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    <Edit2 className="h-3 w-3" />
                    <span>{isEditingTable ? "Save Layout" : "Edit Cells"}</span>
                  </button>

                  {csvDownloadUrl && (
                    <a
                      href={csvDownloadUrl}
                      download
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xxs font-bold cursor-pointer"
                    >
                      <Download className="h-3 w-3" />
                      <span>Export CSV Spreadsheet</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Editable spreadsheet grid layout */}
              <div className="flex-1 overflow-x-auto overflow-y-auto p-4 bg-slate-50/50 dark:bg-slate-950/20">
                <table className="w-full text-xxs font-semibold border-collapse">
                  <tbody>
                    {tableData.map((row, rIdx) => (
                      <tr key={rIdx} className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50/50">
                        {Array.isArray(row) && row.map((cell, cIdx) => (
                          <td key={cIdx} className="p-3 border-r border-slate-100 dark:border-slate-800 last:border-r-0">
                            {isEditingTable ? (
                              <input
                                type="text"
                                value={cell || ""}
                                onChange={(e) => handleCellEdit(rIdx, cIdx, e.target.value)}
                                className="w-full p-1 bg-white border border-slate-200 rounded text-xxs font-medium focus:ring-1 focus:ring-indigo-500"
                              />
                            ) : (
                              <span className="text-slate-700 dark:text-slate-300 leading-snug">{cell}</span>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

            </div>
          ) : (
            /* Layout when standard text occurs */
            <div className="rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 flex flex-col h-[520px] overflow-hidden">
              
              {/* Console header controls */}
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950/70">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-505 dark:bg-indigo-950/40">
                    <ScanText className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-display">
                    Extracted Transcription Output
                  </span>
                </div>

                {ocrText && (
                  <div className="flex items-center gap-2">
                    
                    {/* Feature #4: AI OCR Cleanup trigger */}
                    <button
                      onClick={triggerCleanup}
                      disabled={cleaning}
                      className="flex items-center gap-1 text-teal-600 border border-teal-100 bg-teal-50/30 hover:bg-teal-50 px-2.5 py-1.5 rounded-lg text-xxs font-bold cursor-pointer"
                      title="Repair grammar, stray symbols & Indian speech quality"
                    >
                      {cleaning ? (
                        <RefreshCw className="h-3 w-3 animate-spin text-teal-600" />
                      ) : (
                        <>
                          <Sparkle className="h-3 w-3 text-teal-500" />
                          <span>AI Repair & Cleanup (Feature #4)</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xxs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-450"
                    >
                      {copied ? (
                        <Check className="h-3 w-3 text-emerald-500" />
                      ) : (
                        <Clipboard className="h-3 w-3" />
                      )}
                      <span>Copy</span>
                    </button>

                    <button
                      onClick={handleDownloadText}
                      className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xxs font-semibold text-indigo-600 hover:bg-indigo-100 cursor-pointer dark:bg-indigo-950 dark:text-indigo-400"
                    >
                      <Download className="h-3 w-3" />
                      <span>Download</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Extracted contents code sandbox box */}
              <div className="flex-1 overflow-y-auto p-5 font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-55 dark:bg-slate-950 leading-relaxed max-w-none">
                {ocrText ? (
                  <pre className="whitespace-pre-wrap font-sans text-sm selection:bg-indigo-100 dark:selection:bg-indigo-950">
                    {ocrText}
                  </pre>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-12 text-slate-400 dark:text-slate-500">
                    <Layers className="h-10 w-10 mb-3 text-slate-300 dark:text-slate-755" />
                    <p className="text-xs font-semibold">Ready for Content OCR Extraction</p>
                    <p className="text-xxs text-slate-400/80 max-w-xs mt-1">
                      Upload your pdf or image on the left workspace panel and start processing to view textual index streams automatically.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
