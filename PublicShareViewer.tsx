import React, { useState, useEffect } from "react";
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Database,
  RefreshCw, 
  ShieldAlert, 
  Share2, 
  MessageSquare,
  Sparkles,
  Search,
  Filter
} from "lucide-react";
import { apiFetch } from "../utils";

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  freeUsers: number;
  activeSubConversions: number;
  totalRevenue: number;
  failedConversionCount: number;
  totalJobs: number;
  ocrUsageCount: number;
  translationUsageCount: number;
  notesUsageCount: number;
  chatPdfUsageCount: number;
  totalShares: number;
  totalChats: number;
  toolUsageBreakdown: Record<string, number>;
  dailyRegistrations: Record<string, number>;
  dailyRevenue: Record<string, number>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [userQuery, setUserQuery] = useState("");
  const [toolFilter, setToolFilter] = useState("all");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/admin/analytics");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const getMetricIcon = (label: string) => {
    if (label.includes("Revenue")) return DollarSign;
    if (label.includes("User")) return Users;
    if (label.includes("conversions")) return TrendingUp;
    return Database;
  };

  if (loading) {
    return (
      <div className="flex h-96 w-full items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const items = stats ? [
    { label: "Aggregate Registered Users", value: stats.totalUsers, desc: `${stats.premiumUsers} premium, ${stats.freeUsers} free users`, color: "from-blue-600 to-indigo-600", tag: "users" },
    { label: "Premium Pro Subscribers", value: stats.premiumUsers, desc: `Premium conversion rate is ${stats.totalUsers > 0 ? ((stats.premiumUsers / stats.totalUsers) * 100).toFixed(1) : 0}%`, color: "from-emerald-600 to-teal-600", tag: "conversions" },
    { label: "SaaS Cumulative Revenue", value: `₹${stats.totalRevenue}`, desc: `Generated from standard premium model sales`, color: "from-amber-600 to-orange-600", tag: "revenue" },
    { label: "Operational Conversions", value: stats.totalJobs, desc: `Failed conversions count: ${stats.failedConversionCount}`, color: "from-pink-600 to-rose-600", tag: "jobs" }
  ] : [];

  return (
    <div className="space-y-6" id="admin-analytics-dashboard">
      
      {/* Intro Header */}
      <div className="flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-lg">
        <div>
          <div className="flex items-center gap-3">
            <TrendingUp className="h-7 w-7 text-indigo-400" />
            <h1 className="text-xl md:text-2xl font-bold font-display tracking-tight">Admin Operations Console</h1>
          </div>
          <p className="text-xs md:text-sm text-slate-300 font-medium mt-1">
            Standard metrics, payment audits, shared linkages, and background operations logs.
          </p>
        </div>
        <button
          onClick={fetchStats}
          className="p-3 bg-white/10 hover:bg-white/15 border border-white/10 rounded-2xl cursor-pointer"
        >
          <RefreshCw className="h-4.5 w-4.5 text-white" />
        </button>
      </div>

      {/* Grid counters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {items.map((it, idx) => {
          const Icon = getMetricIcon(it.label);
          return (
            <div 
              key={idx} 
              className="p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl shadow-xs space-y-3"
            >
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{it.label}</span>
                <div className={`h-8 w-8 bg-gradient-to-r ${it.color} text-white rounded-xl flex items-center justify-center shadow-xs`}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-805 dark:text-slate-105 font-display">{it.value}</h3>
                <span className="text-xxs leading-snug font-medium text-slate-400 block mt-1">{it.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Tool Breakdowns */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Tool Breakdown lists */}
          <div className="md:col-span-1 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Tools Usage Breakdown</h3>
            <div className="space-y-3">
              {[
                { name: "Vision OCR", count: stats.ocrUsageCount, percent: stats.totalJobs > 0 ? (stats.ocrUsageCount / stats.totalJobs) * 100 : 0, color: "bg-indigo-600" },
                { name: "AI Translation Studio", count: stats.translationUsageCount, percent: stats.totalJobs > 0 ? (stats.translationUsageCount / stats.totalJobs) * 100 : 0, color: "bg-pink-600" },
                { name: "Smart Notes Generator", count: stats.notesUsageCount, percent: stats.totalJobs > 0 ? (stats.notesUsageCount / stats.totalJobs) * 100 : 0, color: "bg-teal-600" },
                { name: "AI PDF Chat Sessions", count: stats.chatPdfUsageCount, percent: stats.totalJobs > 0 ? (stats.chatPdfUsageCount / stats.totalJobs) * 100 : 0, color: "bg-orange-500" }
              ].map((sub, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xxs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">{sub.name}</span>
                    <span className="text-slate-900 dark:text-slate-250">{sub.count} hits</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-820 rounded-full h-1.5 overflow-hidden">
                    <div className={`${sub.color} h-1.5 rounded-full`} style={{ width: `${sub.percent}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Registrations & Revenue Details lists */}
          <div className="md:col-span-2 p-5 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-3xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Recent Growth Indexes</h3>
              <div className="flex gap-2 text-[10px] uppercase font-mono text-slate-400 font-bold">
                <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> Shares: {stats.totalShares}</span>
                <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> Chat Sessions: {stats.totalChats}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Registration list */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Daily Integrations</span>
                <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-100 dark:border-slate-850 p-2.5 rounded-2xl">
                  {Object.entries(stats.dailyRegistrations).length === 0 ? (
                    <p className="text-xxs text-slate-400 text-center py-4">No recent integrations.</p>
                  ) : (
                    Object.entries(stats.dailyRegistrations).map(([day, val]) => (
                      <div key={day} className="flex justify-between text-xxs font-mono font-medium border-b border-slate-100 dark:border-slate-850/40 pb-1.5 last:border-0">
                        <span className="text-slate-500">{day}</span>
                        <span className="text-slate-800 dark:text-slate-200">{val} new users</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Revenue list */}
              <div className="space-y-2">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Daily Invoicing</span>
                <div className="max-h-36 overflow-y-auto space-y-1 border border-slate-100 dark:border-slate-850 p-2.5 rounded-2xl">
                  {Object.entries(stats.dailyRevenue).length === 0 ? (
                    <p className="text-xxs text-slate-400 text-center py-4">No payments captured.</p>
                  ) : (
                    Object.entries(stats.dailyRevenue).map(([day, val]) => (
                      <div key={day} className="flex justify-between text-xxs font-mono font-medium border-b border-slate-100 dark:border-slate-850/40 pb-1.5 last:border-0">
                        <span className="text-slate-500">{day}</span>
                        <span className="text-emerald-600 dark:text-emerald-400">+₹{val}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      )}

      {/* Safety System logs details */}
      <div className="bg-indigo-50/10 border border-slate-200 dark:border-slate-850 p-5 rounded-3xl flex gap-3 text-slate-650 dark:text-slate-350">
        <ShieldAlert className="h-5 w-5 text-indigo-500 flex-shrink-0 mt-0.5" />
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">System Telemetry & Protection</h4>
          <p className="text-xxs leading-relaxed font-semibold mt-1">
            FileForge local JSON state acts as a single point of truth inside this development run sandbox. All usage tracking registers automatically, and active locks safely prevent file storage leak behaviors during continuous iterations.
          </p>
        </div>
      </div>

    </div>
  );
}
