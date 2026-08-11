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
              color: node.render.color || '#00f3ff',
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
        // Run laser tracks on the ground plane (y = 0.05) to match circuit board style
        const startVec = new THREE.Vector3(line.start[0], 0.05, line.start[2]);
        const endVec = new THREE.Vector3(line.end[0], 0.05, line.end[2]);
        const distance = startVec.distanceTo(endVec);

        if (distance < 0.1) return null;

        const midPoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
        const dir = new THREE.Vector3().subVectors(endVec, startVec).normalize();

        const quaternion = new THREE.Quaternion().setFromUnitVectors(upVector, dir);
        const euler = new THREE.Euler().setFromQuaternion(quaternion);

        return (
          <group key={idx}>
            {/* Glowing Cyan Ground Circuit Track Line */}
            <mesh position={[midPoint.x, midPoint.y, midPoint.z]} rotation={euler}>
              <cylinderGeometry args={[0.06, 0.06, distance, 12]} />
              <meshBasicMaterial color="#00f3ff" transparent opacity={0.8} />
            </mesh>

            {/* Core White Laser Tube */}
            <mesh position={[midPoint.x, midPoint.y, midPoint.z]} rotation={euler}>
              <cylinderGeometry args={[0.025, 0.025, distance, 8]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
            </mesh>

            {/* Circuit Node Joint Spheres */}
            <mesh position={[startVec.x, startVec.y + 0.05, startVec.z]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#00f3ff" transparent opacity={0.9} />
            </mesh>
            <mesh position={[endVec.x, endVec.y + 0.05, endVec.z]}>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshBasicMaterial color="#00f3ff" transparent opacity={0.9} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};
