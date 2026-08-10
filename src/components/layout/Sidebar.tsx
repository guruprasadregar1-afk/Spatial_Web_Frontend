import React from 'react';
import { Box, MapPin, Sparkles, UploadCloud, Database, Layers, Activity } from 'lucide-react';
import Link from 'next/link';

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 glass-panel border-r border-spatial-border/30 fixed top-16 bottom-0 left-0 p-4 flex flex-col justify-between hidden lg:flex z-40">
      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Spatial Navigation</h2>
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-spatial-accent/10 text-cyan-300 font-medium text-sm border border-spatial-accent/30"
            >
              <Box className="w-4 h-4 text-cyan-300" /> 3D Spatial Canvas
            </Link>
            <Link
              href="/jaipur"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white font-medium text-sm transition-all"
            >
              <MapPin className="w-4 h-4 text-amber-400" /> Mini Jaipur 3D
            </Link>
            <Link
              href="/ai-generator"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white font-medium text-sm transition-all"
            >
              <Sparkles className="w-4 h-4 text-purple-400" /> AI Spatial Generator
            </Link>
            <Link
              href="/ingest"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 text-gray-300 hover:text-white font-medium text-sm transition-all"
            >
              <UploadCloud className="w-4 h-4 text-blue-400" /> Web Content Ingest
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Engine Services</h2>
          <div className="flex flex-col gap-2 text-xs text-gray-400">
            <div className="flex items-center justify-between p-2 rounded bg-gray-900/60 border border-gray-800">
              <span className="flex items-center gap-2"><Database className="w-3.5 h-3.5 text-blue-400" /> Database</span>
              <span className="text-emerald-400 font-mono text-[10px]">Supabase PG</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-gray-900/60 border border-gray-800">
              <span className="flex items-center gap-2"><Layers className="w-3.5 h-3.5 text-amber-400" /> 3D Solvers</span>
              <span className="text-cyan-300 font-mono text-[10px]">AABB & Radials</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded bg-gray-900/60 border border-gray-800">
              <span className="flex items-center gap-2"><Activity className="w-3.5 h-3.5 text-purple-400" /> SSE Sync</span>
              <span className="text-purple-300 font-mono text-[10px]">Port 3004</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-gray-900/80 border border-spatial-border/30 text-xs text-gray-400">
        <p className="font-semibold text-gray-200">Deterministic Engine</p>
        <p className="text-[11px] mt-1">AI generates layout recommendations; deterministic solvers maintain authority over 3D placement.</p>
      </div>
    </aside>
  );
};
