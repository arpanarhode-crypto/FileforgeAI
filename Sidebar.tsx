export type Page = 'home' | 'dashboard' | 'pdf-tools' | 'ocr-tools' | 'ai-tools' | 'translation-tools' | 'pdf-chat' | 'resume-analyzer' | 'smart-notes' | 'batch-process' | 'admin-dashboard';

export type Theme = 'light' | 'dark' | 'system';

export interface DocuTool {
  id: string;
  name: string;
  description: string;
  category: 'pdf' | 'ocr' | 'ai';
  iconName: string;
  color: string;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  base64: string; // Base64 encoding for upload
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'processing' | 'processed';
  error?: string;
  resultUrl?: string; // If processed file is ready for download
  resultName?: string;
  resultBase64?: string; // Cache output base64 for instant preview/download
  resultText?: string; // For OCR / Summaries
}

export interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface User {
  id: string;
  email: string;
  plan: 'free' | 'premium';
  createdAt: string;
}

export interface UsageLimits {
  isPremium: boolean;
  conversionsLeft: number;
  conversionsPerToolUsed: Record<string, number>;
  ocrLeft: number;
  ocrUsed: number;
  translationWordsLeft: number;
  translationWordsUsed: number;
  lastResetTime: string;
}

export interface HistoryItem {
  id: string;
  toolType: string;
  inputName: string;
  outputName: string;
  timestamp: string;
  status: 'success' | 'failed';
}
