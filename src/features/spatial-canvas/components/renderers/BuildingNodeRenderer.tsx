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

export const BuildingNodeRenderer: React.FC<RendererProps> = ({
  node,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const [x, y, z] = node.transform.position;
  const color = isSelected ? '#00f3ff' : isHovered ? '#ffaa00' : node.render.color || '#1e293b';

  return (
    <group
      position={[x, y + 2, z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.(node.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover?.(null);
      }}
    >
      {/* 3D Building Tower */}
      <mesh>
        <boxGeometry args={[3, 4, 3]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Glowing Edge Border Wireframe */}
      <mesh>
        <boxGeometry args={[3.05, 4.05, 3.05]} />
        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
};
