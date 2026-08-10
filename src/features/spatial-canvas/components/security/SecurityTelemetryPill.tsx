'use client';

import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';

interface SecurityProps {
  rateLimitLimit?: number;
  rateLimitRemaining?: number;
}

export const SecurityTelemetryPill: React.FC<SecurityProps> = ({
  rateLimitLimit = 100,
  rateLimitRemaining = 98,
}) => {
  return (
    <div className="glass-panel px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-mono border border-emerald-500/30">
      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
      <span className="text-emerald-300 flex items-center gap-1">
        <Lock className="w-3 h-3 text-emerald-400" /> Rate Limit: {rateLimitRemaining}/{rateLimitLimit}
      </span>
    </div>
  );
};
