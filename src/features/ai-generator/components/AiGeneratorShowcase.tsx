'use client';

import React, { useState } from 'react';
import { SpatialCanvas } from '@/features/spatial-canvas/components/SpatialCanvas';
import { AiGeneratorPanel } from './AiGeneratorPanel';
import { TelemetryBadge } from './TelemetryBadge';
import { useSpatialStore } from '@/store/slices/spatialSlice';
import {
  Box,
  Folder,
  Layers,
  Settings,
  Sparkles,
  Database,
  Clock,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const AiGeneratorShowcase: React.FC = () => {
  const { graph, selectedNodeId } = useSpatialStore();
  const [aiPrompt, setAiPrompt] = useState(
    'Generate a 3D spatial node graph connecting Jaipur Hawa Mahal with Amer Fort.'
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
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>AI Spatial Node Generator</span>
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
        {/* Floating AI Prompt Panel */}
        <AiGeneratorPanel />

        {/* Center 3D Canvas Viewport */}
        <main className="flex-1 relative h-full">
          <SpatialCanvas />

          {/* Bottom Prompt Input Control Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl z-30 px-4">
            <div className="glass-panel p-3.5 rounded-2xl border border-purple-500/40 shadow-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-purple-300">
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
                <Button variant="primary" size="sm" className="px-5 font-bold glow-purple shrink-0">
                  Generate 3D Graph
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
                {activeNode ? activeNode.content.title : 'AI Generated Root Node'}
              </span>

              <div className="flex items-center justify-between pt-2 text-[11px] text-gray-400 font-mono border-t border-gray-800">
                <span>ID: {activeNode ? activeNode.id : 'ai-root-01'}</span>
                <span className="text-purple-300">Semantic Node</span>
              </div>
            </div>
          </div>

          <TelemetryBadge />
        </aside>
      </div>
    </div>
  );
};
