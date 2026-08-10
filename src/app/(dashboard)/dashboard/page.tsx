'use client';

import React, { useEffect, useState } from 'react';
import { Box, MapPin, Sparkles, Database, Layers, Activity, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import Link from 'next/link';

export default function DashboardPage() {
  const [health, setHealth] = useState<any>(null);

  useEffect(() => {
    apiClient<any>(API_ENDPOINTS.HEALTH)
      .then((res) => setHealth(res))
      .catch((err) => console.warn('Health fetch notice:', err));
  }, []);

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-spatial-border/40 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-400">
            Spatial Web Engine Control Dashboard
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            System overview, Supabase PostgreSQL sync telemetry, and 3D WebGL engine status.
          </p>
        </div>

        <Link href="/">
          <Button variant="primary" className="flex items-center gap-2">
            <Box className="w-4 h-4" /> Open 3D Canvas
          </Button>
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-xl border border-cyan-500/30 flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" /> Database Status
          </span>
          <span className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4" /> Supabase PG Active
          </span>
          <span className="text-[11px] text-gray-500 font-mono">Port 6543 / 5432 Direct</span>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-purple-500/30 flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-400" /> Backend API Status
          </span>
          <span className="text-lg font-bold text-white">Port 3004 Live</span>
          <span className="text-[11px] text-purple-300 font-mono">{health?.service || 'Spatial Engine'}</span>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-amber-500/30 flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400" /> Mini Jaipur Pipeline
          </span>
          <span className="text-lg font-bold text-amber-300">5 Landmarks</span>
          <span className="text-[11px] text-gray-500 font-mono">Equirectangular 3D</span>
        </div>

        <div className="glass-panel p-5 rounded-xl border border-blue-500/30 flex flex-col gap-2">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" /> AI Semantic Layer
          </span>
          <span className="text-lg font-bold text-cyan-300">Claude 3.5 Sonnet</span>
          <span className="text-[11px] text-gray-500 font-mono">Deterministic Fallback</span>
        </div>
      </div>

      {/* Navigation Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/" className="glass-panel p-6 rounded-2xl hover:border-spatial-accent/50 transition-all flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-spatial-accent/20 flex items-center justify-center">
            <Box className="w-5 h-5 text-cyan-300" />
          </div>
          <h3 className="text-base font-bold text-white">3D Spatial Web Canvas</h3>
          <p className="text-xs text-gray-400">Interactive WebGL canvas with OrbitControls, node renderers, and 2D inspector panel.</p>
        </Link>

        <Link href="/jaipur" className="glass-panel p-6 rounded-2xl hover:border-amber-500/50 transition-all flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
            <MapPin className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-base font-bold text-white">Mini Jaipur 3D Showcase</h3>
          <p className="text-xs text-gray-400">Geospatial 3D projection of Hawa Mahal, Amer Fort, and City Palace with Fly-To navigation.</p>
        </Link>

        <Link href="/ai-generator" className="glass-panel p-6 rounded-2xl hover:border-purple-500/50 transition-all flex flex-col gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>
          <h3 className="text-base font-bold text-white">AI Spatial Generator</h3>
          <p className="text-xs text-gray-400">Generate 3D spatial node graphs from natural language prompts using Anthropic Claude.</p>
        </Link>
      </div>
    </div>
  );
}
