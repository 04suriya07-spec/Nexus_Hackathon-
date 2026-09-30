'use client';

import React from 'react';
import {
  Radio,
  Wifi,
  WifiOff,
  Server,
  Database,
  ArrowRight,
  RefreshCw,
  ShieldCheck,
  Zap,
  HardDrive,
  CloudOff,
  CheckCircle2,
} from 'lucide-react';

interface ConnectivitySectionProps {
  isOfflineMode: boolean;
  onToggleOffline: () => void;
}

export function ConnectivitySection({
  isOfflineMode,
  onToggleOffline,
}: ConnectivitySectionProps) {
  return (
    <div className="bg-[#0B1526] border border-[#1E3354] rounded-xl p-6 shadow-xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E3354] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-[#13B5EA]" />
            <h2 className="text-lg font-bold text-white">
              Antarctic SATCOM &amp; Offline Autonomous Edge Architecture
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mission-critical dual-tier connectivity, edge document caching, and transactional data synchronization
          </p>
        </div>

        {/* Outage Simulation Switch */}
        <button
          onClick={onToggleOffline}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold border transition-all shadow-md ${
            isOfflineMode
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 hover:bg-amber-500/30'
              : 'bg-[#101F38] text-slate-300 border-[#1E3354] hover:border-[#13B5EA] hover:text-[#13B5EA]'
          }`}
        >
          {isOfflineMode ? (
            <>
              <WifiOff className="w-4 h-4 text-amber-400" />
              <span>Simulate SATCOM Restore</span>
            </>
          ) : (
            <>
              <Radio className="w-4 h-4 text-[#13B5EA]" />
              <span>Simulate SATCOM Outage</span>
            </>
          )}
        </button>
      </div>

      {/* Real-time Status Card */}
      <div
        className={`mt-5 p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          isOfflineMode
            ? 'bg-amber-950/20 border-amber-700/60'
            : 'bg-[#101F38]/60 border-[#1E3354]'
        }`}
      >
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border ${
              isOfflineMode
                ? 'bg-amber-900/30 text-amber-400 border-amber-600/40'
                : 'bg-emerald-900/30 text-emerald-400 border-emerald-600/40'
            }`}
          >
            {isOfflineMode ? <CloudOff className="w-5 h-5" /> : <Wifi className="w-5 h-5" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white">
                {isOfflineMode
                  ? 'Local Autonomous Edge Mode Active'
                  : 'GSAT-17 Polar Satellite Uplink Locked'}
              </span>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold border ${
                  isOfflineMode
                    ? 'bg-amber-950 text-amber-300 border-amber-600'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-600'
                }`}
              >
                {isOfflineMode ? 'EDGE BUFFERING' : 'CARRIER LOCK NOMINAL'}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {isOfflineMode
                ? 'Satellite carrier link interrupted by blizzard or sun transit. All 8 technical SOPs and historical telemetry remain cached locally on the station LAN.'
                : 'Primary C-band 12.4 Mbps relay to NCPOR Ground Station in Vasco da Gama, Goa with redundant Inmarsat BGAN backup.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 text-xs font-mono border-t md:border-t-0 md:border-l border-[#1E3354] pt-2 md:pt-0 md:pl-4">
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Buffered Telemetry</span>
            <span className="font-bold text-[#13B5EA]">
              {isOfflineMode ? '142 Packets Queued' : '0 Packets (Synchronized)'}
            </span>
          </div>
          <div>
            <span className="text-[10px] text-slate-500 block uppercase">Local Cache</span>
            <span className="font-bold text-emerald-400">100% Operational</span>
          </div>
        </div>
      </div>

      {/* 3 Pillar Architectural Details */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Pillar 1 */}
        <div className="bg-[#050A12] border border-[#1E3354] rounded-lg p-4">
          <div className="w-8 h-8 rounded-lg bg-[#101F38] text-[#13B5EA] flex items-center justify-center mb-3">
            <Radio className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Dual-Tier Satellite Relay</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            Maitri and Bharati communicate with mainland India via ISRO GSAT-17 dedicated C-band transponders with a 3.8m radome-enclosed tracking dish. When katabatic winds exceed 55 kt, auto-stow engages and traffic shifts to Inmarsat BGAN.
          </p>
          <div className="mt-3 pt-2 border-t border-[#1E3354]/60 text-[11px] text-[#13B5EA] font-mono">
            Carrier: 93.5°E Geostationary
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="bg-[#050A12] border border-[#1E3354] rounded-lg p-4">
          <div className="w-8 h-8 rounded-lg bg-[#101F38] text-emerald-400 flex items-center justify-center mb-3">
            <Database className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Offline Edge Documentation Cache</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            The POLARIS Support Portal utilizes Progressive Web Application (PWA) service workers and station-local edge microservers. 100% of engineering SOPs, checklists, schematics, and AIRA core rules remain offline-accessible.
          </p>
          <div className="mt-3 pt-2 border-t border-[#1E3354]/60 text-[11px] text-emerald-400 font-mono">
            Local Storage: Ready &amp; Pre-loaded
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="bg-[#050A12] border border-[#1E3354] rounded-lg p-4">
          <div className="w-8 h-8 rounded-lg bg-[#101F38] text-amber-400 flex items-center justify-center mb-3">
            <RefreshCw className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white">Auto-Resynchronization Engine</h3>
          <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
            During connectivity blackouts, operator action logs and sensor trends are sequentially buffered into local transactional edge storage. When SATCOM lock returns, data is burst-synced to NCPOR Goa with conflict resolution.
          </p>
          <div className="mt-3 pt-2 border-t border-[#1E3354]/60 text-[11px] text-amber-400 font-mono">
            Resolution: Time-series Append Only
          </div>
        </div>

      </div>
    </div>
  );
}
