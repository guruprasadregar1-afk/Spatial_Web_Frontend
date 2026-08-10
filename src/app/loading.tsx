import React from 'react';
import { Loader } from '@/components/common/Loader';

export default function Loading() {
  return (
    <div className="w-full h-[calc(100vh-4rem)] flex items-center justify-center bg-[#0b0f19]">
      <Loader label="Initializing 3D Spatial Canvas & WebGL Shaders..." />
    </div>
  );
}
