import { NormalizedHeadPose } from '../../spatial/coordinate-system/CoordinateSystem';

export interface FaceLandmarkPoint {
  x: number;
  y: number;
  z: number;
}

export class HeadPoseEstimator {
  /**
   * Estimates 3D head pose from MediaPipe 478 face mesh landmarks
   */
  public estimatePose(landmarks: FaceLandmarkPoint[], timestamp: number = performance.now()): NormalizedHeadPose {
    if (!landmarks || landmarks.length === 0) {
      return {
        x: 0,
        y: 0,
        z: 1.0,
        yaw: 0,
        pitch: 0,
        roll: 0,
        confidence: 0,
        timestamp,
      };
    }

    // MediaPipe Key Facial Landmarks:
    // 1: Nose tip, 33: Left eye outer corner, 263: Right eye outer corner, 61: Mouth left, 291: Mouth right, 152: Chin
    const nose = landmarks[1] || landmarks[0];
    const leftEye = landmarks[33] || landmarks[0];
    const rightEye = landmarks[263] || landmarks[0];

    // Compute head center (average between eyes and nose tip)
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const eyeCenterY = (leftEye.y + rightEye.y) / 2;
    const headXRaw = (eyeCenterX + nose.x) / 2;
    const headYRaw = (eyeCenterY + nose.y) / 2;

    // Convert screen coordinates [0, 1] to normalized centered coordinates [-1, 1]
    // Invert X because camera mirrors horizontal motion
    const normX = -(headXRaw - 0.5) * 2.0;
    const normY = -(headYRaw - 0.5) * 2.0;

    // Distance estimation based on inter-pupillary eye distance
    const eyeDist = Math.sqrt(
      Math.pow(rightEye.x - leftEye.x, 2) + Math.pow(rightEye.y - leftEye.y, 2)
    );
    // Baseline eye distance ~0.18 at 50cm distance
    const normZ = eyeDist > 0.01 ? 0.18 / eyeDist : 1.0;

    // Approximate Head Rotation (Yaw, Pitch, Roll)
    const yaw = (rightEye.z - leftEye.z) * 5.0;
    const pitch = (nose.y - eyeCenterY - 0.05) * 5.0;
    const roll = Math.atan2(rightEye.y - leftEye.y, rightEye.x - leftEye.x);

    return {
      x: Math.max(-1.5, Math.min(1.5, normX)),
      y: Math.max(-1.5, Math.min(1.5, normY)),
      z: Math.max(0.4, Math.min(2.5, normZ)),
      yaw,
      pitch,
      roll,
      confidence: 0.95,
      timestamp,
    };
  }
}

export const headPoseEstimator = new HeadPoseEstimator();
