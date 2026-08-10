import * as THREE from 'three';
import { COORDINATE_SYSTEM } from '../coordinate-system/CoordinateSystem';

export interface ScreenDimensions {
  width: number;
  height: number;
}

/**
 * Calculates asymmetric off-axis projection matrix for Three.js camera
 * based on user's estimated head position (eyeX, eyeY, eyeZ) relative to monitor screen plane.
 */
export function calculateOffAxisProjectionMatrix(
  eyeX: number,
  eyeY: number,
  eyeZ: number,
  screenDim: ScreenDimensions = {
    width: COORDINATE_SYSTEM.DEFAULT_SCREEN_WIDTH,
    height: COORDINATE_SYSTEM.DEFAULT_SCREEN_HEIGHT,
  },
  near: number = COORDINATE_SYSTEM.NEAR_PLANE,
  far: number = COORDINATE_SYSTEM.FAR_PLANE
): THREE.Matrix4 {
  const halfW = screenDim.width / 2;
  const halfH = screenDim.height / 2;

  // Distance from head to screen plane (Z=0)
  const d = Math.max(Math.abs(eyeZ), 1.0);

  // Calculate asymmetric frustum bounds at the near plane
  const left = ((-halfW - eyeX) * near) / d;
  const right = ((halfW - eyeX) * near) / d;
  const bottom = ((-halfH - eyeY) * near) / d;
  const top = ((halfH - eyeY) * near) / d;

  // Construct asymmetric frustum projection matrix
  const matrix = new THREE.Matrix4();
  matrix.makePerspective(left, right, top, bottom, near, far);

  return matrix;
}
