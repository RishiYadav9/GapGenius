import React, { useState } from 'react';
import { GitFork, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function KnowledgeGraphView({ graphData, onFixConcept }) {
  const [selectedNode, setSelectedNode] = useState(graphData?.nodes?.[0] || null);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 text-xs bg-white rounded-2xl border border-slate-200">
        No concept dependency graph data available.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">
              Visual Knowledge Dependency Graph
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Traces broken prerequisite links to reveal root-cause cognitive gaps.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
            <span>Mastered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
            <span>Fragile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm" />
            <span>Critical Gap</span>
          </div>
        </div>
      </div>

      {/* Concept Node Cards in Prerequisite Hierarchy */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {graphData.nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isGap = node.status === 'critical_gap';
          const isFragile = node.status === 'fragile';
          const isMastered = node.status === 'mastered';

          let borderClass = 'border-slate-200';
          let badgeBg = 'bg-slate-100 text-slate-600';
          let statusText = 'Mastered';

          if (isGap) {
            borderClass = 'border-rose-300 bg-rose-50/40 shadow-sm';
            badgeBg = 'bg-rose-100 text-rose-800 border border-rose-200';
            statusText = 'Critical Gap';
          } else if (isFragile) {
            borderClass = 'border-amber-300 bg-amber-50/40 shadow-sm';
            badgeBg = 'bg-amber-100 text-amber-800 border border-amber-200';
            statusText = 'Fragile Intuition';
          } else if (isMastered) {
            borderClass = 'border-emerald-300 bg-emerald-50/40 shadow-sm';
            badgeBg = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            statusText = 'Mastered';
          }

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${borderClass} ${
                isSelected ? 'ring-2 ring-indigo-600 bg-indigo-50/40' : 'hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeBg}`}>
                  {statusText}
                </span>
                <span className="font-mono text-xs font-bold text-slate-900">
                  {node.score}%
                </span>
              </div>

              <h4 className="font-bold text-xs text-slate-900 line-clamp-1 mb-2">
                {node.label}
              </h4>

              {/* Prerequisite Indicator */}
              {node.prereqId ? (
                <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <ArrowRight className="w-3 h-3 text-indigo-600" />
                  <span>Builds upon {node.prereqId}</span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 flex items-center gap-1 font-medium">
                  <ShieldCheck className="w-3 h-3 text-teal-600" />
                  <span>Foundational Concept</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Node Inspector */}
      {selectedNode && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-slate-900">{selectedNode.label}</span>
              <span className="text-[10px] font-semibold text-slate-500">Mastery Score: {selectedNode.score}%</span>
            </div>
            <p className="text-xs text-slate-600">
              {selectedNode.status === 'critical_gap'
                ? 'Identified cognitive misconception in underlying mental model. Recommended for targeted micro-remediation.'
                : selectedNode.status === 'fragile'
                ? 'Answers were partially inconsistent or made with low confidence.'
                : 'Consistent, confident correct answers demonstrate solid schema encoding.'}
            </p>
          </div>

          {selectedNode.status !== 'mastered' && onFixConcept && (
            <button
              onClick={() => onFixConcept(selectedNode.id)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
            >
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span>Fix This Gap</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
