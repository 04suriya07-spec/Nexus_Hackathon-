'use client';

import React from 'react';
import { Search, X, Loader2, Sparkles, AlertCircle } from 'lucide-react';

interface SearchBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isLoading: boolean;
  totalResults: number;
  onClear: () => void;
  onSelectQuickTerm: (term: string) => void;
}

export function SearchBar({
  searchQuery,
  onSearchChange,
  isLoading,
  totalResults,
  onClear,
  onSelectQuickTerm,
}: SearchBarProps) {
  const quickTerms = [
    'Generator 02 Vibration',
    'Priyadarshini Pipeline',
    'GSAT-17 Tracking',
    'Katabatic Blizzard',
    'Edge Sync',
    'Desalination',
  ];

  return (
    <div className="w-full">
      {/* Search Input Box */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-[#13B5EA] animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-slate-400 group-focus-within:text-[#13B5EA] transition-colors" />
          )}
        </div>

        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search technical SOPs, active alerts, station telemetry, troubleshooting trees..."
          className="w-full pl-12 pr-12 py-3.5 bg-[#0B1526] border border-[#1E3354] rounded-xl text-sm sm:text-base text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#13B5EA] focus:border-transparent transition-all shadow-lg"
        />

        {searchQuery && (
          <button
            onClick={onClear}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
            title="Clear search"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Search Chips */}
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#13B5EA]" />
          Common topics:
        </span>
        {quickTerms.map((term) => (
          <button
            key={term}
            onClick={() => onSelectQuickTerm(term)}
            className="px-2.5 py-1 rounded-md bg-[#101F38] text-slate-300 hover:text-[#13B5EA] border border-[#1E3354] hover:border-[#13B5EA]/50 transition-colors"
          >
            {term}
          </button>
        ))}

        {searchQuery && (
          <span className="ml-auto text-slate-400 font-mono text-[11px] self-center">
            {totalResults} {totalResults === 1 ? 'result' : 'results'} found
          </span>
        )}
      </div>
    </div>
  );
}
