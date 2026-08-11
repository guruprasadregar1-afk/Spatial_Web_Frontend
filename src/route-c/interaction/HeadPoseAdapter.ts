import { NormalizedHeadPose } from '../../spatial/coordinate-system/CoordinateSystem';
import { SpatialViewerState, TrackingMode, TrackingStatus, ViewerStateUtils } from './SpatialViewerState';
import { HeadPoseFilter } from '../../vision/tracking-filter/OneEuroFilter';

export interface CalibrationParams {
  horizontalSensitivity: number;
  verticalSensitivity: number;
  depthSensitivity: number;
  screenWidthWorld: number;
  screenHeightWorld: number;
  neutralViewerDistance: number;
}

export class HeadPoseAdapter {
  private filter = new HeadPoseFilter();
  private mode: TrackingMode = 'disabled';
  private currentState: SpatialViewerState = ViewerStateUtils.createDefaultState('disabled');
  private lastValidTime: number = performance.now();
  private holdDurationMs: number = 1000; // Hold last pose for 1s on tracking loss

  // Neutral Baseline Calibration Pose
  private neutralRawPose: { x: number; y: number; z: number } = { x: 0, y: 0, z: 1.0 };
  private lastRawPose: NormalizedHeadPose | null = null;

  // Configurable Calibration Parameters
  private params: CalibrationParams = {
    horizontalSensitivity: 12.0,
    verticalSensitivity: 8.0,
    depthSensitivity: 10.0,
    screenWidthWorld: 24.0,
    screenHeightWorld: 14.0,
    neutralViewerDistance: 15.0,
  };

  public setMode(mode: TrackingMode): void {
    this.mode = mode;
    this.filter.reset();
    this.currentState = ViewerStateUtils.createDefaultState(mode);
  }

  public getMode(): TrackingMode {
    return this.mode;
  }

  public setCalibrationParams(newParams: Partial<CalibrationParams>): void {
    this.params = { ...this.params, ...newParams };
  }

  public getCalibrationParams(): CalibrationParams {
    return { ...this.params };
  }

  /**
   * Captures current raw pose (or specified pose) as neutral baseline origin
   */
  public calibrateCenter(rawPose?: NormalizedHeadPose): void {
    const targetPose = rawPose || this.lastRawPose;
    if (targetPose) {
      this.neutralRawPose = {
        x: targetPose.x,
        y: targetPose.y,
        z: targetPose.z,
      };
    } else {
      this.neutralRawPose = { x: 0, y: 0, z: 1.0 };
    }
    this.filter.reset();
  }

  public getNeutralCalibration(): { x: number; y: number; z: number } {
    return { ...this.neutralRawPose };
  }

  /**
   * Adapts normalized webcam head pose into Route C SpatialViewerState
   */
  public adaptNormalizedPose(pose: NormalizedHeadPose): SpatialViewerState {
    this.lastRawPose = pose;

    if (this.mode === 'disabled') {
      this.currentState = ViewerStateUtils.createDefaultState('disabled');
      return this.currentState;
    }

    if (this.mode === 'manual') {
      return this.currentState;
    }

    const now = performance.now();
    const poseAgeMs = Math.max(0, now - pose.timestamp);

    // Tracking Failure / Low Confidence Check
    if (pose.confidence < 0.3) {
      const elapsed = now - this.lastValidTime;
      if (elapsed > this.holdDurationMs) {
        // Smoothly decay to neutral pose [0, 0, neutralViewerDistance]
        this.currentState.position[0] *= 0.9;
        this.currentState.position[1] *= 0.9;
        this.currentState.position[2] =
          this.params.neutralViewerDistance + (this.currentState.position[2] - this.params.neutralViewerDistance) * 0.9;
        this.currentState.status = 'lost';
      } else {
        this.currentState.status = 'degraded';
      }
      this.currentState.timestamp = now;
      this.currentState.poseAgeMs = elapsed;
      return { ...this.currentState };
    }

    this.lastValidTime = now;

    // Apply One Euro adaptive low-pass filter
    const filtered = this.filter.filter(pose.x, pose.y, pose.z, now);

    // Calculate Relative Movement Deltas from Neutral Baseline Calibration
    const deltaX = filtered.x - this.neutralRawPose.x;
    const deltaY = filtered.y - this.neutralRawPose.y;
    const deltaZ = filtered.z - this.neutralRawPose.z;

    // Map Relative Deltas to Route C World Coordinates using Calibration Parameters
    const worldX = Math.max(-18, Math.min(18, deltaX * this.params.horizontalSensitivity));
    const worldY = Math.max(-12, Math.min(12, deltaY * this.params.verticalSensitivity));
    const worldZ = Math.max(
      5,
      Math.min(25, this.params.neutralViewerDistance + deltaZ * this.params.depthSensitivity)
    );

    const status: TrackingStatus = pose.confidence > 0.8 ? 'active' : 'degraded';

    this.currentState = {
      position: [worldX, worldY, worldZ],
      rotation: [pose.yaw, pose.pitch, pose.roll],
      rawPosition: [pose.x, pose.y, pose.z],
      calibratedDelta: [deltaX, deltaY, deltaZ],
      poseAgeMs,
      confidence: pose.confidence,
      status,
      mode: 'webcam',
      timestamp: now,
    };

    return { ...this.currentState };
  }

  /**
   * Manual WASDQE keyboard adjustment
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
      calibratedDelta: [nx, ny, nz - this.params.neutralViewerDistance],
      status: 'manual',
      timestamp: performance.now(),
    };

    return { ...this.currentState };
  }

  public resetViewerPosition(): SpatialViewerState {
    this.neutralRawPose = { x: 0, y: 0, z: 1.0 };
    this.filter.reset();
    this.currentState = ViewerStateUtils.createDefaultState(this.mode);
    return { ...this.currentState };
  }

  public getCurrentState(): SpatialViewerState {
    return { ...this.currentState };
  }
}

export const headPoseAdapter = new HeadPoseAdapter();
