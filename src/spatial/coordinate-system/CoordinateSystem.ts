/**
 * SPATIAL WEB VIEWPORT — COORDINATE SYSTEM CONVENTIONS
 * 
 * Screen Space & World Space Mapping:
 * - Origin (0, 0, 0) is situated at the physical center of the monitor screen plane.
 * - X-Axis: Horizontal (-1.0 = Far Left edge, 0.0 = Center, +1.0 = Far Right edge)
 * - Y-Axis: Vertical (-1.0 = Bottom edge, 0.0 = Center, +1.0 = Top edge)
 * - Z-Axis: Depth
 *   - Z < 0 (behind screen plane): Virtual 3D spatial scene & city
 *   - Z = 0 (at screen plane): Monitor surface plane (SCREEN_PLANE_Z)
 *   - Z > 0 (in front of screen plane): Foreground spatial UI elements coming out towards viewer
 */

export const COORDINATE_SYSTEM = {
  SCREEN_PLANE_Z: 0,
  DEFAULT_SCREEN_WIDTH: 16,
  DEFAULT_SCREEN_HEIGHT: 9,
  DEFAULT_CAMERA_Z: 25,
  NEAR_PLANE: 0.1,
  FAR_PLANE: 1000,
} as const;

export interface NormalizedHeadPose {
  x: number; // [-1, 1] horizontal displacement
  y: number; // [-1, 1] vertical displacement
  z: number; // normalized relative depth distance (0.5 = close, 1.0 = normal, 1.5 = far)
  yaw: number;
  pitch: number;
  roll: number;
  confidence: number;
  timestamp: number;
}

export interface CalibrationOffset {
  neutralX: number;
  neutralY: number;
  neutralZ: number;
}

export function applyCalibration(
  rawPose: NormalizedHeadPose,
  calibration: CalibrationOffset
): NormalizedHeadPose {
  return {
    ...rawPose,
    x: rawPose.x - calibration.neutralX,
    y: rawPose.y - calibration.neutralY,
    z: rawPose.z - calibration.neutralZ + 1.0,
  };
}
