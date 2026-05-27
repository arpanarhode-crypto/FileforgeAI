import { useState, useRef, DragEvent, ChangeEvent } from "react";
import { UploadCloud, File, AlertCircle, CheckCircle, RefreshCw } from "lucide-react";
import { UploadedFile } from "../types";

interface FileUploaderProps {
  onFileLoaded: (file: UploadedFile) => void;
  allowedTypes: string[];
  helperText?: string;
  maxSizeMB?: number;
}

export default function FileUploader({
  onFileLoaded,
  allowedTypes,
  helperText = "Supports PDF, DOCX, PNG, JPG",
  maxSizeMB = 20,
}: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setError(null);
    setLoading(true);

    // Validate size limit (MB)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`File is too large. Max size is ${maxSizeMB}MB.`);
      setLoading(false);
      return;
    }

    // Validate mime / extension
    const extension = "." + file.name.split(".").pop()?.toLowerCase();
    const isAllowed = allowedTypes.some(
      (type) => type.toLowerCase() === extension || file.type.toLowerCase().includes(type.replace(".", "").toLowerCase())
    );

    if (!isAllowed) {
      setError(`Unsupported file type. Expected formats: ${allowedTypes.join(", ")}`);
      setLoading(false);
      return;
    }

    // Read file base64 data
    const reader = new FileReader();
    reader.onload = () => {
      const base64String = (reader.result as string).split(",")[1];
      const uploaded: UploadedFile = {
        id: Math.random().toString(36).substring(2, 9),
        name: file.name,
        size: file.size,
        type: file.type || (extension === ".docx" ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document" : "application/octet-stream"),
        base64: base64String,
        progress: 100,
        status: "completed",
      };
      onFileLoaded(uploaded);
      setLoading(false);
    };
    reader.onerror = () => {
      setError("An error occurred while reading the file.");
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
          dragActive
            ? "border-indigo-500 bg-indigo-50/50 dark:border-indigo-400 dark:bg-indigo-950/20"
            : "border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50/50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-500/80 dark:hover:bg-slate-900/40"
        }`}
        id="uploader-dropzone"
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleChange}
          accept={allowedTypes.join(",")}
        />

        {loading ? (
          <div className="flex flex-col items-center gap-3 py-4">
            <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Decoding secure local buffer...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600 dark:bg-slate-950 dark:text-slate-400 dark:group-hover:bg-indigo-950 dark:group-hover:text-indigo-400 transition-colors">
              <UploadCloud className="h-7 w-7" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-medium text-slate-800 dark:text-slate-200">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold group-hover:underline">
                  Click to upload
                </span>{" "}
                or drag and drop document
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{helperText}</p>
              <p className="text-xxs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-wider mt-2">
                Maximum File size limit: {maxSizeMB}MB
              </p>
            </div>
          </>
        )}
      </div>

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-sm text-rose-600 dark:bg-rose-950/20 dark:text-rose-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold block">Uploading Failed</span>
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
}
