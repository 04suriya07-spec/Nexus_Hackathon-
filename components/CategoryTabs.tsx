'use client';

import React from 'react';
import {
  Layers,
  Zap,
  Droplet,
  Radio,
  CloudSnow,
  Wrench,
  AlertTriangle,
  Compass,
  MapPin,
} from 'lucide-react';

export type CategoryKey =
  | 'all'
  | 'overview'
  | 'maitri'
  | 'bharati'
  | 'power'
  | 'water'
  | 'communications'
  | 'weather'
  | 'maintenance'
  | 'troubleshooting';

interface CategoryTabsProps {
  selectedCategory: CategoryKey;
  onSelectCategory: (cat: CategoryKey) => void;
  categoryCounts: Record<CategoryKey, number>;
}

export function CategoryTabs({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}: CategoryTabsProps) {
  const categories: { key: CategoryKey; label: string; icon: React.ReactNode }[] = [
    { key: 'all', label: 'All Categories', icon: <Layers className="w-4 h-4" /> },
    { key: 'overview', label: 'Overview', icon: <Compass className="w-4 h-4" /> },
    { key: 'maitri', label: 'Maitri Station', icon: <MapPin className="w-4 h-4 text-amber-400" /> },
    { key: 'bharati', label: 'Bharati Station', icon: <MapPin className="w-4 h-4 text-[#13B5EA]" /> },
    { key: 'power', label: 'Power & Microgrid', icon: <Zap className="w-4 h-4" /> },
    { key: 'water', label: 'Water & Life Support', icon: <Droplet className="w-4 h-4" /> },
    { key: 'communications', label: 'Communications', icon: <Radio className="w-4 h-4" /> },
    { key: 'weather', label: 'Weather & Safety', icon: <CloudSnow className="w-4 h-4" /> },
    { key: 'maintenance', label: 'Maintenance', icon: <Wrench className="w-4 h-4" /> },
    { key: 'troubleshooting', label: 'Troubleshooting', icon: <AlertTriangle className="w-4 h-4" /> },
  ];

  return (
    <div className="w-full overflow-x-auto pb-2 scrollbar-thin">
      <div className="flex items-center space-x-2 min-w-max">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.key;
          const count = categoryCounts[cat.key] || 0;

          return (
            <button
              key={cat.key}
              onClick={() => onSelectCategory(cat.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-[#13B5EA]/15 text-[#13B5EA] border border-[#13B5EA]/60 shadow-[0_0_12px_rgba(19,181,234,0.2)]'
                  : 'bg-[#0B1526] text-slate-300 border border-[#1E3354] hover:bg-[#101F38] hover:text-white'
              }`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span
                className={`ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                  isActive ? 'bg-[#13B5EA] text-[#050A12] font-bold' : 'bg-[#101F38] text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
