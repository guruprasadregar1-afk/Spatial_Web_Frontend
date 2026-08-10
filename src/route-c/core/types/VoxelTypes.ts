export interface VoxelPoint {
  x: number;
  y: number;
  z: number;
  r: number; // [0, 1]
  g: number; // [0, 1]
  b: number; // [0, 1]
  a: number; // [0, 1]
  intensity: number; // [0, 1]
}

export interface VoxelBounds {
  min: [number, number, number];
  max: [number, number, number];
}

export interface VoxelFrame {
  dimensions: [number, number, number]; // [X, Y, Z] resolution e.g. [32, 32, 32]
  bounds: VoxelBounds;
  voxels: readonly VoxelPoint[];
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class VoxelValidator {
  public static isValidPoint(point: VoxelPoint, bounds?: VoxelBounds): boolean {
    if (
      isNaN(point.x) ||
      isNaN(point.y) ||
      isNaN(point.z) ||
      !isFinite(point.x) ||
      !isFinite(point.y) ||
      !isFinite(point.z)
    ) {
      return false;
    }

    if (
      point.r < 0 || point.r > 1 ||
      point.g < 0 || point.g > 1 ||
      point.b < 0 || point.b > 1 ||
      point.a < 0 || point.a > 1 ||
      point.intensity < 0 || point.intensity > 1
    ) {
      return false;
    }

    if (bounds) {
      const [minX, minY, minZ] = bounds.min;
      const [maxX, maxY, maxZ] = bounds.max;
      if (
        point.x < minX || point.x > maxX ||
        point.y < minY || point.y > maxY ||
        point.z < minZ || point.z > maxZ
      ) {
        return false;
      }
    }

    return true;
  }

  public static isValidFrame(frame: VoxelFrame): boolean {
    if (!frame || !Array.isArray(frame.voxels) || !Array.isArray(frame.dimensions)) {
      return false;
    }
    const [dimX, dimY, dimZ] = frame.dimensions;
    if (dimX <= 0 || dimY <= 0 || dimZ <= 0) return false;
    if (isNaN(frame.timestamp) || frame.timestamp <= 0) return false;

    return frame.voxels.every((v) => this.isValidPoint(v, frame.bounds));
  }
}
