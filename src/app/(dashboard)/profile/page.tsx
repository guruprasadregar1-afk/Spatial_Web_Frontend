'use client';

import React from 'react';
import { User, ShieldCheck, Key } from 'lucide-react';

export default function ProfilePage() {
  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-spatial-border/40 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center glow-cyan">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">Spatial Administrator Profile</h1>
          <p className="text-xs text-gray-400">Guru Prasad — Lead Engineer</p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl border border-spatial-border/30 flex flex-col gap-4 text-xs text-gray-300">
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800">
          <span className="flex items-center gap-2 font-semibold"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Access Role</span>
          <span className="text-emerald-400 font-mono">System Architect</span>
        </div>
        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/60 border border-gray-800">
          <span className="flex items-center gap-2 font-semibold"><Key className="w-4 h-4 text-purple-400" /> Supabase PG Permissions</span>
          <span className="text-cyan-300 font-mono">FULL READ / WRITE</span>
        </div>
      </div>
    </div>
  );
}
