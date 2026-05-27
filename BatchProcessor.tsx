import React, { useState, useEffect, useRef } from "react";
import { 
  Send, 
  FileText, 
  Sparkles, 
  Plus, 
  MessageSquare, 
  ChevronRight, 
  Loader2, 
  Bot, 
  User, 
  ExternalLink,
  Volume2
} from "lucide-react";
import { apiFetch } from "../utils";

interface Message {
  role: "user" | "model";
  content: string;
  timestamp: string;
  citations?: string[];
}

interface ChatSession {
  id: string;
  fileName: string;
  title: string;
  createdAt: string;
  messages: Message[];
}

interface AIChatWithPDFProps {
  onAddToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function AIChatWithPDF({ onAddToast }: AIChatWithPDFProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [uploading, setUploading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Suggestions
  const suggestionPrompts = [
    "Provide a detailed bulleted summary of this document.",
    "What are the most critical takeaways or conclusions?",
    "List all dates, numbers, or specific statistics mentioned.",
    "What gaps/limitations does this file address?"
  ];

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const res = await apiFetch("/api/chat-pdf/sessions");
      const data = await res.json();
      if (data.success) {
        setSessions(data.sessions || []);
        if (data.sessions?.length > 0 && !activeSessionId) {
          handleSelectSession(data.sessions[0]);
        }
      }
    } catch (_) {
      onAddToast("Could not load conversational history.", "error");
    }
  };

