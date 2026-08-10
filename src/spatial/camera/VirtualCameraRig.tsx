'use client';

import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NormalizedHeadPose, COORDINATE_SYSTEM } from '../coordinate-system/CoordinateSystem';
import { calculateOffAxisProjectionMatrix } from '../projection/OffAxisProjection';

interface VirtualCameraRigProps {
  headPose: NormalizedHeadPose;
  trackingMode: 'mouse' | 'webcam' | 'mock';
  sensitivity?: number;
  popOutBoost?: number;
}

export const VirtualCameraRig: React.FC<VirtualCameraRigProps> = ({
  headPose,
  trackingMode,
  sensitivity = 1.0,
  popOutBoost = 2.0,
}) => {
  const { camera } = useThree();
  const targetCamPos = useRef(new THREE.Vector3(0, 0, COORDINATE_SYSTEM.DEFAULT_CAMERA_Z));

  useFrame(() => {
    if (trackingMode === 'webcam' || trackingMode === 'mock') {
      // Calculate virtual camera position from estimated head displacement boosted by popOutBoost multiplier
      const eyeX = headPose.x * 12.0 * sensitivity * popOutBoost;
      const eyeY = headPose.y * 8.0 * sensitivity * popOutBoost;
      const eyeZ = COORDINATE_SYSTEM.DEFAULT_CAMERA_Z * Math.max(0.4, headPose.z);

      targetCamPos.current.set(eyeX, eyeY, eyeZ);

      // Smooth camera position interpolation
      camera.position.lerp(targetCamPos.current, 0.15);

      // Apply off-axis asymmetric frustum projection matrix
      const projMatrix = calculateOffAxisProjectionMatrix(
        camera.position.x,
        camera.position.y,
        camera.position.z
      );

      camera.projectionMatrix.copy(projMatrix);
      camera.projectionMatrixInverse.copy(projMatrix).invert();
    }
  });

  return null;
};
