import { SpatialSceneSnapshot, SceneSnapshotUtils } from '../core/scene/SpatialSceneSnapshot';
import { Voxelizer } from '../voxel-engine/Voxelizer';
import { VoxelFrame, VoxelPoint, VoxelBounds } from '../core/types/VoxelTypes';
import { VoxelGrid } from '../voxel-engine/VoxelGrid';
import { displayManager } from '../core/abstraction/DisplayManager';

export interface ScenePipelineOptions {
  resolution: [number, number, number];
  bounds: VoxelBounds;
}

export class VolumetricScenePipeline {
  private voxelizer = new Voxelizer();
  private lastSnapshot: SpatialSceneSnapshot | null = null;
  private lastFrame: VoxelFrame | null = null;

  public processSnapshot(
    snapshot: SpatialSceneSnapshot,
    options: ScenePipelineOptions = { resolution: [32, 32, 32], bounds: { min: [-20, -20, -20], max: [20, 20, 20] } }
  ): { frame: VoxelFrame; isDirty: boolean; voxelizationTimeMs: number } {
    const isDirty = SceneSnapshotUtils.isDifferent(this.lastSnapshot, snapshot);

    if (!isDirty && this.lastFrame) {
      return { frame: this.lastFrame, isDirty: false, voxelizationTimeMs: 0 };
    }

    const t0 = performance.now();
    const grid = new VoxelGrid(options.resolution, options.bounds);

    snapshot.objects.forEach((obj) => {
      const [x, y, z] = obj.position;

      if (obj.type === 'box') {
        const size = obj.params?.size || [4, 4, 4];
        const subFrame = this.voxelizer.voxelizeBox([x, y, z], size, obj.color, options);
        subFrame.voxels.forEach((v) => grid.setVoxel(v.x, v.y, v.z, v));
      } else if (obj.type === 'sphere') {
        const radius = obj.params?.radius || 3;
        const subFrame = this.voxelizer.voxelizeSphere([x, y, z], radius, obj.color, options);
        subFrame.voxels.forEach((v) => grid.setVoxel(v.x, v.y, v.z, v));
      } else if (obj.type === 'line' && obj.params?.start && obj.params?.end) {
        const subFrame = this.voxelizer.voxelizeLine(obj.params.start, obj.params.end, 12, obj.color, options);
        subFrame.voxels.forEach((v) => grid.setVoxel(v.x, v.y, v.z, v));
      } else {
        const subFrame = this.voxelizer.voxelizePoint([x, y, z], obj.color, options);
        subFrame.voxels.forEach((v) => grid.setVoxel(v.x, v.y, v.z, v));
      }
    });

    const t1 = performance.now();

    // Create Immutable Frozen Voxel Frame
    const immutableFrame: VoxelFrame = Object.freeze({
      dimensions: options.resolution,
      bounds: options.bounds,
      voxels: Object.freeze([...grid.getAllVoxels()]),
      timestamp: performance.now(),
      metadata: { snapshotVersion: snapshot.version },
    });

    this.lastSnapshot = snapshot;
    this.lastFrame = immutableFrame;

    return {
      frame: immutableFrame,
      isDirty: true,
      voxelizationTimeMs: t1 - t0,
    };
  }

  public submitToDisplay(frame: VoxelFrame): void {
    displayManager.render(frame);
  }
}

export const scenePipeline = new VolumetricScenePipeline();
