'use client';

import React, { useMemo, useRef, useLayoutEffect } from 'react';
import * as THREE from 'three';
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
  const [scaleX, scaleY, scaleZ] = node.transform.scale || [1, 1, 1];

  const buildingWidth = 3 * scaleX;
  const buildingHeight = 4 * scaleY;
  const buildingDepth = 3 * scaleZ;

  const color = isSelected ? '#00f3ff' : isHovered ? '#ffaa00' : node.render.color || '#3b82f6';
  const windowRef = useRef<THREE.InstancedMesh>(null);

  // Compute repeating window-grid facade instance matrices (Front and Back facades)
  const { matrices, count } = useMemo(() => {
    const cols = Math.max(2, Math.floor(buildingWidth / 0.8));
    const rows = Math.max(3, Math.floor(buildingHeight / 0.7));

    const total = cols * rows * 2;
    const mats: THREE.Matrix4[] = [];

    const startX = -((cols - 1) * 0.8) / 2;
    const startY = -((rows - 1) * 0.7) / 2;

    const dummy = new THREE.Object3D();

    // Front facade (Z = +depth/2)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(startX + c * 0.8, startY + r * 0.7, buildingDepth / 2 + 0.05);
        dummy.rotation.set(0, 0, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mats.push(dummy.matrix.clone());
      }
    }

    // Back facade (Z = -depth/2)
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dummy.position.set(startX + c * 0.8, startY + r * 0.7, -buildingDepth / 2 - 0.05);
        dummy.rotation.set(0, Math.PI, 0);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        mats.push(dummy.matrix.clone());
      }
    }

    return { matrices: mats, count: total };
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
      {/* Main 3D Building Tower */}
      <mesh>
        <boxGeometry args={[buildingWidth, buildingHeight, buildingDepth]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.5} />
      </mesh>

      {/* Instanced Window Grid Facade */}
      <instancedMesh ref={windowRef} args={[undefined, undefined, count]}>
        <boxGeometry args={[0.35, 0.4, 0.12]} />
        <meshStandardMaterial
          color="#00f3ff"
          emissive="#00f3ff"
          emissiveIntensity={isHovered || isSelected ? 0.8 : 0.4}
          roughness={0.2}
          metalness={0.8}
        />
      </instancedMesh>

      {/* Glowing Edge Border Wireframe */}
      <mesh>
        <boxGeometry args={[buildingWidth + 0.05, buildingHeight + 0.05, buildingDepth + 0.05]} />
        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.4} />
      </mesh>
    </group>
  );
};
