import React, { useState } from 'react';
import { GitFork, ArrowRight } from 'lucide-react';

export default function KnowledgeGraphView({ graphData, onFixConcept }) {
  const [selectedNode, setSelectedNode] = useState(graphData?.nodes?.[0] || null);

  if (!graphData || !graphData.nodes || graphData.nodes.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <GitFork className="w-5 h-5 text-indigo-600" />
            <span>Concept Dependency Map</span>
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Traces broken prerequisite links to reveal root-cause cognitive gaps.
          </p>
        </div>

        {/* Clean Minimal Legend */}
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Mastered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Fragile</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Critical Gap</span>
          </div>
        </div>
      </div>

      {/* Concept Node Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {graphData.nodes.map((node) => {
          const isSelected = selectedNode?.id === node.id;
          const isGap = node.status === 'critical_gap';
          const isFragile = node.status === 'fragile';
          const isMastered = node.status === 'mastered';

          let statusDot = 'bg-slate-400';
          let statusText = 'Mastered';

          if (isGap) {
            statusDot = 'bg-rose-500';
            statusText = 'Critical Gap';
          } else if (isFragile) {
            statusDot = 'bg-amber-500';
            statusText = 'Fragile Intuition';
          } else if (isMastered) {
            statusDot = 'bg-emerald-500';
            statusText = 'Mastered';
          }

          return (
            <div
              key={node.id}
              onClick={() => setSelectedNode(node)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-2 bg-white ${
                isSelected 
                  ? 'border-indigo-600 ring-1 ring-indigo-600 shadow-sm' 
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium text-slate-700">
                  <span className={`w-2 h-2 rounded-full ${statusDot}`} />
                  <span>{statusText}</span>
                </span>
                <span className="font-mono font-bold text-slate-900">
                  {node.score}%
                </span>
              </div>

              <h4 className="font-bold text-sm text-slate-900">
                {node.label}
              </h4>

              {node.prereqId && (
                <div className="text-xs text-slate-500 flex items-center gap-1 pt-1">
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>Prerequisite: {node.prereqId}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Node Details */}
      {selectedNode && (
        <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Selected Concept
            </span>
            <h4 className="text-base font-bold text-slate-900">
              {selectedNode.label}
            </h4>
            <p className="text-sm text-slate-600">
              Score: <strong>{selectedNode.score}%</strong> • Status: <strong>{selectedNode.status.replace('_', ' ')}</strong>
            </p>
          </div>

          {selectedNode.status !== 'mastered' && (
            <button
              onClick={() => onFixConcept(selectedNode.id)}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm shadow-sm transition active:scale-95 shrink-0"
            >
              Repair This Concept
            </button>
          )}
        </div>
      )}
    </div>
  );
}
