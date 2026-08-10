import { describe, it, expect } from 'vitest';
import { VoxelGrid } from '../voxel-engine/VoxelGrid';

describe('ROUTE C — Task 4: VoxelGrid Storage & Statistics', () => {
  it('should insert, lookup, and count voxels accurately', () => {
    const grid = new VoxelGrid([32, 32, 32], { min: [-20, -20, -20], max: [20, 20, 20] });
    grid.setVoxel(0, 0, 0, { x: 0, y: 0, z: 0, r: 0, g: 1, b: 0, a: 1, intensity: 1 });

    const stats = grid.getStatistics();
    expect(stats.occupiedCount).toBe(1);
    expect(stats.totalCapacity).toBe(32768);
    expect(stats.densityPercentage).toBeGreaterThan(0);
  });

  it('should clear grid storage cleanly', () => {
    const grid = new VoxelGrid([16, 16, 16], { min: [-10, -10, -10], max: [10, 10, 10] });
    grid.setVoxel(2, 2, 2, { x: 2, y: 2, z: 2, r: 1, g: 0, b: 0, a: 1, intensity: 1 });
    expect(grid.getStatistics().occupiedCount).toBe(1);

    grid.clear();
    expect(grid.getStatistics().occupiedCount).toBe(0);
  });
});
