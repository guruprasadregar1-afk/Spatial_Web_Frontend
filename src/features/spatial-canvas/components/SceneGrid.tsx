'use client';

import React from 'react';
import { Grid } from '@react-three/drei';

export const SceneGrid: React.FC = () => {
  return (
    <Grid
      position={[0, -0.01, 0]}
      args={[100, 100]}
      cellSize={1}
      cellThickness={1}
      cellColor="#00f3ff"
      sectionSize={5}
      sectionThickness={1.5}
      sectionColor="#7000ff"
      fadeDistance={60}
      fadeStrength={1}
    />
  );
};
