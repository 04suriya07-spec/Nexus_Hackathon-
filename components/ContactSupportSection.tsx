'use client';

import React, { useState } from 'react';
import {
  Send,
  LifeBuoy,
  CheckCircle2,
  AlertCircle,
  Loader2,
  FileCheck,
  Building2,
  ShieldAlert,
} from 'lucide-react';

interface ContactSupportSectionProps {
  defaultStation?: 'maitri' | 'bharati';
}

export function ContactSupportSection({ defaultStation = 'maitri' }: ContactSupportSectionProps) {
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState('power');
  const [station, setStation] = useState(defaultStation === 'maitri' ? 'Maitri Research Station' : 'Bharati Research Station');
  const [priority, setPriority] = useState<'routine' | 'p2' | 'p1'>('routine');
  const [equipmentId, setEquipmentId] = useState('');
  const [description, setDescription] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    subject: string;
    timestamp: string;
    station: string;
    priority: string;
  } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!subject.trim()) {
      setErrorMessage('Please provide a descriptive subject for the operational ticket.');
      return;
    }
    if (!description.trim() || description.trim().length < 15) {
      setErrorMessage('Please describe the technical anomaly in detail (minimum 15 characters).');
      return;
    }

    setIsLoading(true);

    // Simulate network dispatch to NCPOR Operations Desk
    setTimeout(() => {
      setIsLoading(false);
      const ticketNum = Math.floor(1000 + Math.random() * 9000);
      setSubmittedTicket({
        id: `NCPOR-44ISEA-TK-${ticketNum}`,
        subject: subject.trim(),
        station,
        priority: priority.toUpperCase(),
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' IST',
      });

      // Clear form
      setSubject('');
      setDescription('');
      setEquipmentId('');
    }, 900);
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setErrorMessage(null);
  };

  return (
    <div className="bg-[#0B1526] border border-[#1E3354] rounded-xl p-6 shadow-xl">
      {/* Title */}
      <div className="border-b border-[#1E3354] pb-4">
        <div className="flex items-center gap-2">
          <LifeBuoy className="w-5 h-5 text-[#13B5EA]" />
          <h2 className="text-lg font-bold text-white">NCPOR Technical Support &amp; Incident Dispatch</h2>
        </div>
        <p className="text-xs text-slate-400 mt-0.5">
          Submit formal engineering work orders and anomaly reports to on-site leaders and NCPOR Ground Operations (Goa)
        </p>
      </div>

      {submittedTicket ? (
        /* Confirmation State */
        <div className="mt-6 p-6 bg-emerald-950/20 border border-emerald-600/50 rounded-xl text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-900/40 border border-emerald-500/50 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-white">
            Operational Incident Ticket Dispatched Successfully
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-lg mx-auto">
            Your technical request has been logged into the NCPOR Antarctic Operations Registry and routed to the 24/7 Operations Desk in Vasco da Gama, Goa.
          </p>

          <div className="mt-4 p-4 bg-[#050A12] border border-[#1E3354] rounded-lg max-w-md mx-auto text-left text-xs font-mono space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-500">Ticket Identifier:</span>
              <span className="text-[#13B5EA] font-bold">{submittedTicket.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Station / Node:</span>
              <span className="text-slate-200">{submittedTicket.station}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Priority Level:</span>
              <span className="text-amber-400 font-bold">{submittedTicket.priority}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Dispatch Time:</span>
              <span className="text-slate-300">{submittedTicket.timestamp}</span>
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              onClick={handleResetForm}
              className="px-4 py-2 rounded-lg bg-[#101F38] text-xs font-semibold text-[#13B5EA] border border-[#1E3354] hover:bg-[#1E3354] transition-colors"
            >
              Submit Another Support Ticket
            </button>
          </div>
        </div>
      ) : (
        /* Form State */
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3 bg-red-950/40 border border-red-700/60 rounded-lg flex items-center gap-2 text-xs text-red-200">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Subject */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Incident Subject / Issue Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. DG-2 Harmonic Vibration Tripping Warning Limit"
                className="w-full bg-[#050A12] border border-[#1E3354] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#13B5EA]"
              />
            </div>

            {/* Equipment ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Equipment Tag / Subsystem ID (Optional)
              </label>
              <input
                type="text"
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                placeholder="e.g. GEN-VOLVO-D7A-02"
                className="w-full bg-[#050A12] border border-[#1E3354] rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#13B5EA]"
              />
            </div>

            {/* Station */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Target Station / Node <span className="text-red-400">*</span>
              </label>
              <select
                value={station}
                onChange={(e) => setStation(e.target.value)}
                className="w-full bg-[#050A12] border border-[#1E3354] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#13B5EA]"
              >
                <option value="Maitri Research Station">Maitri Research Station (Queen Maud Land)</option>
                <option value="Bharati Research Station">Bharati Research Station (Larsemann Hills)</option>
                <option value="Dakshin Gangotri AWS Base">Dakshin Gangotri AWS &amp; Logistics Base</option>
                <option value="NCPOR Ground Control Goa">NCPOR Ground Control Operations Centre (Goa)</option>
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Technical Category <span className="text-red-400">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#050A12] border border-[#1E3354] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-[#13B5EA]"
              >
                <option value="power">Power Generation &amp; Microgrid</option>
                <option value="water">Freshwater Pipeline &amp; Desalination</option>
                <option value="communications">SATCOM, Radome &amp; Ground Links</option>
                <option value="life-support">HVAC &amp; Living Module Life Support</option>
                <option value="meteorology">AWS Doppler &amp; Weather Sensors</option>
                <option value="spares">Spares &amp; Arctic Logistics</option>
              </select>
            </div>

          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Operational Priority Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPriority('routine')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                  priority === 'routine'
                    ? 'bg-blue-950/40 text-blue-300 border-blue-600'
                    : 'bg-[#050A12] text-slate-400 border-[#1E3354] hover:text-white'
                }`}
              >
                Routine (48h)
              </button>

              <button
                type="button"
                onClick={() => setPriority('p2')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                  priority === 'p2'
                    ? 'bg-amber-950/40 text-amber-300 border-amber-600'
                    : 'bg-[#050A12] text-slate-400 border-[#1E3354] hover:text-white'
                }`}
              >
                Priority P2 (4h)
              </button>

              <button
                type="button"
                onClick={() => setPriority('p1')}
                className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all text-center ${
                  priority === 'p1'
                    ? 'bg-red-950/40 text-red-300 border-red-600 shadow-[0_0_12px_rgba(239,68,68,0.2)]'
                    : 'bg-[#050A12] text-slate-400 border-[#1E3354] hover:text-white'
                }`}
              >
                Emergency P1 (Immediate)
              </button>
            </div>
          </div>

          {/* Issue Description */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Detailed Anomaly Description &amp; Observed Telemetry <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State observed symptoms, transducer readings, ambient temperatures, and immediate actions already taken according to station SOP..."
              className="w-full bg-[#050A12] border border-[#1E3354] rounded-lg p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#13B5EA] font-sans"
            />
          </div>

          {/* Submit Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <span className="text-[11px] text-slate-500">
              Dispatches via encrypted ISRO GSAT-17 telemetry tunnel (or buffers locally if offline).
            </span>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-auto px-6 py-2.5 bg-[#13B5EA] text-[#050A12] font-bold text-xs rounded-lg hover:bg-[#40d0f7] transition-all flex items-center justify-center gap-2 shadow-lg disabled:opacity-60 disabled:pointer-events-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Encrypting &amp; Dispatching...</span>
                </>
              ) : (
                <>
                  <span>Dispatch Operational Ticket</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

        </form>
      )}
    </div>
  );
}
