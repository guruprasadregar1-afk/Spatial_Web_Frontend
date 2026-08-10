import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SceneSnapshotUtils, SpatialSceneSnapshot } from '../core/scene/SpatialSceneSnapshot';
import { VolumetricScenePipeline } from '../pipeline/VolumetricScenePipeline';
import { VolumetricFrameStream } from '../stream/VolumetricFrameStream';

describe('ROUTE C — Part 15: Real-Time Frame Stream Pipeline Tests', () => {
  it('should create valid scene snapshots and detect dirty-state changes', () => {
    const snapshot1 = SceneSnapshotUtils.createSnapshot([
      { id: 'b1', type: 'box', position: [0, 0, 0], color: '#00f3ff' },
    ]);

    const snapshot2 = SceneSnapshotUtils.createSnapshot([
      { id: 'b1', type: 'box', position: [0, 0, 0], color: '#00f3ff' },
    ]);

    const snapshot3 = SceneSnapshotUtils.createSnapshot([
      { id: 'b1', type: 'box', position: [5, 0, 0], color: '#00f3ff' },
    ]);

    expect(SceneSnapshotUtils.isDifferent(snapshot1, snapshot2)).toBe(false);
    expect(SceneSnapshotUtils.isDifferent(snapshot1, snapshot3)).toBe(true);
  });

  it('VolumetricScenePipeline should generate immutable frozen VoxelFrames', () => {
    const pipeline = new VolumetricScenePipeline();
    const snapshot = SceneSnapshotUtils.createSnapshot([
      { id: 's1', type: 'sphere', position: [0, 0, 0], color: '#a855f7', params: { radius: 4 } },
    ]);

    const { frame, isDirty } = pipeline.processSnapshot(snapshot);
    expect(isDirty).toBe(true);
    expect(Object.isFrozen(frame)).toBe(true);
    expect(Object.isFrozen(frame.voxels)).toBe(true);
  });

  it('VolumetricFrameStream should start, tick, pause, resume, and stop correctly', () => {
    const stream = new VolumetricFrameStream();
    stream.start(30);

    expect(stream.getIsRunning()).toBe(true);
    expect(stream.getIsPaused()).toBe(false);

    const snapshot = SceneSnapshotUtils.createSnapshot([
      { id: 'p1', type: 'point', position: [2, 2, 2], color: '#00f3ff' },
    ]);

    stream.submitSceneSnapshot(snapshot);
    stream.tick();

    const telemetry = stream.getTelemetryStatistics();
    expect(telemetry.frameNumber).toBe(1);
    expect(telemetry.targetFPS).toBe(30);

    stream.pause();
    expect(stream.getIsPaused()).toBe(true);

    stream.resume();
    expect(stream.getIsPaused()).toBe(false);

    stream.stop();
    expect(stream.getIsRunning()).toBe(false);
  });

  it('VolumetricFrameStream should drop obsolete pending snapshots when new snapshots arrive before tick', () => {
    const stream = new VolumetricFrameStream();
    stream.start(30);

    const snap1 = SceneSnapshotUtils.createSnapshot([{ id: '1', type: 'box', position: [0, 0, 0], color: '#ff0000' }]);
    const snap2 = SceneSnapshotUtils.createSnapshot([{ id: '2', type: 'box', position: [1, 0, 0], color: '#00ff00' }]);
    const snap3 = SceneSnapshotUtils.createSnapshot([{ id: '3', type: 'box', position: [2, 0, 0], color: '#0000ff' }]);

    stream.submitSceneSnapshot(snap1);
    stream.submitSceneSnapshot(snap2); // snap1 dropped
    stream.submitSceneSnapshot(snap3); // snap2 dropped

    stream.tick();

    const telemetry = stream.getTelemetryStatistics();
    expect(telemetry.droppedFrames).toBe(2);
    stream.stop();
  });
});
