import { useState } from "react";
import { 
  Languages, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  ArrowLeftRight, 
  FileText, 
  ChevronRight, 
  FileCheck2, 
  Trash2, 
  RefreshCw, 
  BookOpen, 
  FileDown 
} from "lucide-react";
import { UploadedFile } from "../types";
import { apiFetch } from "../utils";
import FileUploader from "./FileUploader";

interface TranslationStudioProps {
  onAddToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const INDIAN_LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", name: "Malayalam (മലയാളം)" },
  { code: "ur", name: "Urdu (اردو)" },
  { code: "or", name: "Odia (ଓଡ଼ିଆ)" },
  { code: "as", name: "Assamese (অসমীয়া)" },
  { code: "sa", name: "Sanskrit (संस्कृतम्)" }
];

export default function TranslationStudio({ onAddToast }: TranslationStudioProps) {
  const [sourceFile, setSourceFile] = useState<UploadedFile | null>(null);
  const [inputText, setInputText] = useState("");
  const [sourceLang, setSourceLang] = useState("auto");
  const [targetLang, setTargetLang] = useState("Hindi (हिन्दी)");
  const [translating, setTranslating] = useState(false);
  const [detectedLang, setDetectedLang] = useState<string | null>(null);
  const [translatedText, setTranslatedText] = useState("");
  const [originalTextUsed, setOriginalTextUsed] = useState("");
  const [copiedOriginal, setCopiedOriginal] = useState(false);
  const [copiedTranslated, setCopiedTranslated] = useState(false);
  
  // Doc compiling state
  const [compiling, setCompiling] = useState(false);

  const handleFileLoaded = (file: UploadedFile) => {
    setSourceFile(file);
    // Clear previous translation state
    setTranslatedText("");
    setDetectedLang(null);
    setInputText(""); // Reset text field when a file is loaded
    onAddToast(`Loaded document "${file.name}" for translation!`, "success");
  };

  const handleClear = () => {
    setSourceFile(null);
    setInputText("");
    setTranslatedText("");
    setDetectedLang(null);
    onAddToast("Cleared translation studio template workspace.", "info");
  };

  const handleCopy = (text: string, type: 'orig' | 'trans') => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    if (type === 'orig') {
      setCopiedOriginal(true);
      setTimeout(() => setCopiedOriginal(false), 2000);
    } else {
      setCopiedTranslated(true);
      setTimeout(() => setCopiedTranslated(false), 2000);
    }
    onAddToast("Text successfully copied to clipboard!", "success");
  };

  const handleTranslate = async () => {
    if (!sourceFile && !inputText.trim()) {
      onAddToast("Please type some text or upload a document to translate.", "error");
      return;
    }

    setTranslating(true);
    setTranslatedText("");
    setDetectedLang(null);

    const bodyPayLoad: any = {
      sourceLang,
      targetLang,
    };

    if (sourceFile) {
      bodyPayLoad.base64 = sourceFile.base64;
      bodyPayLoad.filename = sourceFile.name;
    } else {
      bodyPayLoad.text = inputText;
    }

    try {
      const response = await apiFetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayLoad),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error);

      setTranslatedText(data.translatedText);
      setOriginalTextUsed(data.originalText);
      if (data.detectedLanguage) {
        setDetectedLang(data.detectedLanguage);
      }
      onAddToast("AI Translation completed successfully!", "success");
    } catch (err: any) {
      console.error(err);
      onAddToast(err.message || "Failed to translate standard content.", "error");
    } finally {
      setTranslating(false);
    }
  };

  const downloadTranslatedDocument = async (format: "pdf" | "docx" | "txt") => {
    if (!translatedText) return;
    setCompiling(true);
    onAddToast(`Compiling translated document package as ${format.toUpperCase()}...`, "info");

    try {
      const res = await apiFetch("/api/generate-translated-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: translatedText,
          format,
          filename: sourceFile?.name || "translated_studio_text",
          targetLang: targetLang.split(" ")[0], // Extract language name e.g. "Hindi"
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Safe anchor download trigger to fully bypass standard Chrome frame blocks sandboxing
      const link = document.createElement("a");
      link.href = `${data.download_url}?download=true`;
      link.download = data.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onAddToast(`${format.toUpperCase()} downloaded successfully!`, "success");
    } catch (err: any) {
      console.error(err);
      onAddToast(err.message || "Could not generate download file.", "error");
    } finally {
      setCompiling(false);
    }
  };

  return (
    <div className="space-y-8 py-2">
      {/* Header and short details summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-black tracking-tight text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Languages className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            <span>AI Translation Studio</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Real-time translation matrix supporting automatic script detection & high-quality document downloads.
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-150 bg-white px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950 text-xxs font-mono text-slate-500">
          <Sparkles className="h-4 w-4 text-emerald-500" />
          <span>Unicode Glyphs Core V1.0</span>
        </div>
      </div>

      {/* Control desk panel */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Input pane side */}
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xxs dark:border-slate-800 dark:bg-slate-900 space-y-5">
            <h3 className="font-display font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-indigo-500" />
              <span>Translation Settings</span>
            </h3>

            {/* Language parameters */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xxs font-mono uppercase tracking-wider text-slate-400 block">
                  Original Language
                </label>
                <select
                  value={sourceLang}
                  onChange={(e) => setSourceLang(e.target.value)}
                  className="w-full text-xs font-sans rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 cursor-pointer"
                  id="source-lang-select"
                >
                  <option value="auto">✨ Auto Detect Source Script</option>
                  {INDIAN_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-center select-none py-1">
                <ArrowLeftRight className="h-4 w-4 text-slate-300 dark:text-slate-600 rotate-90 lg:rotate-0" />
              </div>

              <div className="space-y-1.5">
                <label className="text-xxs font-mono uppercase tracking-wider text-slate-400 block">
                  Translate Into
                </label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value)}
                  className="w-full text-xs font-sans rounded-xl border border-slate-200 bg-slate-50 p-2.5 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 cursor-pointer"
                  id="target-lang-select"
                >
                  {INDIAN_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selector between Paste Text or Document Upload */}
            <div className="border-t border-slate-100 pt-4 dark:border-slate-800 space-y-4">
              <div className="space-y-2">
                <span className="text-xxs font-mono uppercase tracking-wider text-slate-400 block">
                  Workspace Input Stream
                </span>
                
                {!sourceFile ? (
                  <div className="space-y-4">
                    <textarea
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Paste your multilingual document text paragraphs here to translate..."
                      rows={5}
                      className="w-full text-xs font-sans rounded-xl border border-slate-200 bg-slate-50 p-3 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 resize-none"
                    />
                    
                    <div className="relative flex py-2 items-center text-3xs font-mono text-slate-400 uppercase">
                      <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
                      <span className="mx-2">Or Attach Document</span>
                      <div className="flex-grow border-t border-slate-150 dark:border-slate-800"></div>
                    </div>

                    <FileUploader 
                      onFileLoaded={handleFileLoaded} 
                      allowedTypes={[".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".webp"]}
                      helperText="Supports PDF, DOCX, TXT, images"
                    />
                    <p className="text-xxs text-slate-450 dark:text-slate-500 text-center leading-normal">
                      Accepts PDF, Word (DOCX), Text files & PNG/JPG/WebP images. Images are automatically transcribed via Gemini Vision OCR before translation.
                    </p>
                  </div>
                ) : (
                  <div className="rounded-xl border border-indigo-100 bg-indigo-50/15 p-4 dark:border-indigo-900/10 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
                        <FileText className="h-5.5 w-5.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-display font-semibold text-xs text-slate-800 dark:text-slate-200 truncate leading-snug">
                          {sourceFile.name}
                        </h4>
                        <p className="text-3xs font-mono text-slate-450 uppercase">
                          {(sourceFile.size / 1024).toFixed(1)} KB • Local Cache
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={handleClear}
                      className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all cursor-pointer"
                      title="Clear Selection"
                    >
                      <Trash2 className="h-4.5 w-4.5" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Translate Button */}
            <button
              onClick={handleTranslate}
              disabled={translating || (!sourceFile && !inputText.trim())}
              className="w-full group flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 px-5 py-3.5 text-xs font-bold text-white shadow-sm hover:brightness-105 active:scale-98 transition-all cursor-pointer disabled:opacity-50 disabled:pointer-events-none"
              id="translate-btn"
            >
              {translating ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  <span>Translating Document...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4.5 w-4.5" />
                  <span>Execute AI Translation</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Translation Side-by-Side Console Output Pane */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xxs dark:border-slate-800 dark:bg-slate-900 min-h-[450px] flex flex-col justify-between">
            
            {/* Main content body display */}
            <div className="space-y-5 flex-1 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
                <span className="font-display font-black text-sm text-slate-800 dark:text-slate-200 uppercase tracking-tight">
                  Studio Output Grid
                </span>
                
                {detectedLang && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-3xs font-mono font-bold text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                    <FileCheck2 className="h-3.5 w-3.5" />
                    <span>Detected source: {detectedLang}</span>
                  </span>
                )}
              </div>

              {!translatedText ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-xl space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-slate-50 dark:bg-slate-950 flex items-center justify-center text-slate-350 dark:text-slate-650">
                    <Languages className="h-6 w-6 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-display font-bold text-xs text-slate-700 dark:text-slate-300">
                      Empty Translate Console Stage
                    </h4>
                    <p className="text-3xs text-slate-450 dark:text-slate-400 max-w-sm mt-1">
                      Translate pasted paragraphs, documents (Word, PDF, Plaintext) or image scans seamlessly. Your raw and translated output paragraphs will side-by-side compile here cleanly.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 flex-grow">
                  {/* Left Column: Original source text */}
                  <div className="rounded-xl border border-slate-150 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-950/30 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 text-xxs font-mono uppercase text-slate-400 tracking-wider">
                        <span>Original Source Text</span>
                        <button
                          onClick={() => handleCopy(originalTextUsed, 'orig')}
                          className="text-slate-450 hover:text-indigo-500 p-1 rounded transition-colors cursor-pointer"
                          title="Copy Source"
                        >
                          {copiedOriginal ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-sans max-h-[320px] overflow-y-auto whitespace-pre-wrap pr-1">
                        {originalTextUsed}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Translated language text with correct Unicode rendering */}
                  <div className="rounded-xl border border-indigo-100/50 bg-indigo-55/10 p-4 dark:border-indigo-900/10 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100 dark:border-slate-800 text-xxs font-mono uppercase text-indigo-400 tracking-wider">
                        <span>Translated ({targetLang.split(" ")[0]})</span>
                        <button
                          onClick={() => handleCopy(translatedText, 'trans')}
                          className="text-indigo-450 hover:text-indigo-500 p-1 rounded transition-colors cursor-pointer"
                          title="Copy Translation"
                        >
                          {copiedTranslated ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      <div className="text-xs font-sans text-slate-800 dark:text-slate-100 leading-relaxed max-h-[320px] overflow-y-auto whitespace-pre-wrap pr-1">
                        {translatedText}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Downloader drawer options at footer panel */}
            {translatedText && (
              <div className="border-t border-slate-100 pt-4 mt-4 dark:border-slate-800 space-y-3">
                <span className="text-xxs font-mono uppercase tracking-wider text-slate-450 block">
                  Export Translation Stream
                </span>

                <div className="grid gap-3 sm:grid-cols-3">
                  <button
                    onClick={() => downloadTranslatedDocument("pdf")}
                    disabled={compiling}
                    className="flex items-center justify-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/15 py-3 px-4 text-xs font-bold text-indigo-700 hover:bg-indigo-50/30 active:scale-98 transition-all cursor-pointer dark:border-indigo-900/30 dark:text-indigo-400"
                    id="download-trans-pdf-btn"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download PDF</span>
                  </button>

                  <button
                    onClick={() => downloadTranslatedDocument("docx")}
                    disabled={compiling}
                    className="flex items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50/15 py-3 px-4 text-xs font-bold text-blue-700 hover:bg-blue-50/30 active:scale-98 transition-all cursor-pointer dark:border-blue-900/30 dark:text-blue-400"
                    id="download-trans-docx-btn"
                  >
                    <FileDown className="h-4 w-4" />
                    <span>Download DOCX</span>
                  </button>

                  <button
                    onClick={() => downloadTranslatedDocument("txt")}
                    disabled={compiling}
                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-xs font-bold text-slate-700 hover:bg-slate-100 active:scale-98 transition-all cursor-pointer dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    id="download-trans-txt-btn"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Download TXT</span>
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}
