import React, { useState, useRef } from "react";
import { 
  Upload, 
  FileText, 
  Award, 
  Sparkles, 
  ArrowRight, 
  Check, 
  X, 
  ChevronRight, 
  Copy, 
  Download, 
  Loader2 
} from "lucide-react";
import { apiFetch } from "../utils";

interface BulletRewrite {
  original: string;
  rewrite: string;
}

interface AnalysisReport {
  atsScore: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  grammarFixes: string[];
  formatSuggestions: string[];
  keySkillsGap: string[];
  jobRoleMatches: string[];
  bulletRewrites: BulletRewrite[];
}

interface ResumeAnalyzerProps {
  onAddToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function ResumeAnalyzer({ onAddToast }: ResumeAnalyzerProps) {
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [reportDownloadUrl, setReportDownloadUrl] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelection(file);
  };

  const handleFileSelection = (file: File) => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "pdf" && ext !== "docx" && ext !== "txt") {
      onAddToast("Please upload a PDF or DOCX file.", "error");
      return;
    }
    setSelectedFile(file);
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

  const triggerAnalysis = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setReport(null);
    setReportDownloadUrl(null);
    onAddToast("Analyzing resume format and ATS compatibility...", "info");

    try {
      const b64 = await toBase64(selectedFile);
      const res = await apiFetch("/api/resume/analyze", {
        method: "POST",
        body: JSON.stringify({
          filename: selectedFile.name,
          base64: b64
        })
      });
      const data = await res.json();

      if (data.success) {
        setReport(data.report);
        setReportDownloadUrl(data.reportUrl);
        onAddToast("Resume analyzed successfully!", "success");
      } else {
        onAddToast(data.error || "Failed to complete ATS analysis.", "error");
      }
    } catch (_) {
      onAddToast("Resume Analyzer connection completed.", "error");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    onAddToast("Copied rewritten prompt to clipboard!", "success");
  };

  return (
    <div className="space-y-6" id="resume-analyzer-module">
      
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white shadow-lg space-y-2">
        <div className="flex items-center gap-3">
          <Award className="h-7 w-7 text-indigo-400" />
          <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight">AI Resume & ATS Assessor</h1>
        </div>
        <p className="text-xs md:text-sm text-slate-300 max-w-2xl font-medium leading-relaxed">
          Upload your resume in PDF/DOCX format to compile a professional ATS audit report. Identify keyword gaps, repair grammar mistakes, and copy custom bullet points.
        </p>
      </div>

      {/* Main Core View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Upload Column */}
        <div className="lg:col-span-1 space-y-4">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer bg-white dark:bg-slate-900 ${
              dragging 
                ? "border-indigo-500 bg-indigo-50/10" 
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
            }`}
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".pdf,.docx,.txt" 
              className="hidden" 
            />
            
            <div className="flex flex-col items-center justify-center space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600">
                <Upload className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-100">
                  {selectedFile ? selectedFile.name : "Choose or drag resume"}
                </p>
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  Supports PDF, DOCX or TXT (Max 20MB)
                </p>
              </div>
            </div>
          </div>

          {selectedFile && (
            <button
              onClick={triggerAnalysis}
              disabled={analyzing}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/50 text-white font-semibold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
              id="btn-analyze-resume"
            >
              {analyzing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Assessing compatibility...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Trigger ATS Assessment</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Report Column */}
        <div className="lg:col-span-2 space-y-6">
          {!report ? (
            <div className="h-full min-h-64 flex flex-col items-center justify-center border border-slate-200/60 dark:border-slate-800 bg-white dark:bg-slate-905 rounded-3xl p-8 text-center text-slate-400">
              <FileText className="h-10 w-10 text-slate-300 mb-2" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">No Active Report</h3>
              <p className="text-xxs font-medium max-w-xs leading-normal">
                Upload your curriculum outline and trigger our AI scoring core to receive automated resume reports.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* ATS circular rating & title actions banner */}
              <div className="flex flex-col md:flex-row items-center gap-6 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 p-6 rounded-3xl shadow-sm">
                
                {/* Circular indicator */}
                <div className="relative h-28 w-28 flex items-center justify-center flex-shrink-0">
                  <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      className="stroke-slate-100 dark:stroke-slate-800" 
                      strokeWidth="8" 
                      fill="transparent" 
                    />
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      className="stroke-indigo-600" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray={`${2 * Math.PI * 48}`}
                      strokeDashoffset={`${2 * Math.PI * 48 * (1 - (report.atsScore || 70) / 100)}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="text-center">
                    <span className="text-2xl font-extrabold font-mono text-indigo-600">{report.atsScore || 70}</span>
                    <span className="text-[10px] text-slate-400 font-bold block leading-none">ATS RATING</span>
                  </div>
                </div>

                <div className="flex-1 text-center md:text-left space-y-2">
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Review Metrics Summary</h2>
                  <p className="text-xxs text-slate-500 leading-normal font-medium">
                    {report.summary}
                  </p>
                  
                  {reportDownloadUrl && (
                    <a
                      href={reportDownloadUrl}
                      download
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-bold text-[10px] uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Download Expert PDF Report</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Strengths & Weaknesses Grids */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Strengths */}
                <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-100 dark:border-emerald-900/40 p-4 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                    <Check className="h-4.5 w-4.5 font-bold" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Identified Core Strengths</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.strengths.map((s, idx) => (
                      <li key={idx} className="text-xxs text-slate-600 dark:text-slate-400 font-medium flex items-start gap-1">
                        <span className="text-emerald-500 text-xs leading-none">•</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-rose-50/20 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-900/40 p-4 rounded-3xl space-y-3">
                  <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                    <X className="h-4.5 w-4.5 font-bold" />
                    <h3 className="text-xs font-bold uppercase tracking-wider">Critical Gaps & Improvement</h3>
                  </div>
                  <ul className="space-y-1.5">
                    {report.weaknesses.map((w, idx) => (
                      <li key={idx} className="text-xxs text-slate-600 dark:text-slate-400 font-medium flex items-start gap-1">
                        <span className="text-rose-500 text-xs leading-none">•</span>
                        <span>{w}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Sub features: Keyword search lists, grammar highlights */}
              <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Recommended Keywords Finder</h3>
                <div className="flex flex-wrap gap-2">
                  {report.keySkillsGap.map((k, idx) => (
                    <span 
                      key={idx}
                      className="px-2.5 py-1 bg-indigo-50/50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-mono text-[9px] rounded-lg"
                    >
                      +{k}
                    </span>
                  ))}
                </div>

                {report.grammarFixes?.length > 0 && (
                  <div className="pt-2">
                    <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">Writing Style Improvement suggestions:</h4>
                    <ul className="space-y-1">
                      {report.grammarFixes.map((f, idx) => (
                        <li key={idx} className="text-xxs text-slate-500 font-medium flex items-center gap-1.5">
                          <ChevronRight className="h-3 w-3 text-indigo-500" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Split layout: Original bullets vs AI Rewritten bullets */}
              {report.bulletRewrites?.length > 0 && (
                <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4.5 w-4.5 text-indigo-600" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Interactive Resume Bullet Optimizer</h3>
                  </div>
                  <p className="text-xxs text-slate-400 font-medium">
                    Original weak bullets are matched with action-first, metrics-driven sentences containing high ATS appeal.
                  </p>

                  <div className="space-y-4 pt-2">
                    {report.bulletRewrites.map((b, idx) => (
                      <div key={idx} className="grid grid-cols-1 md:grid-cols-2 gap-3 border-b border-slate-100 dark:border-slate-850 pb-3 last:border-b-0 last:pb-0">
                        <div className="bg-slate-50/50 dark:bg-slate-950/20 p-3 rounded-2xl">
                          <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-bold mb-1">ORIGINAL PROFILE WORDING</span>
                          <p className="text-xxs text-slate-500 font-medium leading-relaxed">
                            {b.original}
                          </p>
                        </div>
                        <div className="bg-indigo-50/10 border border-indigo-100/20 dark:bg-indigo-950/10 p-3 rounded-2xl flex flex-col justify-between gap-2">
                          <div>
                            <span className="text-[9px] text-indigo-500 uppercase tracking-widest block font-bold mb-1">AI HIGH-IMPACT OPTIMIZATION</span>
                            <p className="text-xxs text-indigo-950 dark:text-indigo-200 font-bold leading-relaxed">
                              {b.rewrite}
                            </p>
                          </div>
                          <button
                            onClick={() => handleCopyText(b.rewrite)}
                            className="self-end inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
                          >
                            <Copy className="h-3 w-3" />
                            <span>Copy Optimized Wording</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
