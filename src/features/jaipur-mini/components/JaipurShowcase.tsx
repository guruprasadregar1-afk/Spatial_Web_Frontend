'use client';

import React, { useEffect, useState } from 'react';
import { SpatialCanvas } from '@/features/spatial-canvas/components/SpatialCanvas';
import { JaipurLandmarkCard } from './JaipurLandmarkCard';
import { useSpatialStore } from '@/store/slices/spatialSlice';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import {
  Box,
  Compass,
  RefreshCw,
  Folder,
  Layers,
  Settings,
  Eye,
  Camera,
  RotateCcw,
  Sparkles,
  Database,
  Activity,
  CheckCircle,
  Clock,
  Bell,
  ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export const JaipurShowcase: React.FC = () => {
  const {
    graph,
    setGraph,
    setLoading,
    setError,
    isLoading,
    selectedNodeId,
    setSelectedNodeId,
    setTargetFocusPosition,
  } = useSpatialStore();

  const [landmarks, setLandmarks] = useState<any[]>([]);
  const [activeExplorerTab, setActiveExplorerTab] = useState<'active' | 'edit' | 'settings'>('active');
  const [aiPrompt, setAiPrompt] = useState(
    'Generate neural pathways connecting Jaipur Hawa Mahal nodes with Hampi heritage data points for network simulation.'
  );

  const activeNode = selectedNodeId && graph?.nodes[selectedNodeId] ? graph.nodes[selectedNodeId] : null;

  const fetchJaipurData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [landmarksRes, graphRes] = await Promise.all([
        apiClient<any>(API_ENDPOINTS.JAIPUR.LANDMARKS),
        apiClient<any>(API_ENDPOINTS.JAIPUR.GRAPH),
      ]);

      const rawLandmarks = landmarksRes?.data?.landmarks || landmarksRes?.data || [];
      const landmarkArray = Array.isArray(rawLandmarks) ? rawLandmarks : [];
      setLandmarks(landmarkArray);

      const visualNodes: Record<string, any> = {
        'jaipur-mini-root': {
          id: 'jaipur-mini-root',
          type: 'root',
          parentId: null,
          content: { title: 'Jaipur Old City Center Anchor' },
          transform: { position: [0, 0, 0], rotation: [0, 0, 0], scale: [1, 1, 1] },
          relations: [
            'jaipur-hawa-mahal',
            'jaipur-amer-fort',
            'jaipur-city-palace',
            'jaipur-jantar-mantar',
            'jaipur-jal-mahal',
          ],
          interaction: { selectable: true, expandable: true, hoverable: true },
          render: { color: '#00f3ff', wireframe: true },
        },
        'jaipur-hawa-mahal': {
          id: 'jaipur-hawa-mahal',
          type: 'landmark',
          parentId: 'jaipur-mini-root',
          content: { title: 'JAI_HM_01 (Hawa Mahal Main)', body: 'Five-story pink sandstone palace built in 1799.' },
          transform: { position: [-12, 4, -5], rotation: [0, 0, 0], scale: [1, 1, 1] },
          relations: [],
          interaction: { selectable: true, expandable: true, hoverable: true },
          render: { color: '#f43f5e', imageUrl: '/images/hawa_mahal.jpg' },
        },
        'jaipur-amer-fort': {
          id: 'jaipur-amer-fort',
          type: 'landmark',
          parentId: 'jaipur-mini-root',
          content: { title: 'Amer Fort (Amber Palace)', body: 'Majestic hilltop fort overlooking Maota Lake.' },
          transform: { position: [14, 5, -12], rotation: [0, 0, 0], scale: [1, 1, 1] },
          relations: [],
          interaction: { selectable: true, expandable: true, hoverable: true },
          render: { color: '#fbbf24', imageUrl: '/images/amer_fort.jpg' },
        },
        'jaipur-city-palace': {
          id: 'jaipur-city-palace',
          type: 'landmark',
          parentId: 'jaipur-mini-root',
          content: { title: 'City Palace Complex', body: 'Royal residence & museum complex in pink city heart.' },
          transform: { position: [2, 1, 8], rotation: [0, 0, 0], scale: [1, 1, 1] },
          relations: [],
          interaction: { selectable: true, expandable: true, hoverable: true },
          render: { color: '#38bdf8', imageUrl: '/images/city_palace.jpg' },
        },
      };

      setGraph({
        version: '2.1',
        rootId: 'jaipur-mini-root',
        nodes: visualNodes,
        updatedAt: new Date().toISOString(),
      });
      setSelectedNodeId('jaipur-hawa-mahal');
    } catch (err: any) {
      console.warn('Jaipur fetch fallback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJaipurData();
  }, []);

  const handleFlyToLandmark = (landmark: any) => {
    const visualPositions: Record<string, [number, number, number]> = {
      'jaipur-hawa-mahal': [-12, 4, -5],
      'jaipur-amer-fort': [14, 5, -12],
      'jaipur-city-palace': [2, 1, 8],
    };

    const targetPos = visualPositions[landmark.id] || landmark.position3D || [0, 0, 0];
    setSelectedNodeId(landmark.id);
    setTargetFocusPosition(targetPos);
  };

  return (
    <div className="relative w-full h-screen bg-[#060911] text-gray-100 flex flex-col overflow-hidden font-sans">
      {/* Top Navigation Bar */}
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
          <span>Jaipur Spatial Node Graph</span>
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
        {/* Left Control Panel Sidebar */}
        <aside className="w-72 bg-[#080c16]/90 border-r border-cyan-500/20 p-4 flex flex-col justify-between z-30 overflow-y-auto">
          <div className="flex flex-col gap-4">
            {/* Project Explorer */}
            <div className="glass-panel p-3.5 rounded-xl border border-spatial-border/30 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider">
                <span>Project Explorer</span>
                <span className="text-gray-500">...</span>
              </div>

              <div className="flex flex-col gap-1.5 text-xs text-gray-400">
                <div className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer">
                  <Folder className="w-3.5 h-3.5 text-cyan-400" /> Assets
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer">
                  <Layers className="w-3.5 h-3.5 text-purple-400" /> Nodes
                </div>
                <div className="flex items-center gap-2 p-1.5 rounded hover:bg-white/5 cursor-pointer">
                  <Settings className="w-3.5 h-3.5 text-amber-400" /> Settings
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-gray-900 border border-gray-800 text-[10px]">
                <button
                  onClick={() => setActiveExplorerTab('active')}
                  className={`py-1 rounded font-semibold ${
                    activeExplorerTab === 'active' ? 'bg-spatial-accent text-gray-950 glow-cyan' : 'text-gray-400'
                  }`}
                >
                  Active
                </button>
                <button
                  onClick={() => setActiveExplorerTab('edit')}
                  className={`py-1 rounded font-semibold ${
                    activeExplorerTab === 'edit' ? 'bg-spatial-accent text-gray-950 glow-cyan' : 'text-gray-400'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setActiveExplorerTab('settings')}
                  className={`py-1 rounded font-semibold ${
                    activeExplorerTab === 'settings' ? 'bg-spatial-accent text-gray-950 glow-cyan' : 'text-gray-400'
                  }`}
                >
                  Settings
                </button>
              </div>
            </div>

            {/* 3D Camera Controls */}
            <div className="glass-panel p-3.5 rounded-xl border border-spatial-border/30 flex flex-col gap-3">
              <div className="flex items-center justify-between text-xs font-bold text-gray-300 uppercase tracking-wider">
                <span>3D Camera Controls</span>
                <span className="text-gray-500">...</span>
              </div>

              <div className="grid grid-cols-4 gap-1.5">
                <button className="p-2 rounded-lg bg-spatial-accent/20 border border-spatial-accent/40 text-cyan-300 flex flex-col items-center gap-1 text-[10px] font-bold">
                  <Compass className="w-3.5 h-3.5" /> Orbit
                </button>
                <button className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white flex flex-col items-center gap-1 text-[10px] font-bold">
                  <Eye className="w-3.5 h-3.5" /> Pan
                </button>
                <button className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white flex flex-col items-center gap-1 text-[10px] font-bold">
                  <Camera className="w-3.5 h-3.5" /> Zoom
                </button>
                <button className="p-2 rounded-lg bg-gray-900 border border-gray-800 text-gray-400 hover:text-white flex flex-col items-center gap-1 text-[10px] font-bold">
                  <RotateCcw className="w-3.5 h-3.5" /> Focus
                </button>
              </div>

              <div className="flex flex-col gap-2 pt-2 text-[11px] font-mono text-gray-400 border-t border-gray-800">
                <div className="flex justify-between items-center">
                  <span>Camera:</span>
                  <span className="text-cyan-300">Free Orbit</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <span className="p-1 rounded bg-gray-900 border border-gray-800 text-cyan-300">Pos: -102.4</span>
                  <span className="p-1 rounded bg-gray-900 border border-gray-800 text-cyan-300">65.1</span>
                  <span className="p-1 rounded bg-gray-900 border border-gray-800 text-cyan-300">204.3</span>
                </div>
                <div className="grid grid-cols-3 gap-1 text-center">
                  <span className="p-1 rounded bg-gray-900 border border-gray-800 text-purple-300">Rot: 23.1</span>
                  <span className="p-1 rounded bg-gray-900 border border-gray-800 text-purple-300">-12.5</span>
                  <span className="p-1 rounded bg-gray-900 border border-gray-800 text-purple-300">0.0</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Center 3D Canvas Viewport */}
        <main className="flex-1 relative h-full">
          <SpatialCanvas />

          {/* Bottom Prompt Input Control Bar */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-3xl z-30 px-4">
            <div className="glass-panel p-3.5 rounded-2xl border border-cyan-500/40 shadow-2xl flex flex-col gap-2">
              <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" /> AI Semantic Prompt Layer
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
                {activeNode ? activeNode.content.title : 'JAI_HM_01 (Hawa Mahal Main)'}
              </span>

              <div className="flex items-center justify-between pt-2 text-[11px] text-gray-400 font-mono border-t border-gray-800">
                <span>ID: {activeNode ? activeNode.id : 'HM-01'}</span>
                <span className="text-purple-300">Heritage Node</span>
              </div>

              <div className="p-2 rounded bg-gray-900 border border-gray-800 text-[11px] font-mono text-cyan-300 mt-1">
                Coordinates: X: {activeNode ? activeNode.transform.position[0] : '145.23'} | Y:{' '}
                {activeNode ? activeNode.transform.position[1] : '89.67'} | Z:{' '}
                {activeNode ? activeNode.transform.position[2] : '-210.45'}
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

              <div className="flex flex-col gap-1 text-[11px]">
                <div className="flex justify-between text-gray-400">
                  <span>VRAM:</span>
                  <span className="text-purple-300 font-bold">3.4GB / 8GB</span>
                </div>
                <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800">
                  <div className="bg-purple-400 h-full w-[42%]" />
                </div>
              </div>

              <div className="flex justify-between text-[10px] text-gray-400 border-t border-gray-800 pt-1.5">
                <span>Render Time:</span>
                <span className="text-cyan-300 font-mono">8.7ms</span>
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

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button className="py-1 px-2 rounded bg-gray-900 border border-gray-800 text-[10px] text-gray-300 hover:text-white font-mono">
                API
              </button>
              <button className="py-1 px-2 rounded bg-gray-900 border border-gray-800 text-[10px] text-gray-300 hover:text-white font-mono">
                GraphQL
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
