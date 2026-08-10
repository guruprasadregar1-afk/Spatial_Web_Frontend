import { SpatialSceneSnapshot, SpatialObjectDescriptor, SceneSnapshotUtils } from '../core/scene/SpatialSceneSnapshot';
import { SpatialViewerState } from '../interaction/SpatialViewerState';

export class SpatialUiScene {
  private version: number = 1;
  private viewerPosition: [number, number, number] = [0, 0, 15];

  public updateViewer(viewerState: SpatialViewerState): SpatialSceneSnapshot {
    this.viewerPosition = viewerState.position;
    this.version++;
    return this.getSnapshot();
  }

  public getSnapshot(): SpatialSceneSnapshot {
    const [vx, vy, vz] = this.viewerPosition;

    // Spatial UI Objects shift in parallax response to physical viewer state
    const objects: SpatialObjectDescriptor[] = [
      {
        id: 'ui-core-box',
        type: 'box',
        position: [-vx * 0.3, -vy * 0.3, 0],
        color: '#00f3ff',
        params: { size: [5, 5, 5] },
      },
      {
        id: 'ui-neural-sphere',
        type: 'sphere',
        position: [8 - vx * 0.2, 4 - vy * 0.2, 4],
        color: '#a855f7',
        params: { radius: 3 },
      },
      {
        id: 'ui-beacon-line',
        type: 'line',
        position: [0, 0, 0],
        color: '#fbbf24',
        params: {
          start: [-12, -6, -5],
          end: [12, 6, -5],
        },
      },
    ];

    return SceneSnapshotUtils.createSnapshot(objects, this.version);
  }
}

export const spatialUiScene = new SpatialUiScene();
