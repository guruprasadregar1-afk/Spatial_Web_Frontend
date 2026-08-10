'use client';

import React, { useState } from 'react';
import { SpatialCanvas } from '@/features/spatial-canvas/components/SpatialCanvas';
import { ContentIngestPanel } from './ContentIngestPanel';
import { useSpatialStore } from '@/store/slices/spatialSlice';
import {
  Box,
  Folder,
  Layers,
  Settings,
  Compass,
  Eye,
  Camera,
  RotateCcw,
  Sparkles,
  Database,
  Clock,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const ContentIngestShowcase: React.FC = () => {
  const { graph, selectedNodeId } = useSpatialStore();
  const [activeExplorerTab, setActiveExplorerTab] = useState<'active' | 'edit' | 'settings'>('active');
  const [aiPrompt, setAiPrompt] = useState(
    'Transform HTML DOM documents into 3D spatial node networks with deterministic tree layout.'
  );

  const activeNode = selectedNodeId && graph?.nodes[selectedNodeId] ? graph.nodes[selectedNodeId] : null;

  return (
    <div className="relative w-full h-screen bg-[#060911] text-gray-100 flex flex-col overflow-hidden font-sans">
      {/* Top Header Navigation Bar */}
      <header className="h-14 bg-[#0b0f19]/90 border-b border-cyan-500/20 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center glow-cyan">
            <Box className="w-5 h-5 text-gray-950 stroke-[2.5]" />
          </div>
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-bold tracking-wider text-white">SPATIAL WEB ENGINE</h1>
            <span className="glass-pill px-1.5 py-0.5 rounded text-[10px] font-mono text-cyan-300 border-cyan-500/30">
              v2.1
            </span>
          </div>
        </div>

        {/* Scene Dropdown Selector */}
        <div className="glass-panel px-4 py-1.5 rounded-xl border border-spatial-border/40 flex items-center gap-2 text-xs font-semibold text-gray-200 cursor-pointer hover:border-spatial-accent/50">
          <Folder className="w-3.5 h-3.5 text-cyan-400" />
          <span>Web Content Ingest Pipeline</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400 ml-2" />
        </div>

        {/* Right Header Status Telemetry */}
        <div className="flex items-center gap-4 text-xs font-mono text-gray-300">
          <span className="flex items-center gap-1.5 text-gray-400">
            <Clock className="w-3.5 h-3.5 text-cyan-400" /> 10:09 AM
          </span>
          <button className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white">
            <Bell className="w-4 h-4" />
          </button>
          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500 border border-purple-400 flex items-center justify-center text-xs font-bold text-white">
            AG
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 relative flex overflow-hidden">
        {/* Floating Web Content Ingest Control Drawer Panel */}
        <ContentIngestPanel />

        {/* Center 3D Canvas Viewport */}
        <main className="flex-1 relative h-full">
          <SpatialCanvas />

          {/* Bottom Prompt Input Control Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl z-30 px-4">
            <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Semantic Prompt Converter Layer
                </span>
                <span className="text-[10px] text-gray-400 font-mono">Claude 3.5 Sonnet Engine</span>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  className="flex-1 px-3.5 py-2 rounded-xl bg-gray-950/80 border border-spatial-border text-xs text-cyan-200 placeholder-gray-500 focus:outline-none focus:border-spatial-accent transition-all font-mono"
                />
                <Button variant="primary" size="sm" className="px-5 font-bold glow-cyan shrink-0">
                  Execute
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* Right Inspector & Telemetry Sidebar */}
        <aside className="w-72 bg-[#080c16]/90 border-l border-cyan-500/20 p-4 flex flex-col gap-4 z-30 overflow-y-auto">
          {/* Node Inspector */}
          <div className="glass-panel p-3.5 rounded-xl border border-spatial-border/30 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider">
              <span>Node Inspector</span>
              <span className="text-gray-500">...</span>
            </div>

            <div className="flex flex-col gap-1.5 text-xs">
              <span className="text-gray-400">Selected Node:</span>
              <span className="font-bold text-white text-sm font-mono truncate">
                {activeNode ? activeNode.content.title : 'Ingested Root Environment'}
              </span>

              <div className="flex items-center justify-between pt-2 text-[11px] text-gray-400 font-mono border-t border-gray-800">
                <span>ID: {activeNode ? activeNode.id : 'ingest-root-01'}</span>
                <span className="text-purple-300">Spatial Node</span>
              </div>

              <div className="p-2 rounded bg-gray-900 border border-gray-800 text-[11px] font-mono text-cyan-300 mt-1">
                Coordinates: X: {activeNode ? activeNode.transform.position[0] : '0.00'} | Y:{' '}
                {activeNode ? activeNode.transform.position[1] : '0.00'} | Z:{' '}
                {activeNode ? activeNode.transform.position[2] : '0.00'}
              </div>
            </div>
          </div>

          {/* Real-Time Telemetry */}
          <div className="glass-panel p-3.5 rounded-xl border border-spatial-border/30 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider">
              <span>Real-Time Telemetry</span>
              <span className="text-gray-500">...</span>
            </div>

            <div className="flex flex-col gap-2 font-mono text-xs">
              <div className="flex justify-between items-center text-cyan-300 font-bold">
                <span>FPS: 114</span>
                <span className="text-[10px] text-gray-500">(avg: 112-118)</span>
              </div>

              {/* Sparkline Visual Graph */}
              <div className="h-8 w-full bg-cyan-950/40 rounded border border-cyan-500/30 p-1 flex items-end gap-1">
                <div className="w-1/6 h-[60%] bg-cyan-400/80 rounded-t" />
                <div className="w-1/6 h-[80%] bg-cyan-400/80 rounded-t" />
                <div className="w-1/6 h-[70%] bg-cyan-400/80 rounded-t" />
                <div className="w-1/6 h-[90%] bg-cyan-400/80 rounded-t" />
                <div className="w-1/6 h-[65%] bg-cyan-400/80 rounded-t" />
                <div className="w-1/6 h-[85%] bg-cyan-400/80 rounded-t" />
              </div>

              <div className="flex flex-col gap-1 pt-1 text-[11px]">
                <div className="flex justify-between text-gray-400">
                  <span>GPU Load:</span>
                  <span className="text-emerald-400 font-bold">68%</span>
                </div>
                <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800">
                  <div className="bg-emerald-400 h-full w-[68%]" />
                </div>
              </div>
            </div>
          </div>

          {/* Supabase Status */}
          <div className="glass-panel p-3 rounded-xl border border-emerald-500/30 flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs text-emerald-300 font-bold">
              <span className="flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-emerald-400" /> SUPABASE
              </span>
              <span className="flex items-center gap-1 text-[10px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Connected
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
