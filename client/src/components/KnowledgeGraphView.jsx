import React, { useState } from 'react';
import { GitFork, AlertTriangle, CheckCircle2, ArrowRight, ShieldCheck, Flame } from 'lucide-react';

export default function KnowledgeGraphView({ graphData, onFixConcept }) {
  const [selectedNode, setSelectedNode] = useState(graphData.nodes[0] || null);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return (
      <div className="p-6 text-center text-slate-500 text-xs">
        No concept dependency graph data available.
      </div>
    );
  }

  return (
    <div className="glass-panel rounded-2xl p-6 border border-slate-800">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">
              Visual Knowledge Dependency Graph
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Traces broken prerequisite links to reveal root-cause cognitive gaps.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
            <span>Mastered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50" />
            <span>Fragile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse shadow-sm shadow-rose-500/50" />
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

          let borderClass = 'border-slate-800';
          let badgeBg = 'bg-slate-800 text-slate-400';
          let statusText = 'Mastered';

          if (isGap) {
            borderClass = 'border-rose-500/50 shadow-lg shadow-rose-500/5';
            badgeBg = 'bg-rose-500/10 text-rose-400 border border-rose-500/30';
            statusText = 'Critical Gap';
          } else if (isFragile) {
            borderClass = 'border-amber-500/50 shadow-lg shadow-amber-500/5';
            badgeBg = 'bg-amber-500/10 text-amber-300 border border-amber-500/30';
            statusText = 'Fragile Intuition';
          } else if (isMastered) {
            borderClass = 'border-emerald-500/50 shadow-lg shadow-emerald-500/5';
            badgeBg = 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30';
            statusText = 'Mastered';
          }

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${borderClass} ${
                isSelected ? 'ring-2 ring-indigo-500 bg-slate-800/80' : 'bg-slate-900/60 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${badgeBg}`}>
                  {statusText}
                </span>
                <span className="font-mono text-xs font-bold text-white">
                  {node.score}%
                </span>
              </div>

              <h4 className="font-semibold text-xs text-slate-200 line-clamp-1 mb-2">
                {node.label}
              </h4>

              {/* Prerequisite Indicator */}
              {node.prereqId ? (
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-indigo-400" />
                  <span>Builds upon {node.prereqId}</span>
                </div>
              ) : (
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  <span>Foundational Concept</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detailed Node Inspector & Root-Cause Remediation Launcher */}
      {selectedNode && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold text-white">{selectedNode.label}</span>
              <span className="text-[10px] text-slate-400">Mastery Score: {selectedNode.score}%</span>
            </div>
            <p className="text-xs text-slate-400">
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
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500 hover:from-rose-400 hover:to-orange-400 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
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
