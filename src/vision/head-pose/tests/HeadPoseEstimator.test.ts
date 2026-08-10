import { describe, it, expect } from 'vitest';
import { HeadPoseEstimator } from '../HeadPoseEstimator';

describe('Spatial Web Viewport — Head Pose Estimator', () => {
  const estimator = new HeadPoseEstimator();

  it('should return centered default pose when landmarks array is empty', () => {
    const pose = estimator.estimatePose([]);
    expect(pose.x).toBe(0);
    expect(pose.y).toBe(0);
    expect(pose.z).toBe(1.0);
  });

  it('should estimate normalized X and Y head pose from facial landmarks', () => {
    const landmarks = Array(300).fill({ x: 0.5, y: 0.5, z: 0 });
    landmarks[33] = { x: 0.4, y: 0.4, z: 0 }; // Left eye
    landmarks[263] = { x: 0.6, y: 0.4, z: 0 }; // Right eye
    landmarks[1] = { x: 0.5, y: 0.5, z: 0 }; // Nose

    const pose = estimator.estimatePose(landmarks);
    expect(pose.confidence).toBeGreaterThan(0.9);
    expect(Math.abs(pose.x)).toBeLessThan(0.2);
    expect(Math.abs(pose.y)).toBeLessThan(0.2);
  });
});
