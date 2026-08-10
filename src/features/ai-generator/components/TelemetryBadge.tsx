'use client';

import React from 'react';
import { Cpu, Zap, CheckCircle, ShieldAlert } from 'lucide-react';

interface TelemetryProps {
  telemetry?: {
    model: string;
    totalTokens: number;
    promptTokens?: number;
    completionTokens?: number;
    fallbackUsed?: boolean;
    durationMs?: number;
  };
}

export const TelemetryBadge: React.FC<TelemetryProps> = ({
  telemetry = { model: 'claude-3-5-sonnet-mock', totalTokens: 1240, fallbackUsed: false },
}) => {
  return (
    <div className="p-3.5 rounded-xl bg-gray-900/90 border border-purple-500/30 flex flex-col gap-2 text-xs">
      <div className="flex items-center justify-between">
        <span className="font-semibold text-purple-300 flex items-center gap-1.5">
          <Cpu className="w-3.5 h-3.5 text-purple-400" /> AI Model Telemetry
        </span>
        {telemetry.fallbackUsed ? (
          <span className="glass-pill px-2 py-0.5 rounded text-[10px] text-amber-400 border-amber-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Deterministic Mode
          </span>
        ) : (
          <span className="glass-pill px-2 py-0.5 rounded text-[10px] text-emerald-400 border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" /> Anthropic Live
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-gray-300">
        <div className="p-2 rounded bg-black/40">
          <span className="text-gray-500 text-[10px] block">MODEL</span>
          <span className="text-cyan-300 font-semibold truncate block">{telemetry.model}</span>
        </div>
        <div className="p-2 rounded bg-black/40">
          <span className="text-gray-500 text-[10px] block">TOKENS USED</span>
          <span className="text-purple-300 font-semibold flex items-center gap-1">
            <Zap className="w-3 h-3 text-amber-400" /> {telemetry.totalTokens}
          </span>
        </div>
      </div>
    </div>
  );
};
