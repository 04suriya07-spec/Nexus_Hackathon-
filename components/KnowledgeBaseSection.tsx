'use client';

import React, { useState } from 'react';
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  FileText,
  Tag,
  Cpu,
  Activity,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { SupportArticle, FREQUENT_QUESTIONS } from '@/lib/support-data';

interface KnowledgeBaseSectionProps {
  articles: SupportArticle[];
  onSelectStation: (station: 'maitri' | 'bharati') => void;
  onSelectTag: (tag: string) => void;
}

export function KnowledgeBaseSection({
  articles,
  onSelectStation,
  onSelectTag,
}: KnowledgeBaseSectionProps) {
  const [expandedArticleId, setExpandedArticleId] = useState<string | null>(null);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const toggleArticle = (id: string) => {
    setExpandedArticleId(expandedArticleId === id ? null : id);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaqIndex(expandedFaqIndex === index ? null : index);
  };

  return (
    <div className="space-y-8">
      {/* Knowledge Base Header */}
      <div className="flex items-center justify-between border-b border-[#1E3354] pb-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-[#13B5EA]" />
            Official Standard Operating Procedures &amp; Knowledge Base
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Peer-reviewed polar protocols approved by NCPOR Engineering Division (44-ISEA)
          </p>
        </div>
        <span className="text-xs font-mono text-[#13B5EA] bg-[#101F38] border border-[#1E3354] px-2.5 py-1 rounded">
          {articles.length} DOCUMENTS
        </span>
      </div>

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="p-12 text-center bg-[#0B1526] rounded-xl border border-[#1E3354]">
          <FileText className="w-10 h-10 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-200">No Knowledge Articles Found</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            No standard operating procedures or troubleshooting guides match your current filter and search criteria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {articles.map((article) => {
            const isExpanded = expandedArticleId === article.id;

            return (
              <div
                key={article.id}
                className="bg-[#0B1526] border border-[#1E3354] rounded-xl p-5 hover:border-[#13B5EA]/50 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  {/* Top Badges */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-[#13B5EA] bg-[#101F38] px-2 py-0.5 rounded border border-[#1E3354]">
                      {article.docCode}
                    </span>

                    <div className="flex items-center gap-1.5">
                      {article.station !== 'all' && article.station !== 'both' ? (
                        <button
                          onClick={() => onSelectStation(article.station as 'maitri' | 'bharati')}
                          className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded border transition-colors ${
                            article.station === 'maitri'
                              ? 'bg-amber-950/40 text-amber-300 border-amber-600/40 hover:bg-amber-900/60'
                              : 'bg-cyan-950/40 text-cyan-300 border-cyan-600/40 hover:bg-cyan-900/60'
                          }`}
                        >
                          {article.station}
                        </button>
                      ) : (
                        <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          Maitri &amp; Bharati
                        </span>
                      )}

                      {article.severity && (
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                            article.severity === 'critical'
                              ? 'bg-red-950/40 text-red-300 border-red-700/50'
                              : article.severity === 'warning'
                              ? 'bg-amber-950/40 text-amber-300 border-amber-700/50'
                              : 'bg-blue-950/40 text-blue-300 border-blue-700/50'
                          }`}
                        >
                          {article.severity}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Title & Summary */}
                  <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                    {article.title}
                  </h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    {article.summary}
                  </p>

                  {/* Technical Metadata */}
                  <div className="mt-3 pt-3 border-t border-[#1E3354]/60 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-slate-400">
                    {article.equipmentId && (
                      <div className="flex items-center gap-1 truncate font-mono">
                        <Cpu className="w-3.5 h-3.5 text-[#13B5EA] shrink-0" />
                        <span className="truncate">{article.equipmentId}</span>
                      </div>
                    )}
                    {article.telemetryMetric && (
                      <div className="flex items-center gap-1 truncate font-mono">
                        <Activity className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span className="truncate">{article.telemetryMetric}</span>
                      </div>
                    )}
                  </div>

                  {/* Tags */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {article.tags.map((tag) => (
                      <button
                        key={tag}
                        onClick={() => onSelectTag(tag)}
                        className="text-[10px] px-2 py-0.5 rounded bg-[#101F38] text-slate-400 hover:text-[#13B5EA] hover:bg-[#1E3354] transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Step-by-step procedure toggle */}
                <div className="mt-4 pt-3 border-t border-[#1E3354]">
                  {article.steps && article.steps.length > 0 && (
                    <>
                      <button
                        onClick={() => toggleArticle(article.id)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-[#13B5EA] hover:text-[#40d0f7] py-1 transition-colors"
                      >
                        <span>{isExpanded ? 'Hide SOP Checklist' : 'View Step-by-Step SOP (' + article.steps.length + ' steps)'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {isExpanded && (
                        <div className="mt-3 p-3 bg-[#050A12] border border-[#1E3354] rounded-lg space-y-2 text-xs">
                          <span className="text-[10px] font-bold text-amber-400 tracking-wider uppercase">
                            Operational Checklist:
                          </span>
                          <ol className="space-y-2 text-slate-300 pl-1">
                            {article.steps.map((step, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="w-4 h-4 rounded-full bg-[#101F38] text-[#13B5EA] font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {idx + 1}
                                </span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}
                    </>
                  )}

                  {/* Related station linkage */}
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span className="flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" /> Updated {article.lastUpdated}
                    </span>
                    <a
                      href="../polaris/index.html"
                      className="text-[#13B5EA] hover:underline flex items-center gap-1"
                    >
                      View Live Telemetry <ArrowRight className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Frequently Asked Technical Questions */}
      <div className="mt-12 bg-[#0B1526] border border-[#1E3354] rounded-xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-[#13B5EA]" />
          Frequently Asked Polar Operations Questions
        </h3>

        <div className="space-y-3">
          {FREQUENT_QUESTIONS.map((faq, index) => {
            const isFaqExpanded = expandedFaqIndex === index;

            return (
              <div
                key={index}
                className="border border-[#1E3354] rounded-lg overflow-hidden bg-[#101F38]/50"
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full text-left px-4 py-3 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 hover:text-[#13B5EA] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isFaqExpanded ? (
                    <ChevronUp className="w-4 h-4 text-[#13B5EA] shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 shrink-0 ml-2" />
                  )}
                </button>

                {isFaqExpanded && (
                  <div className="px-4 pb-3 pt-1 text-xs text-slate-300 leading-relaxed border-t border-[#1E3354]/60 bg-[#050A12]/40">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
