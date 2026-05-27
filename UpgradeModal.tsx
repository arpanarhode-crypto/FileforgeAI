import React, { useState, useEffect } from "react";
import { User, UsageLimits } from "../types";
import { apiFetch } from "../utils";
import { 
  User as UserIcon, 
  LogIn, 
  UserPlus, 
  Key, 
  Crown, 
  LogOut, 
  Clock, 
  ShieldAlert, 
  Activity, 
  Coins, 
  Sparkles, 
  HelpCircle,
  TrendingUp,
  Award
} from "lucide-react";

interface AccountMenuProps {
  user: User | null;
  limits: UsageLimits | null;
  onLoginSuccess: (user: User, token: string) => void;
  onLogout: () => void;
  onRefreshLimits: () => void;
  onOpenUpgradeModal: () => void;
}

export default function AccountMenu({ 
  user, 
  limits, 
  onLoginSuccess, 
  onLogout, 
  onRefreshLimits,
  onOpenUpgradeModal
}: AccountMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  // Close dropdown on click outside
  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("#account-menu-container")) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isOpen]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setInfoMsg('');

    try {
      if (authMode === 'login') {
        const res = await apiFetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Authentication failure.');
        onLoginSuccess(data.user, data.token);
        setIsOpen(false);
        setPassword('');
      } else if (authMode === 'signup') {
        const res = await apiFetch('/api/auth/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Registration failure.');
        onLoginSuccess(data.user, data.token);
        setIsOpen(false);
        setPassword('');
      } else {
        const res = await apiFetch('/api/auth/forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to dispatch recovery request.');
        setInfoMsg(data.message || 'Recovery email dispatched simulation.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const getGuestId = () => {
    let gid = localStorage.getItem("fileforge-guest-id");
    if (!gid) {
      gid = Math.random().toString(36).substring(2, 11);
      localStorage.setItem("fileforge-guest-id", gid);
    }
    return gid;
  };

  const isPremium = user?.plan === 'premium' || limits?.isPremium;

  return (
    <div className="relative" id="account-menu-container">
      {/* Primary Trigger Button */}
      <div className="flex items-center gap-2">
        {!isPremium && (
          <button 
            onClick={onOpenUpgradeModal}
            className="hidden items-center gap-1 px-3 py-1.5 rounded-full text-xxs font-extrabold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-sm hover:shadow active:scale-95 transition-all md:flex cursor-pointer"
          >
            <Crown className="h-3.5 w-3.5 animate-bounce" />
            <span>Go Premium</span>
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center gap-2 rounded-xl border p-1.5 transition-all cursor-pointer ${
            isOpen 
              ? "border-indigo-600 bg-indigo-50/50 dark:border-indigo-400/50 dark:bg-indigo-950/20" 
              : "border-slate-200 hover:bg-slate-55 dark:border-slate-800 dark:hover:bg-slate-900"
          }`}
          id="account-menu-btn"
          title="Account Status"
        >
          {/* Avatar frame */}
          <div className={`flex h-7.5 w-7.5 items-center justify-center rounded-lg font-bold text-xs ${
            isPremium
              ? "bg-gradient-to-tr from-amber-500 to-orange-400 text-white shadow-sm sm:ring-2 sm:ring-amber-500/20"
              : "bg-indigo-65 text-indigo-100 dark:bg-slate-800 dark:text-slate-300"
          }`}>
            {user ? user.email.substring(0, 2).toUpperCase() : <UserIcon className="h-4 w-4" />}
          </div>

          <div className="hidden pr-2 text-left md:block">
            <p className="max-w-[120px] truncate text-xxs font-bold text-slate-800 dark:text-slate-250 leading-none">
              {user ? user.email : "Guest Account"}
            </p>
            <p className="mt-0.5 text-[9px] font-extrabold tracking-wider uppercase text-slate-400 dark:text-slate-500 leading-none flex items-center gap-0.5">
              {isPremium ? (
                <span className="text-amber-600 dark:text-amber-500 flex items-center gap-0.5 font-bold">
                  <Crown className="h-2 w-2" /> Pro Plan
                </span>
              ) : (
                "Free Basic"
              )}
            </p>
          </div>
        </button>
      </div>

      {/* Dropdown Floating Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-5 shadow-xl dark:border-slate-800 dark:bg-[#0c101c] z-50 animate-in fade-in slide-in-from-top-3 duration-200">
          {user ? (
            /* Logged-In Interface: Limits Stats & Actions */
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100">
                    SaaS Account Profile
                  </h4>
                  <p className="text-xxs text-slate-555 dark:text-slate-400 break-all max-w-[210px]">
                    {user.email}
                  </p>
                </div>
                <div className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-wider ${
                  isPremium 
                    ? "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-400" 
                    : "bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-400"
                }`}>
                  {isPremium ? "Pro Tier" : "Free Plan"}
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-900 pt-3 space-y-3">
                <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-400 dark:text-slate-500">
                  Remaining Usage Limits
                </span>

                {/* Progress bar tracking translations */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xxs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">Translation Words</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {isPremium ? "Unlimited" : `${limits ? limits.translationWordsLeft : 800} / 800 left`}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-indigo-500 relative transition-all duration-500"
                      style={{ width: isPremium ? '100%' : `${limits ? Math.max(5, (limits.translationWordsLeft / 800) * 100) : 100}%` }}
                    />
                  </div>
                </div>

                {/* Progress bar tracking OCR scans */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xxs font-medium">
                    <span className="text-slate-500 dark:text-slate-400">OCR Scans</span>
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      {isPremium ? "Unlimited" : `${limits ? limits.ocrLeft : 5} / 5 left`}
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-900 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: isPremium ? '100%' : `${limits ? Math.max(5, (limits.ocrLeft / 5) * 100) : 100}%` }}
                    />
                  </div>
                </div>

                {/* Tool Daily Limit Counter info line */}
                <div className="rounded-xl bg-slate-50/50 p-2 border border-slate-100 dark:bg-slate-950/40 dark:border-slate-900 text-xxs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                  <Activity className="h-4 w-4 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-normal">
                    {isPremium ? (
                      "All PDF Forge features conversion, translation, OCR limits and image scaling capabilities are 100% unlocked."
                    ) : (
                      "Free plan grants 10 daily document conversions per tool with dynamic watermark overlays enabled."
                    )}
                  </p>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-900 pt-3 flex flex-col gap-2">
                {!isPremium && (
                  <button
                    onClick={() => {
                      onOpenUpgradeModal();
                      setIsOpen(false);
                    }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-500 hover:from-indigo-700 hover:to-violet-600 p-2.5 text-xs font-bold text-white shadow-md cursor-pointer"
                  >
                    <Crown className="h-4 w-4" />
                    <span>Get Pro License</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 hover:bg-slate-55 p-2 text-xs font-bold text-rose-600 dark:border-slate-800 dark:hover:bg-slate-900 shadow-sm cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Log Out Account</span>
                </button>
              </div>
            </div>
          ) : (
            /* Auth Form (Login / Register / Forgot Password) */
            <form onSubmit={handleAuthSubmit} className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-plat-50 dark:border-slate-900 pb-2">
                <span className="text-xs font-black uppercase text-slate-800 dark:text-slate-205 flex items-center gap-2">
                  {authMode === 'login' && <LogIn className="h-4 w-4 text-indigo-505" />}
                  {authMode === 'signup' && <UserPlus className="h-4 w-4 text-indigo-505" />}
                  {authMode === 'forgot' && <Key className="h-4 w-4 text-indigo-505" />}
                  {authMode === 'login' && "Authentication Portal"}
                  {authMode === 'signup' && "Create Account"}
                  {authMode === 'forgot' && "Recover Password"}
                </span>

                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                  FileForge SaaS
                </span>
              </div>

              {errorMsg && (
                <div className="rounded-lg bg-rose-50 border border-rose-100 p-2 text-xxs text-rose-700 dark:bg-rose-950/20 dark:border-rose-900 flex items-center gap-1.5 leading-snug">
                  <ShieldAlert className="h-4 w-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {infoMsg && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-2 text-xxs text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-900 flex items-center gap-1.5 leading-snug">
                  <Activity className="h-4 w-4 flex-shrink-0" />
                  <span>{infoMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest pl-1">
                  Mail Address
                </label>
                <input 
                  type="email" 
                  required
                  placeholder="e.g. developer@fileforge.ai"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50 dark:border-slate-850 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-slate-200"
                />
              </div>

              {authMode !== 'forgot' && (
                <div className="space-y-1">
                  <label className="text-xxs font-bold text-slate-500 uppercase tracking-widest pl-1 flex justify-between">
                    <span>Password</span>
                    {authMode === 'login' && (
                      <button 
                        type="button"
                        onClick={() => { setAuthMode('forgot'); setErrorMsg(''); }}
                        className="text-[10px] text-indigo-500 hover:text-indigo-600 hover:underline cursor-pointer"
                      >
                        Forgot Pass?
                      </button>
                    )}
                  </label>
                  <input 
                    type="password" 
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs bg-slate-50 dark:border-slate-850 dark:bg-slate-950 focus:border-indigo-500 focus:outline-none dark:text-slate-200"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-opacity-50 p-2.5 text-xs font-bold text-white shadow-md active:scale-98 transition-all cursor-pointer"
              >
                {loading ? (
                  <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    {authMode === 'login' && <LogIn className="h-4 w-4" />}
                    {authMode === 'signup' && <UserPlus className="h-4 w-4" />}
                    <span>{authMode === 'login' ? "Access Console" : authMode === 'signup' ? "Create Professional Profile" : "Dispatch Verification"}</span>
                  </>
                )}
              </button>

              <div className="flex justify-center text-xxs font-semibold text-slate-400 pt-2 border-t border-slate-50 dark:border-slate-900 mt-2">
                {authMode === 'login' ? (
                  <p>
                    New user account?{" "}
                    <button 
                      type="button"
                      onClick={() => { setAuthMode('signup'); setErrorMsg(''); }}
                      className="text-indigo-500 hover:underline hover:text-indigo-600 font-bold cursor-pointer"
                    >
                      Sign Up Free
                    </button>
                  </p>
                ) : (
                  <p>
                    Already registered?{" "}
                    <button 
                      type="button"
                      onClick={() => { setAuthMode('login'); setErrorMsg(''); }}
                      className="text-indigo-500 hover:underline hover:text-indigo-600 font-bold cursor-pointer"
                    >
                      Login Profile
                    </button>
                  </p>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
