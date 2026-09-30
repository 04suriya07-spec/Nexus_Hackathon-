'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Home, Layers, BookOpen, Users, AlertCircle, Wifi, Clock, BarChart2,
  Search, Bell, ChevronRight, Phone, FileWarning, Monitor, FileText,
  Zap, Droplet, Radio, Thermometer, Cpu, Send, X, Minimize2, Maximize2,
  ExternalLink, ArrowRight, CheckCircle2, AlertTriangle, Info,
  HelpCircle, MapPin, Loader2
} from 'lucide-react';

/* ─── TYPES ─────────────────────────────────────────────── */
interface ChatMsg { id: string; from: 'user' | 'bot'; text: string; time: string; }
interface SideNavItem { key: string; label: string; icon: React.ReactNode; }
type ActiveSection = 'overview' | 'get-help' | 'kb' | 'contacts' | 'issues' | 'remote' | 'history' | 'status';

/* ─── STATIC DATA ────────────────────────────────────────── */
const SIDE_NAV: SideNavItem[] = [
  { key: 'overview',  label: 'Overview',          icon: <Home className="w-4 h-4" /> },
  { key: 'get-help',  label: 'Get Help',           icon: <HelpCircle className="w-4 h-4" /> },
  { key: 'kb',        label: 'Knowledge Base',     icon: <BookOpen className="w-4 h-4" /> },
  { key: 'contacts',  label: 'Technical Contacts', icon: <Users className="w-4 h-4" /> },
  { key: 'issues',    label: 'Common Issues',      icon: <AlertCircle className="w-4 h-4" /> },
  { key: 'remote',    label: 'Remote Support',     icon: <Monitor className="w-4 h-4" /> },
  { key: 'history',   label: 'Incident History',   icon: <Clock className="w-4 h-4" /> },
  { key: 'status',    label: 'System Status',      icon: <BarChart2 className="w-4 h-4" /> },
];

const KB_ARTICLES = [
  { title: 'Power System Troubleshooting at Maitri Station', category: 'Power & Electrical',  updated: '5 Jan 2025' },
  { title: 'Fuel Handling and Storage Guidelines',           category: 'Fuel & Logistics',     updated: '12 Dec 2024' },
  { title: 'Water Supply and Treatment – Operations Guide',  category: 'Water Systems',        updated: '3 Jan 2025' },
  { title: 'Weather Sensor Maintenance and Calibration',     category: 'Instrumentation',      updated: '28 Dec 2024' },
  { title: 'Satellite Communication – Common Issues & Fixes',category: 'Communications',       updated: '18 Dec 2024' },
  { title: 'Scientific Equipment Error Codes and Resolutions',category: 'Equipment & Labs',    updated: '10 Jan 2025' },
];

const COMMON_ISSUES = [
  { label: 'Power Systems',    desc: 'Outages, load issues, UPS errors',              icon: <Zap className="w-6 h-6 text-yellow-500" />,  bg: 'bg-yellow-50',  border: 'border-yellow-200' },
  { label: 'Fuel Systems',     desc: 'Fuel transfer, low levels, heater issues',       icon: <Droplet className="w-6 h-6 text-orange-500" />, bg: 'bg-orange-50', border: 'border-orange-200' },
  { label: 'Water Systems',    desc: 'Low pressure, pump failure, freezing',           icon: <Droplet className="w-6 h-6 text-blue-500" />, bg: 'bg-blue-50',   border: 'border-blue-200' },
  { label: 'Weather Sensors',  desc: 'No data, calibration, sensor error',             icon: <Thermometer className="w-6 h-6 text-teal-500" />, bg: 'bg-teal-50', border: 'border-teal-200' },
  { label: 'Communications',   desc: 'Satellite link, internet, radio issues',         icon: <Radio className="w-6 h-6 text-indigo-500" />, bg: 'bg-indigo-50', border: 'border-indigo-200' },
  { label: 'Equipment Errors', desc: 'Lab equipment, server, HVAC, other',             icon: <Cpu className="w-6 h-6 text-purple-500" />,  bg: 'bg-purple-50',  border: 'border-purple-200' },
];

