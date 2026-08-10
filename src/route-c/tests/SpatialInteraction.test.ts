import { describe, it, expect } from 'vitest';
import { HeadPoseAdapter } from '../interaction/HeadPoseAdapter';
import { ViewerStateUtils } from '../interaction/SpatialViewerState';
import { SpatialUiScene } from '../scene/SpatialUiScene';

describe('ROUTE C — Part 13: Spatial Interaction & Viewer Coupling Tests', () => {
  it('should initialize default SpatialViewerState cleanly', () => {
    const state = ViewerStateUtils.createDefaultState('disabled');
    expect(state.mode).toBe('disabled');
    expect(state.status).toBe('disabled');
    expect(state.position).toEqual([0, 0, 15]);
  });

  it('HeadPoseAdapter should translate normalized webcam head pose into Route C World space', () => {
    const adapter = new HeadPoseAdapter();
    adapter.setMode('webcam');

    const state = adapter.adaptNormalizedPose({
      x: 0.5,
      y: -0.5,
      z: 1.0,
      yaw: 0.1,
      pitch: -0.1,
      roll: 0,
      confidence: 0.95,
      timestamp: performance.now(),
    });

    expect(state.mode).toBe('webcam');
    expect(state.status).toBe('active');
    expect(state.position[0]).toBeGreaterThan(0);
    expect(state.position[1]).toBeLessThan(0);
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

  it('SpatialUiScene should update scene objects in response to viewer movement', () => {
    const scene = new SpatialUiScene();
    const snap1 = scene.getSnapshot();

    const viewerState = ViewerStateUtils.createDefaultState('manual');
    viewerState.position = [10, 5, 15];

    const snap2 = scene.updateViewer(viewerState);
    expect(snap2.version).toBeGreaterThan(snap1.version);
    expect(snap2.objects.length).toBeGreaterThan(0);
  });
});
