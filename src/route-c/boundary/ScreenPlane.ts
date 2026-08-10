export enum SpatialDepthRegion {
  SCREEN_INTERIOR = 'SCREEN_INTERIOR', // Z < -0.1 (Behind monitor glass)
  SCREEN_BOUNDARY = 'SCREEN_BOUNDARY', // Z ∈ [-0.1, +0.1] (Screen plane glass intersection)
  BEYOND_SCREEN = 'BEYOND_SCREEN',     // Z > +0.1 (Floating out in front of monitor)
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export class ScreenPlane {
  public readonly origin: [number, number, number] = [0, 0, 0];
  public readonly normal: [number, number, number] = [0, 0, 1]; // Points toward viewer eyes
  public readonly right: [number, number, number] = [1, 0, 0];
  public readonly up: [number, number, number] = [0, 1, 0];
  public readonly width: number;
  public readonly height: number;

  constructor(width: number = 24, height: number = 14) {
    this.width = width;
    this.height = height;
  }

  /**
   * Calculates signed orthogonal distance from a world-space point to screen plane (Z = 0)
   */
  public getSignedDistance(worldZ: number): number {
    return worldZ - this.origin[2];
  }

  /**
   * Classifies a world-space point into SpatialDepthRegion enum
   */
  public classifyDepthRegion(worldZ: number): SpatialDepthRegion {
    const dist = this.getSignedDistance(worldZ);
    if (dist < -0.1) return SpatialDepthRegion.SCREEN_INTERIOR;
    if (dist > 0.1) return SpatialDepthRegion.BEYOND_SCREEN;
    return SpatialDepthRegion.SCREEN_BOUNDARY;
  }

  /**
   * Checks if world-space (x, y) coordinates lie within the physical display boundary rectangle
   */
  public isWithinDisplayRectangle(worldX: number, worldY: number): boolean {
    const halfW = this.width / 2;
    const halfH = this.height / 2;
    return Math.abs(worldX) <= halfW && Math.abs(worldY) <= halfH;
  }
}

export const defaultScreenPlane = new ScreenPlane(24, 14);
