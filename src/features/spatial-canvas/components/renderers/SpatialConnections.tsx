'use client';

import React from 'react';
import * as THREE from 'three';
import { useSpatialStore } from '@/store/slices/spatialSlice';

export const SpatialConnections: React.FC = () => {
  const { graph } = useSpatialStore();

  if (!graph) return null;

  const linesMap = new Map<string, { start: [number, number, number]; end: [number, number, number]; color: string }>();

  // 1. Parent to Child relationships
  Object.values(graph.nodes).forEach((node) => {
    if (node.parentId && graph.nodes[node.parentId]) {
      const parent = graph.nodes[node.parentId];
      const key = [parent.id, node.id].sort().join('--');

      linesMap.set(key, {
        start: parent.transform.position,
        end: node.transform.position,
        color: node.render.color || '#00f3ff',
      });
    }

    // 2. Custom node relations array
    if (node.relations && Array.isArray(node.relations)) {
      node.relations.forEach((relId) => {
        if (graph.nodes[relId]) {
          const targetNode = graph.nodes[relId];
          const key = [node.id, targetNode.id].sort().join('--');

          if (!linesMap.has(key)) {
            linesMap.set(key, {
              start: node.transform.position,
              end: targetNode.transform.position,
              color: node.render.color || '#a855f7',
            });
          }
        }
      });
    }
  });

  const lines = Array.from(linesMap.values());
  const upVector = new THREE.Vector3(0, 1, 0);

  return (
    <>
      {lines.map((line, idx) => {
        const startVec = new THREE.Vector3(...line.start);
        const endVec = new THREE.Vector3(...line.end);
        const distance = startVec.distanceTo(endVec);

        if (distance < 0.1) return null;

        // Midpoint position between start and end nodes
        const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);

        // Direction vector from start to end
        const dir = new THREE.Vector3().subVectors(endVec, startVec).normalize();

        // Quaternion rotation aligning THREE Cylinder Y-axis (0,1,0) to direction vector
        const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, dir);
        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        return (
          <group key={idx}>
            {/* Glowing 3D Laser Beam Cylinder */}
            <mesh position={[midPoint.x, midPoint.y, midPoint.z]} rotation={euler}>
              <cylinderGeometry args={[0.08, 0.08, distance, 12]} />
              <meshBasicMaterial color={line.color} transparent opacity={0.65} />
            </mesh>

            {/* Glowing Core Laser Inner Line */}
            <mesh position={[midPoint.x, midPoint.y, midPoint.z]} rotation={euler}>
              <cylinderGeometry args={[0.03, 0.03, distance, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
            </mesh>

            {/* Glowing Connection Spheres at Node Joints */}
            <mesh position={[startVec.x, startVec.y, startVec.z]}>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshBasicMaterial color={line.color} transparent opacity={0.8} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};
