import { VoxelPoint, VoxelBounds } from '../core/types/VoxelTypes';
import { VolumetricCoordinates } from '../core/coordinate-system/VolumetricCoordinates';

export interface VoxelGridStats {
  resolution: [number, number, number];
  totalCapacity: number;
  occupiedCount: number;
  densityPercentage: number;
}

export class VoxelGrid {
  private resolution: [number, number, number];
  private bounds: VoxelBounds;
  private storage: Map<number, VoxelPoint> = new Map();

  constructor(
    resolution: [number, number, number] = [32, 32, 32],
    bounds: VoxelBounds = { min: [-20, -20, -20], max: [20, 20, 20] }
  ) {
    this.resolution = resolution;
    this.bounds = bounds;
  }

  public setVoxel(worldX: number, worldY: number, worldZ: number, point: VoxelPoint): boolean {
    const [ix, iy, iz] = VolumetricCoordinates.worldToGrid(
      worldX,
      worldY,
      worldZ,
      this.resolution,
      this.bounds
    );

    const index = VolumetricCoordinates.gridToLinearIndex(ix, iy, iz, this.resolution);
    this.storage.set(index, { ...point, x: worldX, y: worldY, z: worldZ });
    return true;
  }

  public getVoxel(ix: number, iy: number, iz: number): VoxelPoint | undefined {
    const index = VolumetricCoordinates.gridToLinearIndex(ix, iy, iz, this.resolution);
    return this.storage.get(index);
  }

  public getAllVoxels(): VoxelPoint[] {
    return Array.from(this.storage.values());
  }

  public clear(): void {
    this.storage.clear();
  }

  public getStatistics(): VoxelGridStats {
    const totalCapacity = this.resolution[0] * this.resolution[1] * this.resolution[2];
    const occupiedCount = this.storage.size;
    const densityPercentage = (occupiedCount / (totalCapacity || 1)) * 100;

    return {
      resolution: this.resolution,
      totalCapacity,
      occupiedCount,
      densityPercentage,
    };
  }

  public getBounds(): VoxelBounds {
    return this.bounds;
  }

  public getResolution(): [number, number, number] {
    return this.resolution;
  }
}
