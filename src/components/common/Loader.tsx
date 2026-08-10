import React from 'react';

export const Loader: React.FC<{ label?: string }> = ({ label = 'Loading 3D Spatial Canvas...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-4">
      <div className="w-10 h-10 border-4 border-spatial-accent/20 border-t-spatial-accent rounded-full animate-spin glow-cyan" />
      <p className="text-sm text-cyan-300 font-mono animate-pulse">{label}</p>
    </div>
  );
};
