import { describe, it, expect } from 'vitest';
import { VoxelValidator, VoxelPoint, VoxelFrame } from '../core/types/VoxelTypes';

describe('ROUTE C — Task 2: Voxel Types & Validation', () => {
  it('should validate a valid voxel point', () => {
    const validPoint: VoxelPoint = { x: 0, y: 5, z: -10, r: 0.5, g: 0.8, b: 1.0, a: 0.9, intensity: 1.0 };
    expect(VoxelValidator.isValidPoint(validPoint)).toBe(true);
  });

  it('should reject invalid X, Y, or Z NaN coordinates', () => {
    const invalidX: VoxelPoint = { x: NaN, y: 5, z: 0, r: 1, g: 1, b: 1, a: 1, intensity: 1 };
    const invalidY: VoxelPoint = { x: 0, y: Infinity, z: 0, r: 1, g: 1, b: 1, a: 1, intensity: 1 };
    expect(VoxelValidator.isValidPoint(invalidX)).toBe(false);
    expect(VoxelValidator.isValidPoint(invalidY)).toBe(false);
  });

  it('should reject out-of-range RGB values (< 0 or > 1)', () => {
    const invalidRGB: VoxelPoint = { x: 0, y: 0, z: 0, r: 1.5, g: -0.2, b: 0.5, a: 1, intensity: 1 };
    expect(VoxelValidator.isValidPoint(invalidRGB)).toBe(false);
  });

  it('should reject out-of-range intensity values (< 0 or > 1)', () => {
    const invalidIntensity: VoxelPoint = { x: 0, y: 0, z: 0, r: 0.5, g: 0.5, b: 0.5, a: 1, intensity: 2.0 };
    expect(VoxelValidator.isValidPoint(invalidIntensity)).toBe(false);
  });

  it('should handle empty VoxelFrame cleanly', () => {
    const emptyFrame: VoxelFrame = {
      dimensions: [32, 32, 32],
      bounds: { min: [-20, -20, -20], max: [20, 20, 20] },
      voxels: [],
      timestamp: performance.now(),
      metadata: { source: 'unit-test' },
    };

    expect(VoxelValidator.isValidFrame(emptyFrame)).toBe(true);
    expect(emptyFrame.voxels.length).toBe(0);
    expect(emptyFrame.metadata?.source).toBe('unit-test');
  });
});
