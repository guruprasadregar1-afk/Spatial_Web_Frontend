'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useSpatialStore } from '@/store/slices/spatialSlice';

export type CameraMode = 'orbit' | 'focus' | 'topdown';

export function useCameraRig(mode: CameraMode = 'orbit') {
  const { camera, controls } = useThree();
  const { graph, selectedNodeId, targetFocusPosition } = useSpatialStore();

  const targetPosition = useRef<THREE.Vector3 | null>(null);
  const targetLookAt = useRef<THREE.Vector3 | null>(null);
  const isAnimating = useRef(false);

  useEffect(() => {
    // Top-Down Camera View
    if (mode === 'topdown') {
      targetPosition.current = new THREE.Vector3(0, 50, 0.01);
      targetLookAt.current = new THREE.Vector3(0, 0, 0);
      isAnimating.current = true;
      return;
    }

    // 1. Explicit targetFocusPosition (e.g. Fly to 3D Landmark)
    if (targetFocusPosition) {
      const [fx, fy, fz] = targetFocusPosition;
      targetLookAt.current = new THREE.Vector3(fx, fy, fz);
      targetPosition.current = new THREE.Vector3(fx, fy + 8, fz + 16);
      isAnimating.current = true;
      return;
    }

    // 2. Focused Spatial Node (Fly directly to the clicked icon/node!)
    if (selectedNodeId && graph && graph.nodes[selectedNodeId]) {
      const node = graph.nodes[selectedNodeId];
      const [nx, ny, nz] = node.transform.position;

      targetLookAt.current = new THREE.Vector3(nx, ny, nz);
      targetPosition.current = new THREE.Vector3(nx, ny + 6, nz + 14);
      isAnimating.current = true;
      return;
    }

    // 3. Default Orbit View trigger on initial load or reset
    if (mode === 'orbit' && !selectedNodeId && !targetFocusPosition) {
      targetPosition.current = new THREE.Vector3(0, 15, 30);
      targetLookAt.current = new THREE.Vector3(0, 0, 0);
      isAnimating.current = true;
    }
  }, [selectedNodeId, mode, targetFocusPosition]);

  useFrame(() => {
    // Smoothly fly camera & update OrbitControls target directly onto clicked node
    if (isAnimating.current && targetPosition.current && targetLookAt.current) {
      camera.position.lerp(targetPosition.current, 0.08);

      if (controls && 'target' in controls) {
        (controls as any).target.lerp(targetLookAt.current, 0.08);
        (controls as any).update();
      } else {
        camera.lookAt(targetLookAt.current);
      }

      const distance = camera.position.distanceTo(targetPosition.current);
      if (distance < 0.5) {
        // Stop animation once target is reached so OrbitControls orbits around clicked node
        isAnimating.current = false;
        targetPosition.current = null;
        targetLookAt.current = null;
      }
    }
  });

  return {
    isAnimating: isAnimating.current,
  };
}
