'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#0b0f19] p-6 text-center gap-4">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full border-red-500/30">
        <h2 className="text-xl font-bold text-red-400 mb-2">3D Engine Runtime Exception</h2>
        <p className="text-sm text-gray-400 mb-6">{error.message || 'An unexpected error occurred in WebGL canvas.'}</p>
        <Button onClick={reset} variant="primary">
          Restart 3D Canvas
        </Button>
      </div>
    </div>
  );
}
