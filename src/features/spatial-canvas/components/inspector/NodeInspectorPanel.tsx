'use client';

import React from 'react';
import { X, Edit3, Layers, MapPin, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSpatialStore } from '@/store/slices/spatialSlice';

interface InspectorProps {
  onEditNode?: () => void;
}

export const NodeInspectorPanel: React.FC<InspectorProps> = ({ onEditNode }) => {
  const { graph, selectedNodeId, setSelectedNodeId } = useSpatialStore();

  if (!selectedNodeId || !graph || !graph.nodes[selectedNodeId]) {
    return null;
  }

  const node = graph.nodes[selectedNodeId];
  const [x, y, z] = node.transform.position;

  return (
    <div className="absolute top-20 right-6 w-80 z-30 glass-panel p-5 rounded-2xl flex flex-col gap-4 shadow-2xl border border-spatial-border/40 animate-in fade-in slide-in-from-right-4 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-spatial-border/30">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 glow-cyan animate-pulse" />
          <h3 className="text-sm font-bold text-white truncate max-w-[180px]">
            {node.content.title}
          </h3>
        </div>
        <button
          onClick={() => setSelectedNodeId(null)}
          className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Semantic Badge & Coordinates */}
      <div className="flex items-center gap-2 text-xs">
        <span className="glass-pill px-2.5 py-1 rounded-md text-cyan-300 font-mono flex items-center gap-1.5 uppercase">
          <Tag className="w-3 h-3" /> {node.type}
        </span>
        <span className="glass-pill px-2.5 py-1 rounded-md text-gray-300 font-mono flex items-center gap-1.5">
          <MapPin className="w-3 h-3 text-amber-400" /> [{x}, {y}, {z}]
        </span>
      </div>

      {/* Description / Content Body */}
      {node.content.body && (
        <div className="p-3 rounded-lg bg-gray-900/60 border border-gray-800 text-xs text-gray-300">
          <p className="leading-relaxed">{node.content.body}</p>
        </div>
      )}

      {/* Parent / Relations Metadata */}
      <div className="flex flex-col gap-2">
        <h4 className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Layers className="w-3 h-3 text-purple-400" /> Relations ({node.relations.length})
        </h4>
        <div className="flex flex-wrap gap-1.5">
          {node.relations.length > 0 ? (
            node.relations.map((relId) => (
              <button
                key={relId}
                onClick={() => setSelectedNodeId(relId)}
                className="glass-pill px-2 py-0.5 rounded text-[11px] font-mono text-purple-300 hover:text-white transition-colors"
              >
                {relId}
              </button>
            ))
          ) : (
            <span className="text-xs text-gray-500 italic">No child relations</span>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="pt-2 border-t border-spatial-border/30 flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onEditNode} className="w-full flex items-center justify-center gap-2">
          <Edit3 className="w-3.5 h-3.5" /> Edit Node Transform
        </Button>
      </div>
    </div>
  );
};
