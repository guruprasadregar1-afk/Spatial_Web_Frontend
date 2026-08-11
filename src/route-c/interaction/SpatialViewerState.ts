export type TrackingMode = 'disabled' | 'webcam' | 'manual';
export type TrackingStatus = 'active' | 'degraded' | 'lost' | 'manual' | 'disabled';

export interface SpatialViewerState {
  position: [number, number, number]; // [X, Y, Z] in Route C World Coordinates
  rotation: [number, number, number]; // [Yaw, Pitch, Roll] in radians
  rawPosition?: [number, number, number]; // Raw normalized pose [normX, normY, normZ]
  calibratedDelta?: [number, number, number]; // Delta [dx, dy, dz] from neutral pose
  poseAgeMs?: number; // Time elapsed since last fresh pose update (ms)
  confidence: number; // [0, 1]
  status: TrackingStatus;
  mode: TrackingMode;
  timestamp: number;
}

export class ViewerStateUtils {
  public static createDefaultState(mode: TrackingMode = 'disabled'): SpatialViewerState {
    return {
      position: [0, 0, 15],
      rotation: [0, 0, 0],
      rawPosition: [0, 0, 1.0],
      calibratedDelta: [0, 0, 0],
      poseAgeMs: 0,
      confidence: 1.0,
      status: mode === 'disabled' ? 'disabled' : 'manual',
      mode,
      timestamp: performance.now(),
    };
  }

  public static isDifferent(a: SpatialViewerState, b: SpatialViewerState): boolean {
    return (
      a.mode !== b.mode ||
      a.status !== b.status ||
      Math.abs(a.position[0] - b.position[0]) > 0.01 ||
      Math.abs(a.position[1] - b.position[1]) > 0.01 ||
      Math.abs(a.position[2] - b.position[2]) > 0.01
    );
  }
}
