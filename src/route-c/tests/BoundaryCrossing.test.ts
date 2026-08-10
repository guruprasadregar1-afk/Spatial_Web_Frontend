import { describe, it, expect } from 'vitest';
import { ScreenPlane, SpatialDepthRegion, defaultScreenPlane } from '../boundary/ScreenPlane';
import { DisplayBoundary, defaultDisplayBoundary } from '../boundary/DisplayBoundary';
import { SpatialUiModelUtils } from '../ui/SpatialUiModel';
import { SpatialUiGeometry } from '../ui/SpatialUiGeometry';
import { SpatialUiHitTest } from '../ui/SpatialUiHitTest';
import { Voxelizer } from '../voxel-engine/Voxelizer';

describe('ROUTE C — Part 16: Screen-Boundary Crossing Tests', () => {
  it('should construct valid ScreenPlane with normal vector [0, 0, 1] facing viewer', () => {
    const plane = new ScreenPlane(24, 14);
    expect(plane.width).toBe(24);
    expect(plane.height).toBe(14);
    expect(plane.normal).toEqual([0, 0, 1]);
    expect(plane.origin).toEqual([0, 0, 0]);
  });

  it('should classify points into SCREEN_INTERIOR, SCREEN_BOUNDARY, and BEYOND_SCREEN', () => {
    const plane = new ScreenPlane(24, 14);

    expect(plane.classifyDepthRegion(-2.0)).toBe(SpatialDepthRegion.SCREEN_INTERIOR);
    expect(plane.classifyDepthRegion(0.0)).toBe(SpatialDepthRegion.SCREEN_BOUNDARY);
    expect(plane.classifyDepthRegion(4.0)).toBe(SpatialDepthRegion.BEYOND_SCREEN);
  });

  it('should calculate signed distance to screen plane cleanly', () => {
    const plane = new ScreenPlane(24, 14);
    expect(plane.getSignedDistance(5.0)).toBe(5.0);
    expect(plane.getSignedDistance(-3.0)).toBe(-3.0);
  });

  it('should support continuous Z depth movement across boundary without teleportation', () => {
    const tree = SpatialUiModelUtils.createDemoUiTree();

    const region1 = SpatialUiModelUtils.updateElementZ(tree, 'floating-popout-card', -2.0);
    expect(region1).toBe(SpatialDepthRegion.SCREEN_INTERIOR);

    const region2 = SpatialUiModelUtils.updateElementZ(tree, 'floating-popout-card', 0.0);
    expect(region2).toBe(SpatialDepthRegion.SCREEN_BOUNDARY);

    const region3 = SpatialUiModelUtils.updateElementZ(tree, 'floating-popout-card', 5.0);
    expect(region3).toBe(SpatialDepthRegion.BEYOND_SCREEN);
  });

  it('should perform 3D hit testing for elements in BEYOND_SCREEN region (Z > 0)', () => {
    const tree = SpatialUiModelUtils.createDemoUiTree();

    // Ray aimed at floating popout card at [0, 3.5, 4.0]
    const hit = SpatialUiHitTest.testRay(tree, {
      origin: [0, 3.5, 15],
      direction: [0, 0, -1],
    });

    expect(hit).toBeDefined();
    expect(hit?.id).toBe('floating-popout-card');
  });

  it('should voxelize continuous boundary-crossing Spatial UI tree', () => {
    const voxelizer = new Voxelizer();
    const tree = SpatialUiModelUtils.createDemoUiTree();
    const snapshot = SpatialUiGeometry.convertTreeToSnapshot(tree);

    const frame = voxelizer.voxelizeGraph({
      version: '2.1',
      rootId: snapshot.objects[0].id,
      nodes: Object.fromEntries(
        snapshot.objects.map((obj) => [
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

    expect(frame.voxels.length).toBeGreaterThan(0);
  });
});
