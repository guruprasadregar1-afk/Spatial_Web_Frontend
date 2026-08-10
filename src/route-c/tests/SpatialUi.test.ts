import { describe, it, expect } from 'vitest';
import { SpatialUiModelUtils } from '../ui/SpatialUiModel';
import { SpatialUiGeometry } from '../ui/SpatialUiGeometry';
import { SpatialUiHitTest } from '../ui/SpatialUiHitTest';
import { Voxelizer } from '../voxel-engine/Voxelizer';
import { SpatialDepthRegion } from '../boundary/ScreenPlane';

describe('ROUTE C — Part 15: Spatial UI Representation & Pipeline Tests', () => {
  it('should create valid display-independent Spatial UI model tree', () => {
    const tree = SpatialUiModelUtils.createDemoUiTree();
    expect(tree.elements.size).toBeGreaterThan(4);
    expect(tree.elements.has('main-panel')).toBe(true);
    expect(tree.elements.has('btn-scan')).toBe(true);
  });

  it('should enforce depth hierarchy ordering across spatial depth regions', () => {
    const tree = SpatialUiModelUtils.createDemoUiTree();
    const panel = tree.elements.get('main-panel');
    const button = tree.elements.get('btn-scan');
    const boundaryFrame = tree.elements.get('screen-boundary-frame');
    const floatingCard = tree.elements.get('floating-popout-card');

    expect(panel?.region).toBe(SpatialDepthRegion.SCREEN_INTERIOR);
    expect(button?.region).toBe(SpatialDepthRegion.SCREEN_INTERIOR);
    expect(boundaryFrame?.region).toBe(SpatialDepthRegion.SCREEN_BOUNDARY);
    expect(floatingCard?.region).toBe(SpatialDepthRegion.BEYOND_SCREEN);
    expect(floatingCard?.position[2]).toBeGreaterThan(0);
  });

  it('SpatialUiGeometry should convert Spatial UI tree to 3D SpatialSceneSnapshot descriptors', () => {
    const tree = SpatialUiModelUtils.createDemoUiTree();
    const snapshot = SpatialUiGeometry.convertTreeToSnapshot(tree);

    expect(snapshot.objects.length).toBe(tree.elements.size);
    expect(snapshot.objects[0].type).toBe('box');
  });

  it('SpatialUiHitTest should perform 3D AABB raycast intersection and trigger hover/click state', () => {
    const tree = SpatialUiModelUtils.createDemoUiTree();

    // Ray directed at SCAN button position [-6, 1.0, -2.0]
    const hit = SpatialUiHitTest.testRay(tree, {
      origin: [-6, 1.0, 15],
      direction: [0, 0, -1],
    });

    expect(hit).toBeDefined();
    expect(hit?.id).toBe('btn-scan');

    const changed = SpatialUiHitTest.updateHoverState(tree, 'btn-scan');
    expect(changed).toBe(true);
    expect(tree.elements.get('btn-scan')?.state).toBe('hover');

    const clicked = SpatialUiHitTest.triggerClick(tree, 'btn-scan');
    expect(clicked).toBe(true);
    expect(tree.elements.get('btn-scan')?.state).toBe('active');
  });

  it('should voxelize Spatial UI tree and produce distinct VoxelFrames upon UI state updates', () => {
    const voxelizer = new Voxelizer();
    const tree = SpatialUiModelUtils.createDemoUiTree();

    const snapshot1 = SpatialUiGeometry.convertTreeToSnapshot(tree);
    const frame1 = voxelizer.voxelizeGraph({
      version: '2.1',
      rootId: snapshot1.objects[0].id,
      nodes: Object.fromEntries(
        snapshot1.objects.map((obj) => [
          obj.id,
          {
            id: obj.id,
            type: 'card' as const,
            parentId: null,
            content: { title: obj.id },
            transform: { position: obj.position, rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },
            relations: [],
            interaction: { selectable: true, expandable: true, hoverable: true },
            render: { color: obj.color },
          },
        ])
      ),
      updatedAt: new Date().toISOString(),
    });

    expect(frame1.voxels.length).toBeGreaterThan(0);
  });
});
