'use client';

import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle,
  Copy,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';
import { ACTIVE_ALERTS, ActiveAlert } from '@/lib/support-data';

interface AlertSupportSectionProps {
  onOpenSop: (sopDoc: string) => void;
  onAskAiraAboutAlert: (alertTitle: string) => void;
}

export function AlertSupportSection({
  onOpenSop,
  onAskAiraAboutAlert,
}: AlertSupportSectionProps) {
  const [alerts, setAlerts] = useState<ActiveAlert[]>(ACTIVE_ALERTS);
  const [acknowledgedIds, setAcknowledgedIds] = useState<string[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const toggleAcknowledge = (id: string) => {
    if (acknowledgedIds.includes(id)) {
      setAcknowledgedIds(acknowledgedIds.filter((item) => item !== id));
    } else {
      setAcknowledgedIds([...acknowledgedIds, id]);
    }
  };

  const copyIncidentCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="bg-[#0B1526] border border-[#1E3354] rounded-xl p-6 shadow-xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1E3354] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white">Active Operational Incidents &amp; Alerts</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Mission-critical anomalies prioritized by severity with root-cause diagnostic directives
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono text-amber-400 bg-[#101F38] border border-amber-600/40 px-2.5 py-1 rounded">
            {alerts.length} ACTIVE ADVISORIES
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            [SIMULATED REAL-TIME]
          </span>
        </div>
      </div>

      {/* Alerts List */}
      <div className="mt-5 space-y-4">
        {alerts.map((alert) => {
          const isAck = acknowledgedIds.includes(alert.id);

          return (
            <div
              key={alert.id}
              className={`border rounded-xl p-5 transition-all ${
                alert.severity === 'CRITICAL'
                  ? 'bg-red-950/20 border-red-800/60 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                  : alert.severity === 'WARNING'
                  ? 'bg-amber-950/20 border-amber-700/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  : 'bg-blue-950/20 border-blue-800/60'
              }`}
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded border ${
                      alert.severity === 'CRITICAL'
                        ? 'bg-red-950 text-red-300 border-red-600'
                        : alert.severity === 'WARNING'
                        ? 'bg-amber-950 text-amber-300 border-amber-600'
                        : 'bg-blue-950 text-blue-300 border-blue-600'
                    }`}
                  >
                    {alert.severity}
                  </span>

                  <span className="font-mono text-xs text-slate-400 flex items-center gap-1">
                    {alert.code}
                    <button
                      onClick={() => copyIncidentCode(alert.code)}
                      title="Copy incident code"
                      className="text-slate-500 hover:text-[#13B5EA]"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                    {copiedCode === alert.code && (
                      <span className="text-[10px] text-emerald-400 font-bold">Copied!</span>
                    )}
                  </span>

                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                      alert.station === 'Maitri'
                        ? 'bg-amber-900/40 text-amber-300 border-amber-600/40'
                        : 'bg-cyan-900/40 text-cyan-300 border-cyan-600/40'
                    }`}
                  >
                    {alert.station} Station
                  </span>
                </div>

                <div className="text-xs text-slate-400 font-mono">
                  {alert.timestamp}
                </div>
              </div>

              {/* Title & Affected System */}
              <div className="mt-3">
                <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                  {alert.title}
                </h3>
                <span className="text-xs text-[#13B5EA] font-mono mt-0.5 block">
                  Affected Subsystem: {alert.affectedSystem}
                </span>
              </div>

              {/* Root Cause & Recommended Action */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs bg-[#050A12]/60 p-3.5 rounded-lg border border-[#1E3354]">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                    Diagnostic Root Cause:
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {alert.rootCause}
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">
                    Recommended Technical Directive:
                  </span>
                  <p className="text-slate-300 mt-1 leading-relaxed">
                    {alert.recommendedAction}
                  </p>
                </div>
              </div>

              {/* Actions row */}
              <div className="mt-4 pt-3 border-t border-[#1E3354]/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenSop(alert.sopDocument)}
                    className="px-3 py-1.5 rounded-lg bg-[#101F38] text-xs font-semibold text-[#13B5EA] border border-[#1E3354] hover:border-[#13B5EA] transition-all flex items-center gap-1.5"
                  >
                    Open SOP Checklist ({alert.sopDocument}) <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onAskAiraAboutAlert(alert.title)}
                    className="px-3 py-1.5 rounded-lg bg-[#050A12] text-xs font-semibold text-slate-300 hover:text-white border border-[#1E3354] transition-all"
                  >
                    Ask AIRA AI
                  </button>
                </div>

                <button
                  onClick={() => toggleAcknowledge(alert.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    isAck
                      ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600'
                      : 'bg-[#101F38] text-slate-300 border-[#1E3354] hover:bg-[#1E3354]'
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{isAck ? 'Acknowledged by Watch Engineer' : 'Acknowledge Incident'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
