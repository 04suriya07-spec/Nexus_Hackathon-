'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Terminal,
} from 'lucide-react';
import { AIRA_KNOWLEDGE_BASE } from '@/lib/support-data';

interface Message {
  id: string;
  sender: 'aira' | 'user';
  text: string;
  timestamp: string;
  sources?: string[];
}

interface AiraSupportSectionProps {
  externalPrompt?: string;
  onClearExternalPrompt?: () => void;
}

export function AiraSupportSection({
  externalPrompt,
  onClearExternalPrompt,
}: AiraSupportSectionProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm-1',
      sender: 'aira',
      text: 'AIRA Antarctic Operations Copilot online. I have live ingested telemetry for Maitri (DG-1, DG-2, Priyadarshini water line) and Bharati (Scania CHP, RO desalination, GSAT-17 polar tracking). How can I assist with your operational protocol?',
      timestamp: 'Just now',
      sources: ['NCPOR 44-ISEA Engineering Manual', 'Live Telemetry RTU Stream'],
    },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickPrompts = [
    'Why is Generator 02 vibrating at Maitri?',
    'What is the water pipeline freeze protocol?',
    'How does SATCOM outage failover work?',
    'Current polar fleet health summary',
    'Fuel storage winterization standards',
  ];

  useEffect(() => {
    if (externalPrompt) {
      handleUserSubmit(externalPrompt);
      if (onClearExternalPrompt) onClearExternalPrompt();
    }
  }, [externalPrompt]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleUserSubmit = (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    // AI synthesis
    setTimeout(() => {
      const lower = text.toLowerCase();
      let responseText = '';
      let sources = ['NCPOR Polar Engineering Directives'];

      if (lower.includes('vibrat') || lower.includes('generator') || lower.includes('dg-2')) {
        responseText = AIRA_KNOWLEDGE_BASE.vibration;
        sources = ['SOP-PWR-01', 'TSG-GEN-08 (Maitri Vibration Tree)', 'RTU Ch #101'];
      } else if (lower.includes('water') || lower.includes('freeze') || lower.includes('priyadarshini') || lower.includes('desal')) {
        responseText = AIRA_KNOWLEDGE_BASE.water;
        sources = ['SOP-WAT-02 (Priyadarshini)', 'SOP-WAT-06 (Bharati RO)'];
      } else if (lower.includes('satcom') || lower.includes('offline') || lower.includes('gsat') || lower.includes('outage')) {
        responseText = AIRA_KNOWLEDGE_BASE.satcom;
        sources = ['SOP-COM-03 (GSAT-17 Recalibration)', 'SYS-OVR-07 (Edge Sync Gateway)'];
      } else if (lower.includes('weather') || lower.includes('blizzard') || lower.includes('wind') || lower.includes('temp')) {
        responseText = AIRA_KNOWLEDGE_BASE.weather;
        sources = ['SOP-MET-04 (Blizzard Lockdown)', 'Maitri/Bharati AWS Doppler'];
      } else if (lower.includes('fuel') || lower.includes('oil') || lower.includes('jet-a1')) {
        responseText = AIRA_KNOWLEDGE_BASE.fuel;
        sources = ['SOP-MNT-05 (MIL-L-46167 Specification)'];
      } else if (lower.includes('health') || lower.includes('summary') || lower.includes('status')) {
        responseText = AIRA_KNOWLEDGE_BASE.health;
        sources = ['44-ISEA Composite Health Index Matrix'];
      } else {
        responseText = `Acknowledged. Based on the 44-ISEA Antarctic Operations database, this subsystem is currently operating within nominal baseline parameters. For specific mechanical steps, consult the Knowledge Base SOPs above or dispatch an inquiry to NCPOR Ground Control in Goa.`;
        sources = ['NCPOR Central Operations Manual'];
      }

      const airaMsg: Message = {
        id: `a-${Date.now()}`,
        sender: 'aira',
        text: responseText,
        timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        sources,
      };

      setMessages((prev) => [...prev, airaMsg]);
      setIsTyping(false);
    }, 600);
  };

  const copyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'm-reset',
        sender: 'aira',
        text: 'Session reset. Telemetry channels synchronized. How can I assist you with station operations?',
        timestamp: 'Just now',
        sources: ['NCPOR Polar Engineering Directives'],
      },
    ]);
  };

  return (
    <div className="bg-[#0B1526] border border-[#1E3354] rounded-xl p-6 shadow-xl flex flex-col h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#1E3354] pb-4 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#13B5EA]/15 border border-[#13B5EA]/40 flex items-center justify-center text-[#13B5EA]">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">AIRA Operations AI Assistant</h2>
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-700/60 px-2 py-0.2 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> TELEMETRY AWARE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Antarctic Intelligence &amp; Real-time Operational Advisor (Evidence-based reasoning)
            </p>
          </div>
        </div>

        <button
          onClick={resetChat}
          className="text-xs text-slate-400 hover:text-white p-1.5 rounded hover:bg-[#101F38] transition-colors"
          title="Reset conversation"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Prompts */}
      <div className="py-2.5 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 border-b border-[#1E3354]/40">
        <span className="text-[11px] text-slate-500 whitespace-nowrap flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#13B5EA]" /> Prompt:
        </span>
        {quickPrompts.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleUserSubmit(q)}
            className="text-xs whitespace-nowrap px-2.5 py-1 rounded bg-[#050A12] text-slate-300 hover:text-[#13B5EA] border border-[#1E3354] hover:border-[#13B5EA]/50 transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1 scrollbar-thin">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {m.sender === 'aira' && (
              <div className="w-7 h-7 rounded bg-[#101F38] border border-[#1E3354] flex items-center justify-center text-[#13B5EA] shrink-0 mt-0.5">
                <Bot className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] rounded-xl p-3.5 text-xs sm:text-sm leading-relaxed ${
                m.sender === 'user'
                  ? 'bg-[#13B5EA] text-[#050A12] font-medium shadow-md'
                  : 'bg-[#050A12] border border-[#1E3354] text-slate-200 shadow-md'
              }`}
            >
              <div className="flex items-center justify-between gap-4 mb-1">
                <span className={`text-[10px] font-mono ${m.sender === 'user' ? 'text-[#050A12]/80 font-bold' : 'text-[#13B5EA] font-semibold'}`}>
                  {m.sender === 'user' ? 'Operator' : 'AIRA Copilot'} • {m.timestamp}
                </span>

                {m.sender === 'aira' && (
                  <button
                    onClick={() => copyMessage(m.id, m.text)}
                    className="text-slate-400 hover:text-white"
                    title="Copy response"
                  >
                    {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>

              <p className="whitespace-pre-line">{m.text}</p>

              {m.sources && m.sources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#1E3354]/50 flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                  <span className="font-semibold text-slate-500 uppercase tracking-wider">Citations:</span>
                  {m.sources.map((src, i) => (
                    <span key={i} className="px-1.5 py-0.5 rounded bg-[#101F38] border border-[#1E3354] text-[#13B5EA] font-mono">
                      {src}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {m.sender === 'user' && (
              <div className="w-7 h-7 rounded bg-[#13B5EA]/20 border border-[#13B5EA]/40 flex items-center justify-center text-[#13B5EA] shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-[#101F38] border border-[#1E3354] flex items-center justify-center text-[#13B5EA]">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#050A12] border border-[#1E3354] rounded-xl px-4 py-2.5 text-xs text-slate-400 flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#13B5EA]" />
              <span>AIRA analyzing telemetry and SOP database...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <div className="pt-3 border-t border-[#1E3354] shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUserSubmit(inputVal);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Ask AIRA regarding power, water, SATCOM, weather, or step-by-step SOPs..."
            className="flex-1 bg-[#050A12] border border-[#1E3354] rounded-lg px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-[#13B5EA]"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="px-4 py-2.5 bg-[#13B5EA] text-[#050A12] font-bold text-xs rounded-lg hover:bg-[#40d0f7] transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <span className="text-[10px] text-slate-500 mt-1 block">
          Notice: AIRA provides technical guidance strictly grounded in NCPOR documentation. Operator discretion required for manual overrides.
        </span>
      </div>
    </div>
  );
}
