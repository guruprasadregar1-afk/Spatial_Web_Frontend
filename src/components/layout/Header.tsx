'use client';

import React, { useState } from 'react';
import { Box, Sparkles, MapPin, UploadCloud, Database, Server } from 'lucide-react';
import Link from 'next/link';
import { AssetRegistryModal } from '@/features/spatial-canvas/components/assets/AssetRegistryModal';

export const Header: React.FC = () => {
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);

  return (
    <>
      <AssetRegistryModal isOpen={isAssetModalOpen} onClose={() => setIsAssetModalOpen(false)} />

      <header className="h-16 border-b border-spatial-border/40 glass-panel fixed top-0 left-0 right-0 z-50 px-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 decoration-none">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-spatial-purple to-spatial-accent flex items-center justify-center glow-cyan">
            <Box className="w-5 h-5 text-gray-950 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-purple-400">
              SPATIAL WEB ENGINE
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">v1.0 — Stage 3 Jaipur 3D WebGL Engine</p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm">
          <Link href="/" className="flex items-center gap-2 text-cyan-300 hover:text-white transition-colors">
            <Box className="w-4 h-4" /> 3D Canvas
          </Link>
          <Link href="/jaipur" className="flex items-center gap-2 text-gray-400 hover:text-cyan-300 transition-colors">
            <MapPin className="w-4 h-4 text-amber-400" /> Mini Jaipur
          </Link>
          <Link href="/ai-generator" className="flex items-center gap-2 text-gray-400 hover:text-purple-400 transition-colors">
            <Sparkles className="w-4 h-4 text-purple-400" /> AI Generator
          </Link>
          <Link href="/ingest" className="flex items-center gap-2 text-gray-400 hover:text-cyan-300 transition-colors">
            <UploadCloud className="w-4 h-4 text-blue-400" /> Web Ingest
          </Link>
          <button
            onClick={() => setIsAssetModalOpen(true)}
            className="flex items-center gap-2 text-gray-400 hover:text-purple-300 transition-colors"
          >
            <Database className="w-4 h-4 text-purple-400" /> 3D Assets
          </button>
          <Link href="http://localhost:3004/api/v1/docs" target="_blank" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
            <Server className="w-4 h-4 text-emerald-400" /> OpenAPI Docs
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="glass-pill px-3 py-1 rounded-full flex items-center gap-2 text-xs text-emerald-400 font-mono border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Backend Port 3004 Live
          </div>
        </div>
      </header>
    </>
  );
};
