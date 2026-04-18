'use client';

import { usePathname } from 'next/navigation';

export default function TopNav() {
  const pathname = usePathname();

  if (pathname === '/login') {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-lg flex items-center justify-center border border-white/20">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" x2="12" y1="19" y2="22"/>
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight">Auralis Health</h1>
            <p className="text-[10px] text-white/50 -mt-1 font-medium">Clinical Voice Copilot</p>
          </div>
        </div>

        {/* Doctor info */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-success-500/20 border border-success-500/30 rounded-full">
            <span className="w-2 h-2 bg-success-400 rounded-full animate-pulse"></span>
            <span className="text-xs text-success-300 font-medium tracking-wide">Sistema activo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">Dr. Martínez</p>
              <p className="text-[10px] text-white/50">Medicina Interna</p>
            </div>
            <div className="w-9 h-9 bg-white/10 border border-white/20 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-white">DM</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