const INCIDENTS = [
  { id: 'INC-4402', title: 'DG-2 Vibration Warning at Maitri', station: 'Maitri', severity: 'WARNING', status: 'Open',     time: 'Today 11:05' },
  { id: 'INC-4409', title: 'Katabatic Gusts Near Bharati Radome', station: 'Bharati', severity: 'WARNING', status: 'Open',  time: 'Today 14:18' },
  { id: 'INC-4398', title: 'Priyadarshini Pipeline Heat-Trace Drop', station: 'Maitri', severity: 'INFO',  status: 'Monitoring', time: 'Today 08:45' },
  { id: 'INC-4380', title: 'SATCOM Latency Spike',              station: 'Bharati', severity: 'INFO',    status: 'Resolved', time: 'Yesterday 22:10' },
];

const AIRA_KB: Record<string, string> = {
  vibration:  'DG-2 at Maitri is at 3.8 mm/s (warn: 3.5, trip: 4.5). Follow SOP-PWR-12: reduce load to 45%, sync DG-3 cold standby, inspect AV mounts.',
  power:      'Primary power is online. DG-2 bearing advisory active at Maitri. Bharati Scania CHP units 1 & 3 running at 88% load.',
  water:      'Maitri lake pipeline nominal at 76% reserve, +4.2°C trace-heat. Bharati RO permeate < 280 µS/cm, 79% reserve.',
  satcom:     'GSAT-17 C-band link active at 12.4 Mbps. Bharati radome experiencing 42 kt gusts; auto-stow threshold 55 kt.',
  weather:    'Maitri: −12.4°C, 18 kt. Bharati: −8.6°C, 12 kt. 48h window favorable for exterior ops.',
  fuel:       'Maitri: 68% Jet A-1 reserve. Bharati: 81% reserve. Both winterized with FSII additive.',
  default:    'I can help with power, water, SATCOM, weather, fuel, or station operations. Please describe your issue.',
};

/* ─── SUBCOMPONENTS ──────────────────────────────────────── */

