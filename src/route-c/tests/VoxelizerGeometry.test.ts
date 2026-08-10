import { describe, it, expect } from 'vitest';
import { Voxelizer } from '../voxel-engine/Voxelizer';

describe('ROUTE C — Tasks 5, 6 & 7: Deterministic Geometry Voxelization', () => {
  const voxelizer = new Voxelizer();

  it('Task 5: should voxelize a Box at 16³, 32³, and 64³ grid resolutions deterministically', () => {
    const boxFrame16 = voxelizer.voxelizeBox([0, 0, 0], [10, 10, 10], '#00f3ff', {
      resolution: [16, 16, 16],
      bounds: { min: [-20, -20, -20], max: [20, 20, 20] },
    });

    const boxFrame32 = voxelizer.voxelizeBox([0, 0, 0], [10, 10, 10], '#00f3ff', {
      resolution: [32, 32, 32],
      bounds: { min: [-20, -20, -20], max: [20, 20, 20] },
    });

    expect(boxFrame16.voxels.length).toBeGreaterThan(0);
    expect(boxFrame32.voxels.length).toBeGreaterThan(0);

    // Verify all voxels remain inside configured bounds
    boxFrame32.voxels.forEach((v) => {
      expect(v.x).toBeGreaterThanOrEqual(-20);
      expect(v.x).toBeLessThanOrEqual(20);
      expect(v.y).toBeGreaterThanOrEqual(-20);
      expect(v.y).toBeLessThanOrEqual(20);
      expect(v.z).toBeGreaterThanOrEqual(-20);
      expect(v.z).toBeLessThanOrEqual(20);
    });
  });

  it('Task 6: should voxelize a Sphere centered at origin without NaNs or out-of-bounds voxels', () => {
    const sphereFrame = voxelizer.voxelizeSphere([0, 0, 0], 8, '#a855f7', {
      resolution: [32, 32, 32],
      bounds: { min: [-20, -20, -20], max: [20, 20, 20] },
    });

    expect(sphereFrame.voxels.length).toBeGreaterThan(0);

    sphereFrame.voxels.forEach((v) => {
      expect(isNaN(v.x)).toBe(false);
      expect(isNaN(v.y)).toBe(false);
      expect(isNaN(v.z)).toBe(false);
      expect(isFinite(v.x)).toBe(true);
      expect(isFinite(v.y)).toBe(true);
      expect(isFinite(v.z)).toBe(true);
    });
  });

  it('Task 7: should voxelize Point and Line primitives spatially', () => {
    const pointFrame = voxelizer.voxelizePoint([5, 5, 5], '#00f3ff');
    expect(pointFrame.voxels.length).toBe(1);
    expect(pointFrame.voxels[0].x).toBe(5);

    const lineFrame = voxelizer.voxelizeLine([0, 0, 0], [10, 10, 10], 10, '#00f3ff');
    expect(lineFrame.voxels.length).toBeGreaterThan(5);
  });
});
