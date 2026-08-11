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

export const BuildingNodeRenderer: React.FC<RendererProps> = ({
  node,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const [x, y, z] = node.transform.position;

  const buildingWidth = 2.4;
  const buildingHeight = 8.5;
  const buildingDepth = 2.4;

  const color = isSelected ? '#00f3ff' : isHovered ? '#ffaa00' : node.render.color || '#091c33';
  const windowRef = useRef<THREE.InstancedMesh>(null);

  // Compute 4-face window grid instance matrices (Front, Back, Left, Right facades)
  const { matrices, count } = useMemo(() => {
    const cols = 2;
    const rows = 9;
    const mats: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    const startX = -((cols - 1) * 0.7) / 2;
    const startY = -((rows - 1) * 0.8) / 2;

    // 1. Front facade (Z = +depth/2)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(startX + c * 0.7, startY + r * 0.8, buildingDepth / 2 + 0.04);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mats.push(dummy.matrix.clone());
      }
    }

    // 2. Back facade (Z = -depth/2)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(startX + c * 0.7, startY + r * 0.8, -buildingDepth / 2 - 0.04);
        dummy.rotation.set(0, Math.PI, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mats.push(dummy.matrix.clone());
      }
    }

    // 3. Right facade (X = +width/2)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(buildingWidth / 2 + 0.04, startY + r * 0.8, startX + c * 0.7);
        dummy.rotation.set(0, Math.PI / 2, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mats.push(dummy.matrix.clone());
      }
    }

    // 4. Left facade (X = -width/2)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(-buildingWidth / 2 - 0.04, startY + r * 0.8, startX + c * 0.7);
        dummy.rotation.set(0, -Math.PI / 2, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mats.push(dummy.matrix.clone());
      }
    }

    return { matrices: mats, count: mats.length };
  }, [buildingWidth, buildingHeight, buildingDepth]);

  useLayoutEffect(() => {
    if (!windowRef.current) return;
    matrices.forEach((mat, idx) => {
      windowRef.current!.setMatrixAt(idx, mat);
    });
    windowRef.current.instanceMatrix.needsUpdate = true;
  }, [matrices]);

  return (
    <group
      position={[x, y + buildingHeight / 2, z]}
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
      {/* 3D Floating Spire Title Badge */}
      <Html position={[0, 6.2, 0]} center distanceFactor={22} zIndexRange={[20, 0]}>
        <div className="glass-panel px-3 py-1.5 rounded-xl border border-cyan-400/60 bg-[#060e1a]/95 text-cyan-300 font-mono shadow-2xl flex flex-col items-center pointer-events-none whitespace-nowrap">
          <span className="font-bold text-xs text-white tracking-widest uppercase">
            {node.content.title || 'WEB DATA INGEST'}
          </span>
          <span className="text-[9px] text-cyan-400 font-bold">ROUTE C SPATIAL VIEWPORT</span>
        </div>
      </Html>

      {/* Ground Base Pad under Skyscraper */}
      <mesh position={[0, -buildingHeight / 2 + 0.1, 0]}>
        <boxGeometry args={[3.8, 0.25, 3.8]} />
        <meshStandardMaterial color="#07111e" roughness={0.8} metalness={0.9} />
      </mesh>
      <mesh position={[0, -buildingHeight / 2 + 0.1, 0]}>
        <boxGeometry args={[3.85, 0.28, 3.85]} />
        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.6} />
      </mesh>

      {/* Main 3D Skyscraper Body */}
      <mesh>
        <boxGeometry args={[buildingWidth, buildingHeight, buildingDepth]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Instanced 4-Face Window Grid Facade */}
      <instancedMesh ref={windowRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.3, 0.45, 0.1]} />
        <meshStandardMaterial
          color="#00f3ff"
          emissive="#00f3ff"
          emissiveIntensity={isHovered || isSelected ? 0.9 : 0.6}
          roughness={0.1}
          metalness={0.9}
        />
      </instancedMesh>

      {/* Glowing Neon Edge Wireframe Outline */}
      <mesh>
        <boxGeometry args={[buildingWidth + 0.05, buildingHeight + 0.05, buildingDepth + 0.05]} />
        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.6} />
      </mesh>

      {/* Top Roof Step Tier */}
      <mesh position={[0, buildingHeight / 2 + 0.4, 0]}>
        <boxGeometry args={[1.6, 0.8, 1.6]} />
        <meshStandardMaterial color="#071426" roughness={0.3} metalness={0.9} />
      </mesh>
      <mesh position={[0, buildingHeight / 2 + 0.4, 0]}>
        <boxGeometry args={[1.64, 0.84, 1.64]} />
        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.7} />
      </mesh>

      {/* Spire Antenna */}
      <mesh position={[0, buildingHeight / 2 + 1.4, 0]}>
        <cylinderGeometry args={[0.04, 0.08, 1.2, 16]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={0.8} />
      </mesh>

      {/* Top Beacon Glow Sphere */}
      <mesh position={[0, buildingHeight / 2 + 2.0, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={1.0} />
      </mesh>
    </group>
  );
};