function TopNavBar({ searchQ, setSearchQ }: { searchQ: string; setSearchQ: (v: string) => void }) {
  return (
    <header className="h-14 bg-white border-b border-slate-200 flex items-center px-4 gap-4 sticky top-0 z-50 shadow-sm">
      {/* Brand */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 bg-[#0b2e5e] rounded flex items-center justify-center">
          <svg viewBox="0 0 100 130" className="w-5 h-5 text-white" fill="currentColor">
            <path d="M50 0 C45 10 35 15 30 25 C25 35 30 50 35 60 C30 65 25 75 30 85 C35 95 45 100 50 110 C55 100 65 95 70 85 C75 75 70 65 65 60 C70 50 75 35 70 25 C65 15 55 10 50 0 Z" opacity="0.9"/>
            <circle cx="50" cy="50" r="14" fill="none" stroke="currentColor" strokeWidth="5"/>
            <path d="M20 115 L80 115 L85 125 L15 125 Z"/>
          </svg>
        </div>
        <div className="leading-tight">
          <div className="text-xs font-bold text-[#0b2e5e]">NCPOR</div>
          <div className="text-[10px] text-slate-500 leading-none">National Centre for Polar &amp; Ocean Research</div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="hidden md:flex items-center gap-1 ml-4">
        {['Home','Operations','Weather','Data'].map(n => (
          <a key={n} href="/polaris/index.html" className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 rounded-md hover:bg-slate-100 transition-colors flex items-center gap-1">
            {n === 'Home' && <Home className="w-3.5 h-3.5" />}
            {n === 'Operations' && <Layers className="w-3.5 h-3.5" />}
            {n === 'Weather' && <Thermometer className="w-3.5 h-3.5" />}
            {n === 'Data' && <BarChart2 className="w-3.5 h-3.5" />}
            {n}
          </a>
        ))}
        <a href="#" className="px-3 py-1.5 text-xs font-semibold text-sky-600 bg-sky-50 border border-sky-200 rounded-md flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5" /> Support
        </a>
      </nav>

      {/* Search */}
      <div className="flex-1 max-w-md mx-auto relative hidden sm:block">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
          placeholder="Search support, documentation… ⌘K"
          className="w-full pl-9 pr-4 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:bg-white transition-colors"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-3 ml-auto">
        <button className="relative p-1.5 rounded-md hover:bg-slate-100 text-slate-500">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg px-2.5 py-1.5">
          <div className="w-7 h-7 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">AS</div>
          <div className="hidden sm:block leading-tight">
            <div className="text-xs font-semibold text-slate-800">Ananya Sharma</div>
            <div className="text-[10px] text-slate-400">Operations Support</div>
          </div>
        </div>
      </div>
    </header>
  );
}

function SideBar({ active, setActive }: { active: ActiveSection; setActive: (k: ActiveSection) => void }) {
  return (
    <aside className="w-52 shrink-0 bg-white border-r border-slate-200 pt-4 hidden md:block">
      <div className="px-4 mb-3">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Support Center</span>
      </div>

      <nav className="space-y-0.5 px-2">
        {SIDE_NAV.map(item => (
          <button
            key={item.key}
            onClick={() => setActive(item.key as ActiveSection)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              active === item.key
                ? 'bg-sky-50 text-sky-700 border border-sky-200 font-semibold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span className={active === item.key ? 'text-sky-600' : 'text-slate-400'}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Bottom Card */}
      <div className="mx-3 mt-6 p-3 bg-gradient-to-br from-[#0b2e5e] to-[#1a4a8a] rounded-xl text-white">
        <div className="text-xs font-bold mb-1">Supporting Science</div>
        <div className="text-xs font-bold">Beyond</div>
        <div className="text-xs font-bold mb-2">Boundaries</div>
        <div className="flex items-center gap-1 text-[10px] text-blue-200">
          <div className="w-4 h-3 rounded-sm overflow-hidden shrink-0 flex flex-col">
            <div className="flex-1 bg-[#FF9933]" />
            <div className="flex-1 bg-white" />
            <div className="flex-1 bg-[#138808]" />
          </div>
          Govt. of India
        </div>
        <div className="mt-3 space-y-0.5 text-[10px] text-blue-200">
          <div className="flex items-center gap-1 font-semibold">
            <MapPin className="w-3 h-3" /> MAITRI →
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <MapPin className="w-3 h-3" /> BHARATI →
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <MapPin className="w-3 h-3" /> NCPOR GOA →
          </div>
        </div>
      </div>
    </aside>
  );
}

function EmergencyBanner() {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-red-100 border-2 border-red-300 text-red-600 flex items-center justify-center shrink-0 animate-pulse">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-red-800">Emergency Assistance</div>
          <div className="text-xs text-red-600">
            For critical situations at Maitri, Bharati or during field operations, get immediate help.
          </div>
        </div>
      </div>
      <button className="shrink-0 flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors shadow-md">
        <Phone className="w-4 h-4" />
        <div className="text-left">
          <div>Call Emergency Support</div>
          <div className="text-[10px] font-normal opacity-80">24 × 7 · Priority Response</div>
        </div>
      </button>
    </div>
  );
}

function QuickActions({ setSection }: { setSection: (s: ActiveSection) => void }) {
  const actions = [
    {
      icon: <Phone className="w-6 h-6 text-sky-600" />,
      bg: 'bg-sky-50', border: 'border-sky-200',
      title: 'Call Command Control',
      desc: 'Speak directly to NCPOR Command & Control Room.',
      action: () => alert('NCPOR Command Control: +91 832 252 5606 (24×7)')
    },
    {
      icon: <FileWarning className="w-6 h-6 text-orange-600" />,
      bg: 'bg-orange-50', border: 'border-orange-200',
      title: 'Open Incident',
      desc: 'Report and track technical or operational issues.',
      action: () => setSection('history')
    },
    {
      icon: <Monitor className="w-6 h-6 text-violet-600" />,
      bg: 'bg-violet-50', border: 'border-violet-200',
      title: 'Remote Troubleshooting',
      desc: 'Get expert support for diagnostics and fixes.',
      action: () => setSection('remote')
    },
    {
      icon: <FileText className="w-6 h-6 text-emerald-600" />,
      bg: 'bg-emerald-50', border: 'border-emerald-200',
      title: 'Documentation',
      desc: 'Access manuals, SOPs and quick guides.',
      action: () => setSection('kb')
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {actions.map(a => (
        <button
          key={a.title}
          onClick={a.action}
          className={`${a.bg} ${a.border} border rounded-xl p-4 text-left hover:shadow-md transition-all group flex flex-col gap-2`}
        >
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.bg}`}>{a.icon}</div>
          <div className="text-xs font-bold text-slate-800">{a.title}</div>
          <div className="text-[11px] text-slate-500 leading-relaxed">{a.desc}</div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform mt-auto" />
        </button>
      ))}
    </div>
  );
}

function KnowledgeBasePanel() {
  const [search, setSearch] = useState('');
  const filtered = KB_ARTICLES.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-sky-600" /> Knowledge Base
        </h3>
        <a href="#" className="text-xs text-sky-600 hover:underline flex items-center gap-1">
          View All Articles <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>

      <div className="relative mb-3">
        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter articles…"
          className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:outline-none focus:ring-1 focus:ring-sky-400"
        />
      </div>

      <div className="space-y-1">
        {filtered.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">No articles found.</div>
        ) : filtered.map(a => (
          <button key={a.title} className="w-full flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-slate-50 transition-colors text-left group border border-transparent hover:border-slate-200">
            <div className="flex items-start gap-2.5">
              <FileText className="w-4 h-4 text-slate-300 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-slate-700 group-hover:text-sky-700 transition-colors">{a.title}</div>
                <div className="text-[10px] text-slate-400">{a.category} · Updated {a.updated}</div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0 ml-2" />
          </button>
        ))}
      </div>
    </div>
  );
}

function CommonIssuesPanel({ setSection }: { setSection: (s: ActiveSection) => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-orange-500" /> Common Issues
        </h3>
        <button onClick={() => setSection('issues')} className="text-xs text-sky-600 hover:underline flex items-center gap-1">
          View All <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {COMMON_ISSUES.map(i => (
          <button key={i.label} className={`${i.bg} ${i.border} border rounded-xl p-3 text-left hover:shadow-sm transition-all`}>
            <div className="mb-1.5">{i.icon}</div>
            <div className="text-xs font-bold text-slate-800">{i.label}</div>
            <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{i.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function StationContactsPanel() {
  const contacts = [
    {
      name: 'Maitri (Antarctica)',
      role: 'Station Engineer (Power & Utilities)',
      phone: '+91 1234 000 111 (SAT)',
      email: 'maitri-support@ncpor.res.in',
      status: 'Online',
      color: 'bg-amber-500',
      img: '🏔️'
    },
    {
      name: 'Bharati (Antarctica)',
      role: 'Technical Operations Lead',
      phone: '+91 1234 000 222 (SAT)',
      email: 'bharati-support@ncpor.res.in',
      status: 'Online',
      color: 'bg-sky-500',
      img: '🧊'
    },
    {
      name: 'NCPOR Goa (HQ)',
      role: 'Operations & IT Support',
      phone: '+91 832 252 5606',
      email: 'helpdesk@ncpor.res.in',
      status: 'Online',
      color: 'bg-emerald-500',
      img: '🏛️'
    }
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Users className="w-4 h-4 text-sky-600" /> Station-wise Technical Contacts
        </h3>
        <a href="#" className="text-xs text-sky-600 hover:underline flex items-center gap-1">View All Contacts <ArrowRight className="w-3.5 h-3.5" /></a>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {contacts.map(c => (
          <div key={c.name} className="border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-9 h-9 rounded-lg ${c.color} text-white text-lg flex items-center justify-center`}>{c.img}</div>
              <div>
                <div className="text-xs font-bold text-slate-800">{c.name}</div>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                  <span className="text-[10px] text-emerald-600 font-medium">{c.status}</span>
                </div>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 mb-2">{c.role}</div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-1 text-slate-600">
                <Phone className="w-3 h-3 text-slate-400" /> {c.phone}
              </div>
              <div className="flex items-center gap-1 text-sky-600 truncate">
                <span className="text-slate-400">@</span>
                <span className="truncate">{c.email}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncidentHistoryPanel() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-500" /> Incident History
        </h3>
        <span className="text-[10px] font-mono text-orange-500 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded">
          {INCIDENTS.filter(i => i.status === 'Open').length} OPEN
        </span>
      </div>
      <div className="space-y-2">
        {INCIDENTS.map(inc => (
          <div key={inc.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-3">
              <span className={`w-2 h-2 rounded-full shrink-0 ${
                inc.severity === 'WARNING' ? 'bg-amber-400' : 'bg-blue-400'
              }`} />
              <div>
                <div className="text-xs font-semibold text-slate-800">{inc.title}</div>
                <div className="text-[10px] text-slate-400">{inc.id} · {inc.station} · {inc.time}</div>
              </div>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              inc.status === 'Open' ? 'bg-amber-100 text-amber-700' :
              inc.status === 'Monitoring' ? 'bg-blue-100 text-blue-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>{inc.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SystemStatusPanel() {
  const systems = [
    { name: 'GSAT-17 SATCOM Link', status: 'Online', metric: '12.4 Mbps · 640ms' },
    { name: 'Maitri Power Microgrid', status: 'Advisory', metric: 'DG-2 Vibration 3.8 mm/s' },
    { name: 'Bharati CHP Unit', status: 'Online', metric: '380 kW / 440 kW' },
    { name: 'Maitri Water Pipeline', status: 'Online', metric: '76% reserve · +4.2°C' },
    { name: 'Bharati RO Desalination', status: 'Online', metric: '79% reserve' },
    { name: 'NCPOR HQ Ground Relay', status: 'Online', metric: 'Last sync 2 min ago' },
  ];
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3">
        <BarChart2 className="w-4 h-4 text-sky-600" /> System Status
      </h3>
      <div className="space-y-2">
        {systems.map(s => (
          <div key={s.name} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${
                s.status === 'Online' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
              <span className="text-xs text-slate-700">{s.name}</span>
            </div>
            <div className="text-right">
              <div className={`text-[10px] font-bold ${s.status === 'Online' ? 'text-emerald-600' : 'text-amber-600'}`}>{s.status}</div>
              <div className="text-[10px] text-slate-400 font-mono">{s.metric}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RemoteSupportPanel() {
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [station, setStation] = useState('Maitri');
  const [category, setCategory] = useState('Power Systems');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!subject.trim()) { setError('Please enter a subject.'); return; }
    if (description.trim().length < 10) { setError('Please describe the issue in more detail.'); return; }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(`NCPOR-TK-${Math.floor(1000 + Math.random() * 9000)}`);
    }, 900);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-4">
        <Monitor className="w-4 h-4 text-violet-600" /> Remote Troubleshooting &amp; Support Ticket
      </h3>
      {submitted ? (
        <div className="flex flex-col items-center py-8 gap-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          <div className="text-sm font-bold text-slate-800">Ticket Submitted Successfully</div>
          <div className="text-xs text-slate-500 text-center max-w-sm">
            Your request has been routed to NCPOR Ground Control in Goa.<br />
            <span className="font-mono text-sky-600 text-sm font-bold">{submitted}</span>
          </div>
          <button onClick={() => { setSubmitted(null); setSubject(''); setDescription(''); }} className="mt-2 text-xs text-sky-600 underline">Submit Another</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && <div className="flex items-center gap-2 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700"><AlertTriangle className="w-4 h-4 shrink-0" />{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Station *</label>
              <select value={station} onChange={e => setStation(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400">
                <option>Maitri</option><option>Bharati</option><option>NCPOR Goa</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400">
                <option>Power Systems</option><option>Water Systems</option><option>Communications</option><option>Weather Sensors</option><option>Equipment</option><option>Fuel & Logistics</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Subject *</label>
            <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. DG-2 vibration tripping warning limit" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400" />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">Issue Description *</label>
            <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe symptoms, sensor readings, and actions already taken…" className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-sky-400 resize-none" />
          </div>
          <button type="submit" disabled={loading} className="w-full flex items-center justify-center gap-2 py-2.5 bg-sky-600 hover:bg-sky-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting…</> : <><Send className="w-4 h-4" /> Submit Ticket</>}
          </button>
        </form>
      )}
    </div>
  );
}

function LiveChatWidget() {
  const [open, setOpen] = useState(true);
  const [min, setMin] = useState(false);
  const [input, setInput] = useState('');
  const [msgs, setMsgs] = useState<ChatMsg[]>([
    { id: '1', from: 'bot', text: 'Hello! How can we help you today?', time: '10:14 AM' }
  ]);
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs, typing]);

  const send = () => {
    if (!input.trim() || typing) return;
    const q = input.trim();
    setInput('');
    const userMsg: ChatMsg = { id: Date.now().toString(), from: 'user', text: q, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) };
    setMsgs(p => [...p, userMsg]);
    setTyping(true);
    setTimeout(() => {
      const lower = q.toLowerCase();
      let reply = AIRA_KB.default;
      if (lower.includes('vibrat') || lower.includes('generator') || lower.includes('dg-2')) reply = AIRA_KB.vibration;
      else if (lower.includes('power')) reply = AIRA_KB.power;
      else if (lower.includes('water') || lower.includes('pipeline')) reply = AIRA_KB.water;
      else if (lower.includes('satcom') || lower.includes('gsat') || lower.includes('comms')) reply = AIRA_KB.satcom;
      else if (lower.includes('weather') || lower.includes('wind')) reply = AIRA_KB.weather;
      else if (lower.includes('fuel')) reply = AIRA_KB.fuel;
      setMsgs(p => [...p, { id: Date.now().toString(), from: 'bot', text: reply, time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) }]);
      setTyping(false);
    }, 700);
  };

  if (!open) return (
    <button onClick={() => setOpen(true)} className="fixed bottom-5 right-5 w-14 h-14 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow-2xl flex items-center justify-center z-50 transition-colors">
      <HelpCircle className="w-7 h-7" />
    </button>
  );

  return (
    <div className={`fixed bottom-5 right-5 z-50 bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-200 ${min ? 'h-14 w-72' : 'h-[420px] w-80'}`}>
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-600 to-sky-700 text-white rounded-t-2xl px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-sky-400 flex items-center justify-center font-bold text-sm">N</div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-sky-600 rounded-full" />
          </div>
          <div>
            <div className="text-xs font-bold">Live Support Chat</div>
            <div className="text-[10px] opacity-80 flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" /> Online</div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setMin(!min)} className="p-1 rounded hover:bg-sky-500 transition-colors">
            {min ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-sky-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {!min && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
            <div className="text-center text-[10px] text-slate-400 font-semibold">NCPOR Support · We typically reply within a few minutes.</div>
            {msgs.map(m => (
              <div key={m.id} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed shadow-sm ${
                  m.from === 'user' ? 'bg-sky-600 text-white rounded-br-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'
                }`}>
                  <p>{m.text}</p>
                  <p className={`text-[10px] mt-1 ${m.from === 'user' ? 'text-sky-200 text-right' : 'text-slate-400'}`}>{m.time}</p>
                </div>
              </div>
            ))}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 rounded-xl rounded-bl-sm px-3 py-2 flex items-center gap-1">
                  {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: `${i*150}ms` }} />)}
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-slate-200 flex gap-2 shrink-0 bg-white rounded-b-2xl">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type your message…"
              className="flex-1 text-xs bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-sky-400"
            />
            <button onClick={send} disabled={!input.trim() || typing} className="w-9 h-9 bg-sky-600 hover:bg-sky-700 text-white rounded-lg flex items-center justify-center transition-colors disabled:opacity-50">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ─── HERO BANNER ────────────────────────────────────────── */
function HeroBanner() {
  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden mb-5 shadow-md">
      {/* Simulated photo: dark navy gradient with Antarctic feel */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b2e5e] via-[#1a4a8a] to-[#0e3a6a]" />
      {/* Ice overlay */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(255,255,255,0.08) 0%, transparent 70%)' }} />
      {/* Station silhouette */}
      <div className="absolute bottom-0 right-0 flex items-end gap-1 p-4 opacity-25 select-none text-[80px]">🏔️🧊</div>

      <div className="absolute inset-0 flex flex-col justify-center px-8">
        <div className="text-sky-300 text-xs font-bold uppercase tracking-widest mb-1">SUPPORT CENTER</div>
        <h1 className="text-white text-2xl font-black leading-tight">Support Center</h1>
        <p className="text-blue-200 text-sm mt-1">For Maitri, Bharati, and NCPOR Goa operations</p>
        <p className="text-blue-300 text-xs mt-0.5 italic">People. Systems. Always Connected.</p>

        {/* Station status pills */}
        <div className="mt-3 flex gap-2">
          {[
            { name: 'Maitri Research Station', color: 'bg-amber-400' },
            { name: 'Bharati Research Station', color: 'bg-sky-400' }
          ].map(s => (
            <div key={s.name} className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1">
              <span className={`w-2 h-2 rounded-full ${s.color} animate-pulse`} />
              <span className="text-[10px] text-white font-semibold">{s.name}</span>
              <span className="text-[10px] text-emerald-300">Online · All Systems Nominal</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right: "Stronger Support" slogan */}
      <div className="absolute top-4 right-6 text-right">
        <div className="text-white/60 text-[11px] italic leading-tight">Stronger Support<br/>for a Safer Antarctica</div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ──────────────────────────────────────────── */
export default function SupportPage() {
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');
  const [searchQ, setSearchQ] = useState('');

  const renderContent = () => {
    switch (activeSection) {
      case 'kb':         return <div className="space-y-5"><KnowledgeBasePanel /></div>;
      case 'contacts':   return <div className="space-y-5"><StationContactsPanel /></div>;
      case 'issues':     return (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-3"><AlertCircle className="w-4 h-4 text-orange-500" /> Common Issues</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {COMMON_ISSUES.map(i => (
                <div key={i.label} className={`${i.bg} ${i.border} border rounded-xl p-4`}>
                  <div className="mb-2">{i.icon}</div>
                  <div className="text-sm font-bold text-slate-800">{i.label}</div>
                  <div className="text-xs text-slate-500 mt-1 leading-relaxed">{i.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
      case 'remote':     return <RemoteSupportPanel />;
      case 'history':    return <IncidentHistoryPanel />;
      case 'status':     return <SystemStatusPanel />;
      case 'get-help':   return (
        <div className="space-y-5">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <h3 className="text-sm font-bold text-slate-800 mb-4">Get Help — Quick Actions</h3>
            <QuickActions setSection={setActiveSection} />
          </div>
          <RemoteSupportPanel />
        </div>
      );
      default: /* overview */
        return (
          <div className="space-y-5">
            <HeroBanner />
            <EmergencyBanner />
            <QuickActions setSection={setActiveSection} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <KnowledgeBasePanel />
              <CommonIssuesPanel setSection={setActiveSection} />
            </div>
            <StationContactsPanel />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <IncidentHistoryPanel />
              <SystemStatusPanel />
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#f4f6f9] flex flex-col">
      <TopNavBar searchQ={searchQ} setSearchQ={setSearchQ} />

      <div className="flex flex-1 overflow-hidden">
        <SideBar active={activeSection} setActive={setActiveSection} />

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-4">
            <a href="/polaris/index.html" className="hover:text-sky-600 transition-colors">POLARIS</a>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-semibold text-slate-700">
              {SIDE_NAV.find(n => n.key === activeSection)?.label ?? 'Overview'}
            </span>
          </div>

          {renderContent()}

          {/* Footer */}
          <footer className="mt-10 pt-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
            <span>© 2026 National Centre for Polar &amp; Ocean Research, Ministry of Earth Sciences, Govt. of India</span>
            <div className="flex items-center gap-3">
              <a href="/polaris/index.html" className="hover:text-sky-600 transition-colors flex items-center gap-1">Main Portal <ExternalLink className="w-3 h-3" /></a>
              <span className="text-amber-500 font-mono">[SIMULATED ENGINE]</span>
            </div>
          </footer>
        </main>
      </div>

      <LiveChatWidget />
    </div>
  );
}
