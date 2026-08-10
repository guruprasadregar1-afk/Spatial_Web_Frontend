'use client';

import React from 'react';
import { Activity, Radio } from 'lucide-react';

interface StatusPillProps {
  isConnected: boolean;
  lastSyncTime?: string | null;
}

export const RealTimeStatusPill: React.FC<StatusPillProps> = ({
  isConnected,
  lastSyncTime,
}) => {
  return (
    <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono border border-purple-500/30">
      <span
        className={`w-2 h-2 rounded-full ${
          isConnected ? 'bg-purple-400 animate-pulse glow-purple' : 'bg-amber-400'
        }`}
      />
      <span className="text-purple-300 flex items-center gap-1">
        <Radio className="w-3.5 h-3.5 text-purple-400" />
        {isConnected ? 'SSE Sync Live' : 'SSE Reconnecting...'}
      </span>
      {lastSyncTime && (
        <span className="text-[10px] text-gray-400 border-l border-gray-700 pl-2">
          Sync: {lastSyncTime}
        </span>
      )}
    </div>
  );
};
