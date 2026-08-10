import { SpatialSceneSnapshot } from '../core/scene/SpatialSceneSnapshot';
import { VoxelFrame, VoxelBounds } from '../core/types/VoxelTypes';
import { VolumetricScenePipeline } from '../pipeline/VolumetricScenePipeline';

export interface StreamTelemetry {
  targetFPS: number;
  actualFPS: number;
  frameNumber: number;
  voxelCount: number;
  voxelizationTimeMs: number;
  submissionTimeMs: number;
  droppedFrames: number;
  gridResolution: [number, number, number];
}

export class VolumetricFrameStream {
  private pipeline = new VolumetricScenePipeline();

  private isRunning: boolean = false;
  private isPaused: boolean = false;

  private targetFPS: number = 30;
  private timerId: ReturnType<typeof setInterval> | null = null;

  private latestPendingSnapshot: SpatialSceneSnapshot | null = null;
  private activeFrame: VoxelFrame | null = null;

  private frameCounter: number = 0;
  private droppedFrameCounter: number = 0;

  private resolution: [number, number, number] = [32, 32, 32];
  private bounds: VoxelBounds = { min: [-20, -20, -20], max: [20, 20, 20] };

  private lastVoxelTimeMs: number = 0;
  private lastSubmissionTimeMs: number = 0;
  private fpsCheckTime: number = performance.now();
  private fpsFrameCounter: number = 0;
  private calculatedActualFPS: number = 30;

  public start(targetFPS: number = 30): void {
    if (this.isRunning) return;
    this.targetFPS = targetFPS;
    this.isRunning = true;
    this.isPaused = false;
    this.fpsCheckTime = performance.now();
    this.fpsFrameCounter = 0;

    const intervalMs = Math.max(16, Math.round(1000 / targetFPS));
    this.timerId = setInterval(() => this.tick(), intervalMs);
  }

  public stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public setTargetFPS(fps: number): void {
    this.targetFPS = fps;
    if (this.isRunning) {
      this.stop();
      this.start(fps);
    }
  }

  public setResolution(res: [number, number, number]): void {
    this.resolution = res;
  }

  public submitSceneSnapshot(snapshot: SpatialSceneSnapshot): void {
    // If a snapshot is already pending submission, drop the previous obsolete snapshot!
    if (this.latestPendingSnapshot !== null) {
      this.droppedFrameCounter++;
    }
    this.latestPendingSnapshot = snapshot;
  }

  public tick(): void {
    if (!this.isRunning || this.isPaused || !this.latestPendingSnapshot) return;

    // Pick latest snapshot and clear pending buffer
    const snapshotToProcess = this.latestPendingSnapshot;
    this.latestPendingSnapshot = null;

    const { frame, voxelizationTimeMs } = this.pipeline.processSnapshot(snapshotToProcess, {
      resolution: this.resolution,
      bounds: this.bounds,
    });

    const tSub0 = performance.now();
    this.pipeline.submitToDisplay(frame);
    const tSub1 = performance.now();

    this.activeFrame = frame;
    this.frameCounter++;
    this.fpsFrameCounter++;

    this.lastVoxelTimeMs = voxelizationTimeMs;
    this.lastSubmissionTimeMs = tSub1 - tSub0;

    const now = performance.now();
    if (now - this.fpsCheckTime >= 1000) {
      this.calculatedActualFPS = Math.round((this.fpsFrameCounter * 1000) / (now - this.fpsCheckTime));
      this.fpsFrameCounter = 0;
      this.fpsCheckTime = now;
    }
  }

  public getCurrentFrame(): VoxelFrame | null {
    return this.activeFrame;
  }

  public getTelemetryStatistics(): StreamTelemetry {
    return {
      targetFPS: this.targetFPS,
      actualFPS: this.calculatedActualFPS,
      frameNumber: this.frameCounter,
      voxelCount: this.activeFrame?.voxels.length || 0,
      voxelizationTimeMs: this.lastVoxelTimeMs,
      submissionTimeMs: this.lastSubmissionTimeMs,
      droppedFrames: this.droppedFrameCounter,
      gridResolution: this.resolution,
    };
  }

  public getIsRunning(): boolean {
    return this.isRunning;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }
}

export const frameStream = new VolumetricFrameStream();
