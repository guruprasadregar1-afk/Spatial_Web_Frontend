'use client';

import React from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SpatialViewerState } from '../interaction/SpatialViewerState';
import {
  calculateOffAxisProjectionMatrix,
  calculateFrustumBounds,
  ScreenDimensions,
  FrustumBounds,
} from '@/spatial/projection/OffAxisProjection';

export interface RouteCCameraRigProps {
  viewerStateRef: React.MutableRefObject<SpatialViewerState>;
  cameraMode: 'spatial' | 'manual' | 'orbit';
  screenDimensions?: ScreenDimensions;
  onFrustumUpdate?: (bounds: FrustumBounds, camPos: [number, number, number]) => void;
}

export const RouteCCameraRig: React.FC<RouteCCameraRigProps> = ({
  viewerStateRef,
  cameraMode,
  screenDimensions = { width: 24, height: 14 },
  onFrustumUpdate,
}) => {
  const { camera } = useThree();

  useFrame(() => {
    // If Orbit mode is active, OrbitControls manages camera position & projection
    if (cameraMode === 'orbit') return;

    // Single source of truth: Read latest viewer state directly from mutable ref (no React state lag!)
    const state = viewerStateRef.current;
    const [vx, vy, vz] = state.position;

    // 1. Position camera at calibrated viewer world position (vx, vy, vz)
    camera.position.set(vx, vy, vz);

    // 2. Fix camera rotation aligned with screen plane normal [0, 0, 1] facing screen plane
    camera.rotation.set(0, 0, 0);

    // 3. Compute asymmetric off-axis projection matrix derived from screen plane geometry & eye position
    const near = camera.near || 0.1;
    const far = camera.far || 1000;
    const projMatrix = calculateOffAxisProjectionMatrix(vx, vy, vz, screenDimensions, near, far);

    // 4. Update Three.js camera projection matrix
    camera.projectionMatrix.copy(projMatrix);
    camera.projectionMatrixInverse.copy(projMatrix).invert();

    // 5. Emit frustum bounds for real-time telemetry overlay if callback provided
    if (onFrustumUpdate) {
      const bounds = calculateFrustumBounds(vx, vy, vz, screenDimensions, near);
      onFrustumUpdate(bounds, [vx, vy, vz]);
    }
  });

  return null;
};
