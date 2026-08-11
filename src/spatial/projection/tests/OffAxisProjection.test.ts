import { describe, it, expect } from 'vitest';
import { calculateOffAxisProjectionMatrix, calculateFrustumBounds } from '../OffAxisProjection';

describe('Spatial Web Viewport — Off-Axis Frustum Projection', () => {
  it('should compute valid 4x4 matrix for centered eye position', () => {
    const matrix = calculateOffAxisProjectionMatrix(0, 0, 25);
    expect(matrix.elements.length).toBe(16);
    expect(matrix.elements[0]).toBeGreaterThan(0);
    expect(matrix.elements[5]).toBeGreaterThan(0);
  });

  it('should calculate symmetric frustum bounds for centered eye position', () => {
    const bounds = calculateFrustumBounds(0, 0, 15, { width: 24, height: 14 }, 0.1);
    expect(Math.abs(bounds.left)).toBeCloseTo(Math.abs(bounds.right));
    expect(Math.abs(bounds.top)).toBeCloseTo(Math.abs(bounds.bottom));
  });

  it('should calculate asymmetric frustum bounds when eye moves off-center', () => {
    const leftBounds = calculateFrustumBounds(-5, 0, 15, { width: 24, height: 14 }, 0.1);
    // Moving left shifts both left and right bounds in positive direction relative to eye centerline
    expect(Math.abs(leftBounds.left)).not.toEqual(Math.abs(leftBounds.right));
    expect(leftBounds.right).toBeGreaterThan(Math.abs(leftBounds.left));
  });

  it('should shift frustum shear matrix element 8 when eye moves left', () => {
    const centerMatrix = calculateOffAxisProjectionMatrix(0, 0, 25);
    const leftMatrix = calculateOffAxisProjectionMatrix(-5, 0, 25);

    // X displacement shifts projection matrix shear element
    expect(leftMatrix.elements[8]).not.toEqual(centerMatrix.elements[8]);
  });
});
