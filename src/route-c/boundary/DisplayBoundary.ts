import { ScreenPlane, defaultScreenPlane } from './ScreenPlane';
import { VoxelBounds } from '../core/types/VoxelTypes';

export class DisplayBoundary {
  public screenPlane: ScreenPlane;
  public worldBounds: VoxelBounds;

  constructor(
    screenPlane: ScreenPlane = defaultScreenPlane,
    worldBounds: VoxelBounds = { min: [-20, -20, -20], max: [20, 20, 20] }
  ) {
    this.screenPlane = screenPlane;
    this.worldBounds = worldBounds;
  }

  public getScreenSpaceBounds(): { minX: number; maxX: number; minY: number; maxY: number } {
    const halfW = this.screenPlane.width / 2;
    const halfH = this.screenPlane.height / 2;
    return {
      minX: -halfW,
      maxX: halfW,
      minY: -halfH,
      maxY: halfH,
    };
  }

  public convertWorldToDisplayNormalized(worldX: number, worldY: number): [number, number] {
    const halfW = this.screenPlane.width / 2;
    const halfH = this.screenPlane.height / 2;
    const normX = Math.max(-1, Math.min(1, worldX / halfW));
    const normY = Math.max(-1, Math.min(1, worldY / halfH));
    return [normX, normY];
  }
}

export const defaultDisplayBoundary = new DisplayBoundary();
