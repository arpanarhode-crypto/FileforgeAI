import { useState } from "react";
import { X, Crown, CheckCircle2, Star, ShieldCheck, HeartHandshake, Zap, Loader } from "lucide-react";
import { apiFetch } from "../utils";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradeSuccess: (newPlan: 'premium') => void;
}

export default function UpgradeModal({ isOpen, onClose, onUpgradeSuccess }: UpgradeModalProps) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpgradePayment = async () => {
    setLoading(true);
    try {
      // Direct high fidelity connection to our simulated express backend /api/upgrade endpoint!
      const res = await apiFetch("/api/upgrade", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' }
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upgrade subscription failed.");

      // Success animation delay
      setTimeout(() => {
        setSuccess(true);
        setLoading(false);
        onUpgradeSuccess('premium');
      }, 1500);

    } catch (err: any) {
      alert(`Simulation error: ${err.message || "Failed to make secure sandbox payments."}`);
      setLoading(false);
    }
  };

  const proFeaturesList = [
    { title: "Infinite Document Conversions", desc: "Remove all limits on Word/PDF/Image transfers" },
    { title: "High-Fidelity Optical OCR", desc: "No daily limit on OCR text layout extractions" },
    { title: "No Watermarks Worldwide", desc: "All compiled PDFs generated pristine and high definition" },
    { title: "Advanced Translation Space", desc: "Translate unlimited texts and documents in major Indian languages" },
    { title: "Expanded Upload Sizes", desc: "Upload and split files exceeding 20MB without speed caps" },
    { title: "Priority AI GPU Processing", desc: "Bypass any sandbox queues with immediate thread execution" },
    { title: "SaaS Cloud Sync Saved History", desc: "Track conversions, previews, and historical logs permanently" }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* Central modal card */}
      <div className="relative w-full max-w-lg overflow-hidden bg-white dark:bg-[#0c101c] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 text-slate-900 dark:text-slate-100">
        
        {/* Absolute design accents */}
        <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/10 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 bg-violet-500/10 dark:bg-violet-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-5 right-5 h-8 w-8 flex items-center justify-center rounded-xl bg-slate-50 border border-slate-150 hover:bg-slate-100 text-slate-500 dark:bg-slate-950 dark:border-slate-900 dark:hover:bg-slate-900 dark:text-slate-400 cursor-pointer"
          title="Dismiss Modal"
        >
          <X className="h-4 w-4" />
        </button>

        {!success ? (
          <div>
            {/* Header frame */}
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-md">
                <Crown className="h-6 w-6 animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-600 dark:text-amber-500">
                  Premium Access Upgrade
                </span>
                <h3 className="text-lg font-black tracking-tight font-display text-slate-850 dark:text-white leading-tight">
                  Unlock FileForge Pro Studio
                </h3>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
              Join thousands of developers, researchers, and creators. Elevate your document workflows without watermarks, artificial usage delays, or file volume blocks.
            </p>

            {/* List of features */}
            <div className="mt-5 space-y-3.5 max-h-[240px] overflow-y-auto pr-1">
              {proFeaturesList.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="mt-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 flex-shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <h5 className="text-xxs font-black text-slate-850 dark:text-slate-200 uppercase tracking-widest">
                      {item.title}
                    </h5>
                    <p className="text-xxs text-slate-400 dark:text-slate-500 font-medium">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Price section and Payment Trigger Button */}
            <div className="mt-7 border-t border-slate-100 dark:border-slate-900 pt-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">
                  Total One-Time Price
                </p>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black font-display tracking-tight text-slate-800 dark:text-white">
                    ₹499
                  </span>
                  <span className="text-xxs text-slate-500 dark:text-slate-400 font-medium">
                    / life access
                  </span>
                </div>
              </div>

              <button
                onClick={handleUpgradePayment}
                disabled={loading}
                className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-65 text-white shadow-lg p-3 px-6 text-xs font-bold leading-none active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin text-white" />
                    <span>Processing Secure Pay...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 animate-bounce" />
                    <span>Purchase Pro License</span>
                  </>
                )}
              </button>
            </div>

            {/* Payment security badges */}
            <div className="mt-4 flex items-center justify-center gap-4 text-[9px] font-semibold text-slate-400 dark:text-slate-500 leading-none">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Razorpay Handshake
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <HeartHandshake className="h-3.5 w-3.5 text-emerald-500" /> Cancel Anytime
              </span>
            </div>

          </div>
        ) : (
          /* Payment Success interface */
          <div className="py-6 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white shadow-lg animate-bounce">
              <Star className="h-8 w-8" />
            </div>

            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">
                Payment Completed!
              </span>
              <h3 className="text-lg font-black tracking-tight font-display text-slate-850 dark:text-white mt-1">
                Welcomes to Professional Tier!
              </h3>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto font-medium">
                Your sandbox account subscription payload has successfully transitioned to **Pro License**. Your file sizes, translation capacities, and optical OCR capabilities are now 100% unrestricted.
              </p>
            </div>

            <div className="pt-3">
              <button
                onClick={onClose}
                className="w-full rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 p-3 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer"
              >
                Launch Professional Console
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