  const handleSelectSession = (sess: ChatSession) => {
    setActiveSessionId(sess.id);
    setMessages(sess.messages || []);
    setTimeout(() => scrollToBottom(), 100);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    onAddToast(`Indexing ${file.name}...`, "info");

    try {
      const b64 = await toBase64(file);
      const res = await apiFetch("/api/chat-pdf/session", {
        method: "POST",
        body: JSON.stringify({
          fileName: file.name,
          fileBase64: b64
        })
      });
      const data = await res.json();

      if (data.success) {
        onAddToast(`"${file.name}" indexed successfully!`, "success");
        setSessions(prev => [data.session, ...prev]);
        setActiveSessionId(data.session.id);
        setMessages([]);
      } else {
        onAddToast(data.error || "Workspace was unable to extract layout text.", "error");
      }
    } catch (_) {
      onAddToast("Upload failed.", "error");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
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

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || !activeSessionId || sending) return;

    const userMessage: Message = {
      role: "user",
      content: textToSend,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setSending(true);
    setTimeout(() => scrollToBottom(), 50);

    try {
      const res = await apiFetch("/api/chat-pdf/message", {
        method: "POST",
        body: JSON.stringify({
          chatId: activeSessionId,
          message: textToSend
        })
      });
      const data = await res.json();

      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        setTimeout(() => scrollToBottom(), 50);
        
        // Update session in list
        setSessions(prev => prev.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...(s.messages || []), userMessage, data.message]
            };
          }
          return s;
        }));
      } else {
        onAddToast(data.error || "Failed to retrieve chatbot answer.", "error");
      }
    } catch (_) {
      onAddToast("Connection failure.", "error");
    } finally {
      setSending(false);
    }
  };

  const startNewChat = () => {
    fileInputRef.current?.click();
  };

  const handleReadAloud = (content: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(content);
      window.speechSynthesis.speak(utterance);
      onAddToast("Speech playback engaged.", "info");
    } else {
      onAddToast("Web text-to-speech API not supported in browser.", "error");
    }
  };

  const currentActiveSessionName = sessions.find(s => s.id === activeSessionId)?.fileName || "";

  // Dynamic filter query search over message history
  const filteredMessages = messages.filter(m => 
    !searchQuery || m.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[680px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden" id="pdf-chat-container">
      
      {/* Sidebar: History */}
      <div className="lg:col-span-1 border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 p-4 flex flex-col gap-4">
        <button
          onClick={startNewChat}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/50 text-white font-semibold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
          id="btn-upload-chat-pdf"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <Plus className="h-4 w-4" />
              <span>Index Document</span>
            </>
          )}
        </button>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          accept=".pdf,.docx,.txt" 
          className="hidden" 
        />

        <div className="flex-1 overflow-y-auto space-y-2">
          <span className="text-[10px] font-mono tracking-widest uppercase text-slate-400 block font-semibold mb-2">
            CONVERSATIONS ({sessions.length})
          </span>
          {sessions.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No index chat matches. Upload a document to forge a session.
            </div>
          ) : (
            sessions.map(sess => {
              const isActive = sess.id === activeSessionId;
              return (
                <button
                  key={sess.id}
                  onClick={() => handleSelectSession(sess)}
                  className={`w-full flex items-start gap-2.5 p-3 rounded-xl text-left transition-all text-xs cursor-pointer ${
                    isActive 
                      ? "bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 shadow-xs scale-[1.01]" 
                      : "hover:bg-slate-100 dark:hover:bg-slate-800/40"
                  }`}
                >
                  <MessageSquare className={`h-4 w-4 mt-0.5 flex-shrink-0 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                  <div className="flex-1 overflow-hidden">
                    <p className={`font-semibold truncate ${isActive ? "text-slate-900 dark:text-slate-100" : "text-slate-600 dark:text-slate-400"}`}>
                      {sess.fileName}
                    </p>
                    <span className="text-[9px] text-slate-400 block font-mono mt-0.5">
                      {new Date(sess.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-slate-300 self-center" />
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Conversational Workspace */}
      <div className="lg:col-span-3 flex flex-col h-full relative" id="chat-workspace">
        
        {/* Workspace Top Header Element */}
        <div className="border-b border-slate-250 dark:border-slate-800 p-4 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {currentActiveSessionName || "FileForge Document Intelligence"}
              </h2>
              <p className="text-[10px] text-slate-400 font-medium">
                {activeSessionId ? "Conversational Model Active" : "Upload standard PDF, DOCX or TXT files"}
              </p>
            </div>
          </div>

          {activeSessionId && (
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-100 dark:border-slate-800">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search keywords..."
                className="bg-transparent border-0 outline-0 text-[11px] font-medium text-slate-600 px-1 w-28 md:w-36"
              />
            </div>
          )}
        </div>

        {/* Message Space */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50 dark:bg-slate-900/40 h-full">
          {!activeSessionId ? (
            <div className="flex flex-col items-center justify-center text-center h-full max-w-sm mx-auto space-y-4">
              <div className="h-16 w-16 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 flex items-center justify-center shadow-lg border border-indigo-100/30">
                <Sparkles className="h-8 w-8 text-indigo-600 animate-pulse" />
              </div>
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">Start Your Analysis</h3>
              <p className="text-xs text-slate-500 leading-relaxed font-normal">
                Simply index any PDF or DOCX file. Our high-fidelity transmission parses and prepares your material for questions, section citations, and summaries.
              </p>
              <button
                onClick={startNewChat}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-lg transition-transform hover:scale-[1.02] cursor-pointer"
              >
                Select File
              </button>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center h-full max-w-sm mx-auto space-y-4">
              <Bot className="h-10 w-10 text-indigo-600 animate-bounce" />
              <div>
                <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-250">File Indexed Correctly!</h4>
                <p className="text-xxs text-slate-400 mt-1 font-medium">
                  What would you like to review? Pick an instant suggestion or type below.
                </p>
                
                <div className="grid grid-cols-1 gap-2 mt-4 text-left">
                  {suggestionPrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(p)}
                      className="w-full text-left p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 rounded-xl text-[11px] font-medium text-slate-600 dark:text-slate-350 hover:bg-slate-50/50 transition-all cursor-pointer shadow-xs"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            filteredMessages.map((msg, idx) => {
              const isBot = msg.role === "model";
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-[85%] ${isBot ? "mr-auto" : "ml-auto flex-row-reverse"}`}
                >
                  <div className={`h-8 w-8 rounded-full flex-shrink-0 flex items-center justify-center shadow-xs border ${
                    isBot 
                      ? "bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700" 
                      : "bg-indigo-600 border-indigo-500 text-white"
                  }`}>
                    {isBot ? <Bot className="h-4 w-4 text-slate-700 dark:text-slate-300" /> : <User className="h-4 w-4" />}
                  </div>

                  <div className={`p-4 rounded-3xl text-xs leading-relaxed space-y-2 ${
                    isBot 
                      ? "bg-white dark:bg-slate-820 text-slate-810 dark:text-slate-100 shadow-sm border border-slate-200/40 dark:border-slate-800/40" 
                      : "bg-indigo-600 text-white shadow-md font-medium"
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {isBot && (
                      <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-2 mt-2">
                        <button
                          onClick={() => handleReadAloud(msg.content)}
                          className="flex items-center gap-1 text-[9px] font-medium text-slate-400 hover:text-indigo-500 transition-colors cursor-pointer"
                          title="Read message contents aloud"
                        >
                          <Volume2 className="h-3.5 w-3.5" />
                          <span>Speak</span>
                        </button>
                        <span className="text-[9px] text-slate-400 font-mono">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}

          {sending && (
            <div className="flex gap-3 max-w-[85%] mr-auto">
              <div className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200/50 dark:border-slate-700/50">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
              </div>
              <div className="p-4 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 shadow-sm">
                <p className="text-xxs font-mono text-slate-400 dark:text-slate-500 uppercase tracking-widest animate-pulse">
                  Gemini-3.5-Flash processing context...
                </p>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Interface Area */}
        {activeSessionId && (
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              placeholder="Ask a question about this document..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-2xl px-4 text-xs focus:ring-2 focus:ring-indigo-500/20 focus:outline-none focus:border-indigo-500 font-medium text-slate-800 dark:text-slate-200"
              id="chat-pdf-input"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || sending}
              className="h-10 w-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500/20 disabled:text-slate-400 text-white rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-[1.03] disabled:scale-100 cursor-pointer flex-shrink-0"
              id="btn-send-chat"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
