'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { SpatialNode } from '@/types/spatial';

interface RendererProps {
  node: SpatialNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const CardNodeRenderer: React.FC<RendererProps> = ({
  node,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const [x, y, z] = node.transform.position;
  const color = isSelected ? '#00f3ff' : isHovered ? '#ffaa00' : node.render.color || '#7000ff';

  return (
    <group
      position={[x, y + 1, z]}
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
      {/* 3D Glass Card Overlay */}
      <Html position={[0, 1.8, 0]} center distanceFactor={22} zIndexRange={[10, 0]}>
        <div
          className={`glass-panel p-3 rounded-xl border transition-all shadow-2xl pointer-events-none whitespace-nowrap flex flex-col gap-1 min-w-[140px] ${
            isSelected
              ? 'border-cyan-400 glow-cyan scale-105 bg-cyan-950/90'
              : isHovered
              ? 'border-amber-400 glow-purple bg-purple-950/90'
              : 'border-purple-500/40 bg-gray-950/90'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse glow-purple" />
            <span>{node.content.title}</span>
          </div>

          {node.content.body && (
            <p className="text-[10px] text-gray-300 font-mono truncate max-w-[180px]">
              {node.content.body}
            </p>
          )}
        </div>
      </Html>

      {/* 3D Floating Base Crystal Node */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[0.9, 0]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered || isSelected ? 0.6 : 0.25}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Glowing Outer Wireframe Ring */}
      <mesh position={[0, 0, 0]}>
        <octahedronGeometry args={[1.2, 0]} />
        <meshBasicMaterial color={color} wireframe transparent opacity={0.5} />
      </mesh>

      {/* Ground Glow Ring */}
      {(isSelected || isHovered) && (
        <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.8, 32]} />
          <meshBasicMaterial color="#00f3ff" side={2} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};
