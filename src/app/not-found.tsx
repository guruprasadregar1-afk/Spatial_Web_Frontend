import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="w-full h-[calc(100vh-4rem)] flex flex-col items-center justify-center bg-[#0b0f19] p-6 text-center gap-4">
      <div className="glass-panel p-8 rounded-2xl max-w-md w-full">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-purple-400 mb-2">
          404
        </h1>
        <h2 className="text-lg font-semibold text-gray-200 mb-2">Spatial Coordinate Not Found</h2>
        <p className="text-sm text-gray-400 mb-6">The requested 3D route does not exist in spatial engine memory.</p>
        <Link href="/">
          <Button variant="primary">Return to 3D Canvas</Button>
        </Link>
      </div>
    </div>
  );
}
