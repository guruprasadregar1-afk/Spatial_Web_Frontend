import { describe, it, expect } from 'vitest';
import { VolumetricCoordinates } from '../core/coordinate-system/VolumetricCoordinates';

describe('ROUTE C — Task 3: Coordinate System Transformations', () => {
  const bounds = { min: [-20, -20, -20] as [number, number, number], max: [20, 20, 20] as [number, number, number] };
  const resolution: [number, number, number] = [32, 32, 32];

  it('should map world center (0, 0, 0) to middle grid voxel index (16, 16, 16)', () => {
    const [ix, iy, iz] = VolumetricCoordinates.worldToGrid(0, 0, 0, resolution, bounds);
    expect(ix).toBe(16);
    expect(iy).toBe(16);
    expect(iz).toBe(16);
  });

  it('should map minimum world boundary (-20, -20, -20) to grid index (0, 0, 0)', () => {
    const [ix, iy, iz] = VolumetricCoordinates.worldToGrid(-20, -20, -20, resolution, bounds);
    expect(ix).toBe(0);
    expect(iy).toBe(0);
    expect(iz).toBe(0);
  });

  it('should map maximum world boundary (20, 20, 20) to maximum grid index (31, 31, 31)', () => {
    const [ix, iy, iz] = VolumetricCoordinates.worldToGrid(20, 20, 20, resolution, bounds);
    expect(ix).toBe(31);
    expect(iy).toBe(31);
    expect(iz).toBe(31);
  });

  it('should convert grid index (16, 16, 16) back to centered world coordinates', () => {
    const [wx, wy, wz] = VolumetricCoordinates.gridToWorld(16, 16, 16, resolution, bounds);
    expect(wx).toBeCloseTo(0.625, 2);
    expect(wy).toBeCloseTo(0.625, 2);
    expect(wz).toBeCloseTo(0.625, 2);
  });
});
