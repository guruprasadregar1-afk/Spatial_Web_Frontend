import { NormalizedHeadPose } from '../../spatial/coordinate-system/CoordinateSystem';
import { SpatialViewerState, TrackingMode, TrackingStatus, ViewerStateUtils } from './SpatialViewerState';
import { HeadPoseFilter } from '../../vision/tracking-filter/OneEuroFilter';

export class HeadPoseAdapter {
  private filter = new HeadPoseFilter();
  private mode: TrackingMode = 'disabled';
  private currentState: SpatialViewerState = ViewerStateUtils.createDefaultState('disabled');
  private lastValidTime: number = performance.now();
  private holdDurationMs: number = 1000; // Hold last pose for 1s on tracking loss

  public setMode(mode: TrackingMode): void {
    this.mode = mode;
    this.filter.reset();
    this.currentState = ViewerStateUtils.createDefaultState(mode);
  }

  public getMode(): TrackingMode {
    return this.mode;
  }

  /**
   * Adapts normalized webcam head pose into Route C SpatialViewerState
   */
  public adaptNormalizedPose(pose: NormalizedHeadPose): SpatialViewerState {
    if (this.mode === 'disabled') {
      this.currentState = ViewerStateUtils.createDefaultState('disabled');
      return this.currentState;
    }

    if (this.mode === 'manual') {
      return this.currentState;
    }

    const now = performance.now();

    // Tracking Failure / Low Confidence Check
    if (pose.confidence < 0.3) {
      const elapsed = now - this.lastValidTime;
      if (elapsed > this.holdDurationMs) {
        // Smoothly decay to neutral pose [0, 0, 15]
        this.currentState.position[0] *= 0.9;
        this.currentState.position[1] *= 0.9;
        this.currentState.position[2] = 15.0 + (this.currentState.position[2] - 15.0) * 0.9;
        this.currentState.status = 'lost';
      } else {
        this.currentState.status = 'degraded';
      }
      this.currentState.timestamp = now;
      return { ...this.currentState };
    }

    this.lastValidTime = now;

    // Apply One Euro adaptive low-pass filter
    const filtered = this.filter.filter(pose.x, pose.y, pose.z, now);

    // Map Normalized Coordinates to Route C World Coordinates
    const worldX = Math.max(-18, Math.min(18, filtered.x * 12.0));
    const worldY = Math.max(-12, Math.min(12, filtered.y * 8.0));
    const worldZ = Math.max(5, Math.min(25, 15.0 * filtered.z));

    const status: TrackingStatus = pose.confidence > 0.8 ? 'active' : 'degraded';

    this.currentState = {
      position: [worldX, worldY, worldZ],
      rotation: [pose.yaw, pose.pitch, pose.roll],
      confidence: pose.confidence,
      status,
      mode: 'webcam',
      timestamp: now,
    };

    return { ...this.currentState };
  }

  /**
   * Manual WASDQE keyboard / preset adjustment
   */
  public updateManualPosition(deltaX: number, deltaY: number, deltaZ: number): SpatialViewerState {
    if (this.mode !== 'manual') return this.currentState;

    const [cx, cy, cz] = this.currentState.position;
    const nx = Math.max(-18, Math.min(18, cx + deltaX));
    const ny = Math.max(-12, Math.min(12, cy + deltaY));
    const nz = Math.max(5, Math.min(25, cz + deltaZ));

    this.currentState = {
      ...this.currentState,
      position: [nx, ny, nz],
      status: 'manual',
      timestamp: performance.now(),
    };

    return { ...this.currentState };
  }

  public resetViewerPosition(): SpatialViewerState {
    this.filter.reset();
    this.currentState = ViewerStateUtils.createDefaultState(this.mode);
    return { ...this.currentState };
  }

  public getCurrentState(): SpatialViewerState {
    return { ...this.currentState };
  }
}

export const headPoseAdapter = new HeadPoseAdapter();
