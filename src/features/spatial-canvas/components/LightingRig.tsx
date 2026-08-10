'use client';

import React from 'react';

export const LightingRig: React.FC = () => {
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 20, 15]} intensity={1.2} castShadow />
      <pointLight position={[-10, 10, -10]} intensity={0.8} color="#00f3ff" />
      <pointLight position={[10, -10, 10]} intensity={0.5} color="#7000ff" />
    </>
  );
};
