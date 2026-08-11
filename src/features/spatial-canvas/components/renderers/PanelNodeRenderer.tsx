'use client';

import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { SpatialNode } from '@/types/spatial';

interface RendererProps {
  node: SpatialNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const PanelNodeRenderer: React.FC<RendererProps> = ({
  node,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const [x, y, z] = node.transform.position;
  const color = isSelected ? '#00f3ff' : isHovered ? '#ffaa00' : node.render.color || '#091c33';
  const ledRef = useRef<THREE.InstancedMesh>(null);

  const slabWidth = 2.8;
  const slabHeight = 0.25;
  const slabDepth = 1.6;

  // Compute 4 corner LED stud instance matrices
  const { matrices, count } = useMemo(() => {
    const rx = slabWidth / 2 - 0.16;
    const rz = slabDepth / 2 - 0.16;
    const positions: [number, number, number][] = [
      [rx, slabHeight / 2 + 0.04, rz],
      [-rx, slabHeight / 2 + 0.04, rz],
      [rx, slabHeight / 2 + 0.04, -rz],
      [-rx, slabHeight / 2 + 0.04, -rz],
    ];

    const mats: THREE.Matrix4[] = positions.map(([px, py, pz]) => {
      const dummy = new THREE.Object3D();
      dummy.position.set(px, py, pz);
      dummy.updateMatrix();
      return dummy.matrix.clone();
    });

    return { matrices: mats, count: positions.length };
  }, [slabWidth, slabHeight, slabDepth]);

  useLayoutEffect(() => {
    if (!ledRef.current) return;
    matrices.forEach((mat, idx) => {
      ledRef.current!.setMatrixAt(idx, mat);
    });
    ledRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <group
      position={[x, y, z]}
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
      {/* Integrated Tech Badge on Top of Slab */}
      <Html position={[0, 0.45, 0]} center distanceFactor={22} zIndexRange={[10, 0]}>
        <div
          className={`glass-panel px-3.5 py-1.5 rounded-xl border transition-all shadow-2xl pointer-events-none whitespace-nowrap flex flex-col gap-0.5 min-w-[140px] items-center ${
            isSelected
              ? 'border-cyan-400 glow-cyan scale-105 bg-cyan-950/95'
              : isHovered
              ? 'border-amber-400 glow-purple bg-blue-950/95'
              : 'border-cyan-500/50 bg-[#060e1a]/95'
          }`}
        >
          <div className="flex items-center gap-1.5 font-bold text-xs text-white uppercase tracking-wider font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse glow-cyan" />
            <span>{node.content.title}</span>
          </div>
          <span className="text-[9px] text-cyan-300 font-mono font-bold">
            ID: #{node.id.slice(-5).toUpperCase()}
          </span>
        </div>
      </Html>

      {/* Main Horizontal Tech Slab Base */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[slabWidth, slabHeight, slabDepth]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Glowing Neon Wireframe Border */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[slabWidth + 0.04, slabHeight + 0.04, slabDepth + 0.04]} />
        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.6} />
      </mesh>

      {/* Instanced 4 Corner LED Studs */}
      <instancedMesh ref={ledRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshStandardMaterial
          color="#00f3ff"
          emissive="#00f3ff"
          emissiveIntensity={isHovered || isSelected ? 1.0 : 0.7}
        />
      </instancedMesh>
    </group>
  );
};
