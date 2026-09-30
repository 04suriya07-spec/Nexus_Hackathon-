'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Activity,
  Users,
  Calendar,
  AlertTriangle,
  CheckCircle,
  ExternalLink,
  Zap,
  Droplet,
  Radio,
  Wind,
  Shield,
  Layers,
  Thermometer,
} from 'lucide-react';
import { STATION_TELEMETRY, StationTelemetrySummary } from '@/lib/support-data';

interface StationSupportSectionProps {
  initialStation?: 'maitri' | 'bharati';
  onAskAiraAboutStation: (stationName: string) => void;
}

export function StationSupportSection({
  initialStation = 'maitri',
  onAskAiraAboutStation,
}: StationSupportSectionProps) {
  const [selectedStation, setSelectedStation] = useState<'maitri' | 'bharati'>(initialStation);

  const data: StationTelemetrySummary = STATION_TELEMETRY[selectedStation];

  return (
    <div className="bg-[#0B1526] border border-[#1E3354] rounded-xl p-6 shadow-xl">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E3354] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#13B5EA]" />
            <h2 className="text-lg font-bold text-white">Antarctic Station Systems &amp; Telemetry Support</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Operational health indices, physical coordinates, and live engineering subsystem diagnostics
          </p>
        </div>

        {/* Station Selector Tabs */}
        <div className="flex items-center p-1 bg-[#050A12] border border-[#1E3354] rounded-lg">
          <button
            onClick={() => setSelectedStation('maitri')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              selectedStation === 'maitri'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Maitri Station (Queen Maud Land)
          </button>
          <button
            onClick={() => setSelectedStation('bharati')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
              selectedStation === 'bharati'
                ? 'bg-[#13B5EA]/20 text-[#13B5EA] border border-[#13B5EA]/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bharati Station (Larsemann Hills)
          </button>
        </div>
      </div>

      {/* Station Overview Banner */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4 bg-[#101F38]/60 p-4 rounded-xl border border-[#1E3354]">
        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Station Designation</span>
          <span className="text-sm font-bold text-white block mt-0.5">{data.name}</span>
          <span className="text-xs font-mono text-[#13B5EA]">{data.code}</span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Coordinates &amp; Terrain</span>
          <span className="text-xs font-mono text-slate-200 block mt-0.5">{data.coordinates}</span>
          <span className="text-xs text-slate-400 truncate block">{data.location}</span>
        </div>

        <div>
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block">Active Wintering Team</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-sm font-bold text-slate-200">{data.winterCrew}</span>
          </div>
          <span className="text-xs text-slate-400">{data.established}</span>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 uppercase tracking-wider text-[11px]">Composite Health Index</span>
              <span className="font-mono font-bold text-[#13B5EA]">{data.healthIndex}%</span>
            </div>
            <div className="w-full bg-[#050A12] h-2 rounded-full mt-1 overflow-hidden border border-[#1E3354]">
              <div
                className="bg-[#13B5EA] h-full rounded-full transition-all duration-500"
                style={{ width: `${data.healthIndex}%` }}
              />
            </div>
          </div>
          <span className="text-[10px] font-mono text-amber-400/90 self-end mt-1">
            [SIMULATED - 2s TELEMETRY INTERVAL]
          </span>
        </div>
      </div>

      {/* Subsystems Telemetry Cards */}
      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {data.subsystems.map((sub, idx) => (
          <div
            key={idx}
            className="bg-[#050A12] border border-[#1E3354] rounded-lg p-4 hover:border-[#13B5EA]/40 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-200">{sub.name}</span>
                <span
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                    sub.status === 'NORMAL'
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-600/40'
                      : sub.status === 'WARNING'
                      ? 'bg-amber-950/40 text-amber-300 border-amber-600/40'
                      : 'bg-red-950/40 text-red-300 border-red-600/40'
                  }`}
                >
                  {sub.status}
                </span>
              </div>

              <div className="mt-2 text-sm font-mono font-bold text-[#13B5EA]">
                {sub.metric}
              </div>

              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                {sub.details}
              </p>
            </div>

            <div className="mt-4 pt-2 border-t border-[#1E3354]/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-mono">RTU Channel #{101 + idx}</span>
              <button
                onClick={() => onAskAiraAboutStation(sub.name)}
                className="text-[#13B5EA] hover:underline flex items-center gap-1 font-medium"
              >
                Diagnose with AIRA &rarr;
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Live Navigation Links */}
      <div className="mt-5 pt-4 border-t border-[#1E3354] flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="text-slate-400">
          Want full 3D digital twin telemetry or cross-station comparison?
        </span>
        <div className="flex items-center gap-3">
          <a
            href="../polaris/index.html"
            className="text-[#13B5EA] hover:underline font-semibold flex items-center gap-1"
          >
            Open 3D Digital Twin <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <a
            href="../polaris/index.html"
            className="text-slate-300 hover:text-white font-semibold flex items-center gap-1"
          >
            Command Control <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
