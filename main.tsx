@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');
@import "tailwindcss";

@theme {
  --font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;
  --font-display: "Space Grotesk", sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
}

/* Base resets & custom transitions fallback */
body {
  font-family: var(--font-sans);
  background-color: #f8fafc; /* Slate background for light mode */
  color: #0f172a;
  transition: background-color 0.3s ease, color 0.3s ease;
}

body.dark {
  background-color: #09090b; /* Sophisticated Dark zinc-950 main background */
  color: #f4f4f5;
}

/* Specific elements background adjustments for light/dark */
body.dark header {
  background-color: rgba(12, 12, 14, 0.85) !important;
  border-color: rgba(255, 255, 255, 0.06) !important;
}

body.dark aside {
  background-color: #0c0c0e !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
}

body.dark main {
  background-color: #09090b !important;
}

body.dark .rounded-2xl.border, body.dark .rounded-xl.border {
  border-color: rgba(255, 255, 255, 0.06) !important;
}

body.dark .bg-white {
  background-color: #111113 !important;
}

body.dark .bg-slate-50 {
  background-color: #0d0d0f !important;
}

body.dark .bg-slate-50\/50 {
  background-color: rgba(12, 12, 14, 0.5) !important;
}

body.dark .border-slate-200, body.dark .border-slate-150, body.dark .border-slate-100 {
  border-color: rgba(255, 255, 255, 0.06) !important;
}

body.dark .text-slate-800 {
  color: #f4f4f5 !important;
}

body.dark .text-slate-700 {
  color: #e4e4e7 !important;
}

body.dark .text-slate-650, body.dark .text-slate-600 {
  color: #d4d4d8 !important;
}

body.dark .text-slate-500 {
  color: #a1a1aa !important;
}

body.dark .bg-indigo-50 {
  background-color: rgba(79, 70, 229, 0.15) !important;
}

body.dark .bg-indigo-50\/30 {
  background-color: rgba(79, 70, 229, 0.08) !important;
}

body.dark .bg-emerald-58, body.dark .bg-emerald-50\/15, body.dark .bg-emerald-50\/20 {
  background-color: rgba(16, 185, 129, 0.08) !important;
}

body.dark .bg-rose-58, body.dark .bg-rose-50 {
  background-color: rgba(244, 63, 94, 0.08) !important;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}
body.dark ::-webkit-scrollbar-thumb {
  background: #27272a;
}
::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}
body.dark ::-webkit-scrollbar-thumb:hover {
  background: #3f3f46;
}


