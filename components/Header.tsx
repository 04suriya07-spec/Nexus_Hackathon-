'use client';

import React, { useEffect, useState } from 'react';
import { ShieldCheck, Wifi, Clock, ArrowLeft, Database, HardDriveDownload } from 'lucide-react';

interface HeaderProps {
  isOfflineMode: boolean;
  onToggleOffline: () => void;
}

export function Header({ isOfflineMode, onToggleOffline }: HeaderProps) {
  const [istTime, setIstTime] = useState<string>('--:--:-- IST');
  const [utcTime, setUtcTime] = useState<string>('--:--:-- UTC');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setIstTime(
        now.toLocaleTimeString('en-IN', {
          timeZone: 'Asia/Kolkata',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' IST'
      );
      setUtcTime(
        now.toLocaleTimeString('en-GB', {
          timeZone: 'UTC',
          hour12: false,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }) + ' UTC'
      );
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="border-b border-[#1E3354] bg-[#050A12]/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Left: Emblem & Title */}
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 rounded-lg bg-[#0B1526] border border-[#1E3354] flex items-center justify-center p-1.5 shadow-inner">
              {/* National Emblem simplified SVG */}
              <svg className="w-full h-full text-[#13B5EA]" viewBox="0 0 100 130" fill="currentColor">
                <path d="M50 0 C45 10 35 15 30 25 C25 35 30 50 35 60 C30 65 25 75 30 85 C35 95 45 100 50 110 C55 100 65 95 70 85 C75 75 70 65 65 60 C70 50 75 35 70 25 C65 15 55 10 50 0 Z" opacity="0.9" />
                <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="4" />
                <line x1="50" y1="36" x2="50" y2="64" stroke="currentColor" strokeWidth="2" />
                <line x1="36" y1="50" x2="64" y2="50" stroke="currentColor" strokeWidth="2" />
                <path d="M20 115 L80 115 L85 125 L15 125 Z" fill="currentColor" />
              </svg>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-wide">
                  POLARIS <span className="text-[#13B5EA] font-semibold text-sm">SUPPORT DESK</span>
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-[#101F38] text-[#13B5EA] border border-[#1E3354]">
                  44-ISEA EXPEDITION
                </span>
              </div>
              <p className="text-xs text-slate-400">
                National Centre for Polar &amp; Ocean Research (NCPOR), MoES, Govt. of India
              </p>
            </div>
          </div>

          {/* Right: Telemetry Clocks, Back link, SATCOM mode */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            
            {/* Clocks */}
            <div className="hidden md:flex flex-col items-end text-xs font-mono">
              <span className="text-slate-300 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#13B5EA]" /> {istTime}
              </span>
              <span className="text-slate-500">{utcTime} (Station)</span>
            </div>

            {/* Offline/SATCOM Status Pill */}
            <button
              onClick={onToggleOffline}
              title="Click to simulate SATCOM connection drop and Edge Cache Mode"
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                isOfflineMode
                  ? 'bg-amber-950/40 text-amber-300 border-amber-600/50 hover:bg-amber-900/50'
                  : 'bg-emerald-950/40 text-emerald-300 border-emerald-600/50 hover:bg-emerald-900/50'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isOfflineMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'
                }`}
              />
              <span className="hidden lg:inline">
                {isOfflineMode ? 'SATCOM: Outage (Edge Cache Active)' : 'GSAT-17: Online (12.4 Mbps)'}
              </span>
              <span className="lg:hidden">{isOfflineMode ? 'Edge Mode' : 'Online'}</span>
            </button>

            {/* Link back to Main POLARIS Portal */}
            <a
              href="../polaris/index.html"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#101F38] text-slate-200 border border-[#1E3354] hover:bg-[#1E3354] hover:text-[#13B5EA] transition-all shadow-sm"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Main Portal</span>
            </a>

          </div>

        </div>
      </div>

      {/* Sub-banner showing Edge Cache Availability */}
      <div className="bg-[#0B1526]/80 border-t border-[#1E3354]/60 py-1 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-[#13B5EA]" />
          <span>Local Station Edge Node: <strong>100% Cached SOP Library &amp; Telemetry Buffering</strong></span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <HardDriveDownload className="w-3 h-3 text-emerald-400" />
          <span className="hidden sm:inline">Last Sync with Goa HQ: 2 mins ago</span>
          <span className="text-[10px] text-amber-400/90 font-mono">[SIMULATED SYSTEM]</span>
        </div>
      </div>
    </header>
  );
}
