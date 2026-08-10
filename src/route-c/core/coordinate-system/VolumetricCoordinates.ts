import { VoxelBounds } from '../types/VoxelTypes';

/**
 * VOLUMETRIC COORDINATE SYSTEM SPECIFICATION
 * 
 * World Space Convention:
 * - Origin (0, 0, 0) is situated at the physical/virtual center of the volumetric bounding box.
 * - X Axis: Horizontal (-r = Far Left, 0 = Center, +r = Far Right)
 * - Y Axis: Vertical (-r = Bottom, 0 = Center, +r = Top)
 * - Z Axis: Depth (-r = Back, 0 = Center, +r = Front / Viewer)
 * 
 * Voxel Grid Space Convention:
 * - Discrete integer indices [ix, iy, iz] where ix ∈ [0, resX - 1], iy ∈ [0, resY - 1], iz ∈ [0, resZ - 1].
 */
export class VolumetricCoordinates {
  /**
   * Converts world coordinates (wx, wy, wz) inside bounds into discrete voxel grid indices [ix, iy, iz]
   */
  public static worldToGrid(
    worldX: number,
    worldY: number,
    worldZ: number,
    resolution: [number, number, number],
    bounds: VoxelBounds
  ): [number, number, number] {
    const [resX, resY, resZ] = resolution;
    const [minX, minY, minZ] = bounds.min;
    const [maxX, maxY, maxZ] = bounds.max;

    const normX = Math.max(0, Math.min(1, (worldX - minX) / (maxX - minX || 1)));
    const normY = Math.max(0, Math.min(1, (worldY - minY) / (maxY - minY || 1)));
    const normZ = Math.max(0, Math.min(1, (worldZ - minZ) / (maxZ - minZ || 1)));

    const ix = Math.min(resX - 1, Math.floor(normX * resX));
    const iy = Math.min(resY - 1, Math.floor(normY * resY));
    const iz = Math.min(resZ - 1, Math.floor(normZ * resZ));

    return [ix, iy, iz];
  }

  /**
   * Converts discrete voxel grid indices [ix, iy, iz] back into world coordinates (wx, wy, wz)
   */
  public static gridToWorld(
    ix: number,
    iy: number,
    iz: number,
    resolution: [number, number, number],
    bounds: VoxelBounds
  ): [number, number, number] {
    const [resX, resY, resZ] = resolution;
    const [minX, minY, minZ] = bounds.min;
    const [maxX, maxY, maxZ] = bounds.max;

    const normX = (ix + 0.5) / resX;
    const normY = (iy + 0.5) / resY;
    const normZ = (iz + 0.5) / resZ;

    const wx = minX + normX * (maxX - minX);
    const wy = minY + normY * (maxY - minY);
    const wz = minZ + normZ * (maxZ - minZ);

    return [wx, wy, wz];
  }

  /**
   * Maps 3D voxel index [ix, iy, iz] to 1D linear array index
   */
  public static gridToLinearIndex(
    ix: number,
    iy: number,
    iz: number,
    resolution: [number, number, number]
  ): number {
    const [resX, resY, resZ] = resolution;
    return ix + iy * resX + iz * resX * resY;
  }
}
