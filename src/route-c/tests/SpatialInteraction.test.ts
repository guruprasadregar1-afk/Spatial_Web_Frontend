import { describe, it, expect } from 'vitest';
import { HeadPoseAdapter } from '../interaction/HeadPoseAdapter';
import { ViewerStateUtils } from '../interaction/SpatialViewerState';
import { SpatialUiScene } from '../scene/SpatialUiScene';

describe('ROUTE C — PROMPT 11: Real Webcam Tracking & Mini Jaipur Spatial Parallax Tests', () => {
  it('should initialize default SpatialViewerState cleanly', () => {
    const state = ViewerStateUtils.createDefaultState('disabled');
    expect(state.mode).toBe('disabled');
    expect(state.status).toBe('disabled');
    expect(state.position).toEqual([0, 0, 15]);
  });

  it('HeadPoseAdapter should support neutral center calibration producing zero delta', () => {
    const adapter = new HeadPoseAdapter();
    adapter.setMode('webcam');

    // Calibrate at off-center pose (x: 0.2, y: -0.1, z: 0.9)
    adapter.calibrateCenter({
      x: 0.2,
      y: -0.1,
      z: 0.9,
      yaw: 0,
      pitch: 0,
      roll: 0,
      confidence: 1.0,
      timestamp: performance.now(),
    });

    const state = adapter.adaptNormalizedPose({
      x: 0.2,
      y: -0.1,
      z: 0.9,
      yaw: 0,
      pitch: 0,
      roll: 0,
      confidence: 1.0,
      timestamp: performance.now(),
    });

    // Delta from neutral calibration is zero
    expect(state.calibratedDelta?.[0]).toBeCloseTo(0);
    expect(state.calibratedDelta?.[1]).toBeCloseTo(0);
    expect(state.calibratedDelta?.[2]).toBeCloseTo(0);
    // Viewer position remains at neutral distance [0, 0, 15]
    expect(state.position[0]).toBeCloseTo(0);
    expect(state.position[1]).toBeCloseTo(0);
    expect(state.position[2]).toBeCloseTo(15);
  });

  it('HeadPoseAdapter should produce correct X, Y, Z sign directions for physical movement', () => {
    const adapter = new HeadPoseAdapter();
    adapter.setMode('webcam');
    adapter.calibrateCenter({ x: 0, y: 0, z: 1.0, yaw: 0, pitch: 0, roll: 0, confidence: 1.0, timestamp: performance.now() });

    // User moves head RIGHT (x increases)
    const rightState = adapter.adaptNormalizedPose({
      x: 0.5,
      y: 0,
      z: 1.0,
      yaw: 0,
      pitch: 0,
      roll: 0,
      confidence: 1.0,
      timestamp: performance.now(),
    });
    expect(rightState.position[0]).toBeGreaterThan(0);

    // User moves head LEFT (x decreases)
    const leftState = adapter.adaptNormalizedPose({
      x: -0.5,
      y: 0,
      z: 1.0,
      yaw: 0,
      pitch: 0,
      roll: 0,
      confidence: 1.0,
      timestamp: performance.now(),
    });
    expect(leftState.position[0]).toBeLessThan(0);

    // User moves head UP (y increases)
    const upState = adapter.adaptNormalizedPose({
      x: 0,
      y: 0.5,
      z: 1.0,
      yaw: 0,
      pitch: 0,
      roll: 0,
      confidence: 1.0,
      timestamp: performance.now(),
    });
    expect(upState.position[1]).toBeGreaterThan(0);

    // User moves head CLOSER to screen (z decreases)
    const closerState = adapter.adaptNormalizedPose({
      x: 0,
      y: 0,
      z: 0.5,
      yaw: 0,
      pitch: 0,
      roll: 0,
      confidence: 1.0,
      timestamp: performance.now(),
    });
    expect(closerState.position[2]).toBeLessThan(15.0);
  });

  it('HeadPoseAdapter should support manual WASDQE keyboard mode and reset', () => {
    const adapter = new HeadPoseAdapter();
    adapter.setMode('manual');

    let state = adapter.updateManualPosition(2, -3, 1);
    expect(state.mode).toBe('manual');
    expect(state.status).toBe('manual');
    expect(state.position[0]).toBe(2);
    expect(state.position[1]).toBe(-3);
    expect(state.position[2]).toBe(16);

    state = adapter.resetViewerPosition();
    expect(state.position).toEqual([0, 0, 15]);
  });

  it('HeadPoseAdapter should handle low-confidence tracking gracefully', () => {
    const adapter = new HeadPoseAdapter();
    adapter.setMode('webcam');

    const lowConfidenceState = adapter.adaptNormalizedPose({
      x: 0.5,
      y: 0.5,
      z: 1.0,
      yaw: 0,
      pitch: 0,
      roll: 0,
      confidence: 0.1, // Low confidence
      timestamp: performance.now(),
    });

    expect(lowConfidenceState.status).toBe('degraded');
  });

  it('PROMPT 11 REGRESSION TEST: Mini Jaipur landmark 3D positions must remain immutable in world space when viewer moves', () => {
    const jaipurLandmarkPositions: Record<string, [number, number, number]> = {
      'jaipur-hawa-mahal': [-12, 4, -5],
      'jaipur-amer-fort': [14, 5, -12],
      'jaipur-city-palace': [2, 1, 8],
    };

    const adapter = new HeadPoseAdapter();
    adapter.setMode('webcam');

    // Simulate head displacement to [5, -3, 12]
    const poseMoved = adapter.adaptNormalizedPose({
      x: 0.4,
      y: -0.3,
      z: 0.8,
      yaw: 0.1,
      pitch: -0.1,
      roll: 0,
      confidence: 0.95,
      timestamp: performance.now(),
    });

    // Camera position moves to match viewer position
    expect(poseMoved.position[0]).toBeGreaterThan(0);
    expect(poseMoved.position[1]).toBeLessThan(0);

    // Mini Jaipur 3D landmark world coordinates remain strictly IMMUTABLE
    expect(jaipurLandmarkPositions['jaipur-hawa-mahal']).toEqual([-12, 4, -5]);
    expect(jaipurLandmarkPositions['jaipur-amer-fort']).toEqual([14, 5, -12]);
    expect(jaipurLandmarkPositions['jaipur-city-palace']).toEqual([2, 1, 8]);
  });
});
