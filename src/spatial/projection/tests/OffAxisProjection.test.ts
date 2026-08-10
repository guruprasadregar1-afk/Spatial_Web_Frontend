import { describe, it, expect } from 'vitest';
import { calculateOffAxisProjectionMatrix } from '../OffAxisProjection';

describe('Spatial Web Viewport — Off-Axis Frustum Projection', () => {
  it('should compute valid 4x4 matrix for centered eye position', () => {
    const matrix = calculateOffAxisProjectionMatrix(0, 0, 25);
    expect(matrix.elements.length).toBe(16);
    expect(matrix.elements[0]).toBeGreaterThan(0);
    expect(matrix.elements[5]).toBeGreaterThan(0);
  });

  it('should shift frustum bounds when eye moves left', () => {
    const centerMatrix = calculateOffAxisProjectionMatrix(0, 0, 25);
    const leftMatrix = calculateOffAxisProjectionMatrix(-5, 0, 25);

    // X displacement should shift element 8 (shear index)
    expect(leftMatrix.elements[8]).not.toEqual(centerMatrix.elements[8]);
  });
});
