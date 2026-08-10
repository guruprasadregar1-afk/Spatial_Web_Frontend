'use client';

import React from 'react';
import { SpatialNode } from '@/types/spatial';

interface RendererProps {
  node: SpatialNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const RootNodeRenderer: React.FC<RendererProps> = ({ node }) => {
  const [x, y, z] = node.transform.position;
  const color = node.render.color || '#00f3ff';

  return (
    <group position={[x, y, z]}>
      {/* Root Ground Bounding Base Wireframe */}
      <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.3} />
      </mesh>

      {/* Root Central Beacon */}
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.5, 0.8, 1, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} wireframe />
      </mesh>
    </group>
  );
};
