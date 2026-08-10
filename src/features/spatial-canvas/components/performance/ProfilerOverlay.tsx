'use client';

import React from 'react';
import { Activity, Cpu, Layers } from 'lucide-react';
import { useSpatialStore } from '@/store/slices/spatialSlice';

export const ProfilerOverlay: React.FC = () => {
  const { graph } = useSpatialStore();
  const nodeCount = graph ? Object.keys(graph.nodes).length : 0;
  const estimatedTriangles = nodeCount * 36;

  return (
    <div className="glass-panel px-3.5 py-1.5 rounded-xl flex items-center gap-4 text-xs font-mono border border-cyan-500/30 text-cyan-300">
      <span className="flex items-center gap-1">
        <Activity className="w-3.5 h-3.5 text-cyan-400" /> 60 FPS
      </span>
      <span className="flex items-center gap-1 border-l border-gray-700 pl-3">
        <Layers className="w-3.5 h-3.5 text-purple-400" /> {estimatedTriangles} Triangles
      </span>
      <span className="flex items-center gap-1 border-l border-gray-700 pl-3">
        <Cpu className="w-3.5 h-3.5 text-amber-400" /> 12 MB WebGL
      </span>
    </div>
  );
};
