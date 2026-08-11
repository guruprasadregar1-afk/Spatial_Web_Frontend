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
  const color = isSelected ? '#00f3ff' : isHovered ? '#ffaa00' : node.render.color || '#3b82f6';
  const studRef = useRef<THREE.InstancedMesh>(null);

  // Compute 12 instanced radial studs around the outer ring perimeter
  const { matrices, count } = useMemo(() => {
    const studCount = 12;
    const radius = 1.4;
    const mats: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < studCount; i++) {
      const angle = (i / studCount) * Math.PI * 2;
      dummy.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
      dummy.rotation.set(0, -angle, 0);
      dummy.scale.set(1, 1, 1);
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());
    }

    return { matrices: mats, count: studCount };
  }, []);

  useLayoutEffect(() => {
    if (!studRef.current) return;
    matrices.forEach((mat, idx) => {
      studRef.current!.setMatrixAt(idx, mat);
    });
    studRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <group
      position={[x, y + 1.2, z]}
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
      {/* 3D Glass Panel Overlay */}
      <Html position={[0, 2.2, 0]} center distanceFactor={22} zIndexRange={[10, 0]}>
        <div
          className={`glass-panel p-3.5 rounded-xl border transition-all shadow-2xl pointer-events-none whitespace-nowrap flex flex-col gap-1 min-w-[160px] ${
            isSelected
              ? 'border-cyan-400 glow-cyan scale-105 bg-cyan-950/90'
              : isHovered
              ? 'border-amber-400 glow-purple bg-blue-950/90'
              : 'border-cyan-500/40 bg-gray-950/90'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-xs text-white">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse glow-cyan" />
            <span>{node.content.title}</span>
          </div>

          {node.content.body && (
            <p className="text-[10px] text-gray-300 font-mono truncate max-w-[200px]">
              {node.content.body}
            </p>
          )}
        </div>
      </Html>

      {/* 3D Sphere Node Crystal */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.9, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={isHovered || isSelected ? 0.5 : 0.25}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Instanced Perimeter Studs / Edge Details */}
      <instancedMesh ref={studRef} args={[undefined, undefined, count]}>
        <sphereGeometry args={[0.08, 12, 12]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </instancedMesh>

      {/* Outer Wireframe Ring */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[1.4, 0.05, 16, 100]} />
        <meshBasicMaterial color={color} transparent opacity={0.6} />
      </mesh>

      {/* Selection Glow Ring */}
      {(isSelected || isHovered) && (
        <mesh position={[0, -1.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.5, 2.2, 32]} />
          <meshBasicMaterial color="#00f3ff" side={2} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};
