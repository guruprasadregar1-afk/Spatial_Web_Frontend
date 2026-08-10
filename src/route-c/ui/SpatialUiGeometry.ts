import { SpatialUiTree, SpatialUiElement } from './SpatialUiModel';
import { SpatialSceneSnapshot, SpatialObjectDescriptor, SceneSnapshotUtils } from '../core/scene/SpatialSceneSnapshot';

export class SpatialUiGeometry {
  /**
   * Converts SpatialUiTree elements into 3D SpatialSceneSnapshot descriptors
   */
  public static convertTreeToSnapshot(tree: SpatialUiTree): SpatialSceneSnapshot {
    const descriptors: SpatialObjectDescriptor[] = [];

    tree.elements.forEach((el) => {
      if (!el.visible) return;

      const [px, py, pz] = el.position;
      const actualZ = pz + el.depthOffset;
      let color = el.color;

      // React to UI Element State
      if (el.state === 'hover') {
        color = '#00f3ff'; // Glow cyan on hover
      } else if (el.state === 'active') {
        color = '#34d399'; // Glow green on active
      } else if (el.state === 'disabled') {
        color = '#4b5563'; // Muted grey
      }

      if (el.type === 'panel') {
        descriptors.push({
          id: el.id,
          type: 'box',
          position: [px, py, actualZ],
          color,
          params: { size: el.dimensions },
        });
      } else if (el.type === 'button') {
        const elevation = el.state === 'active' ? 0.2 : el.state === 'hover' ? 0.1 : 0.0;
        descriptors.push({
          id: el.id,
          type: 'box',
          position: [px, py, actualZ + elevation],
          color,
          params: { size: el.dimensions },
        });
      } else if (el.type === 'indicator') {
        descriptors.push({
          id: el.id,
          type: 'sphere',
          position: [px, py, actualZ],
          color,
          params: { radius: el.dimensions[0] / 2 },
        });
      } else if (el.type === 'text') {
        // Render 3D Vector Character Voxel Blocks
        descriptors.push({
          id: el.id,
          type: 'box',
          position: [px, py, actualZ],
          color,
          params: { size: el.dimensions },
        });
      } else {
        descriptors.push({
          id: el.id,
          type: 'box',
          position: [px, py, actualZ],
          color,
          params: { size: el.dimensions },
        });
      }
    });

    return SceneSnapshotUtils.createSnapshot(descriptors, tree.version);
  }
}
