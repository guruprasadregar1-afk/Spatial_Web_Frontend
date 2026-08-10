import { SpatialUiTree, SpatialUiElement } from './SpatialUiModel';

export interface Ray3D {
  origin: [number, number, number];
  direction: [number, number, number];
}

export class SpatialUiHitTest {
  /**
   * Performs 3D ray-to-element bounding box intersection testing
   */
  public static testRay(tree: SpatialUiTree, ray: Ray3D): SpatialUiElement | null {
    let closestElement: SpatialUiElement | null = null;
    let closestDist = Infinity;

    tree.elements.forEach((el) => {
      if (!el.interactive || !el.visible) return;

      const [px, py, pz] = el.position;
      const [w, h, d] = el.dimensions;

      const minX = px - w / 2;
      const maxX = px + w / 2;
      const minY = py - h / 2;
      const maxY = py + h / 2;
      const minZ = pz + el.depthOffset - d / 2;
      const maxZ = pz + el.depthOffset + d / 2;

      const [ox, oy, oz] = ray.origin;
      const [dx, dy, dz] = ray.direction;

      // Axis-Aligned Bounding Box (AABB) Ray Test
      const tx1 = (minX - ox) / (dx || 0.0001);
      const tx2 = (maxX - ox) / (dx || 0.0001);
      const ty1 = (minY - oy) / (dy || 0.0001);
      const ty2 = (maxY - oy) / (dy || 0.0001);
      const tz1 = (minZ - oz) / (dz || 0.0001);
      const tz2 = (maxZ - oz) / (dz || 0.0001);

      const tmin = Math.max(Math.min(tx1, tx2), Math.min(ty1, ty2), Math.min(tz1, tz2));
      const tmax = Math.min(Math.max(tx1, tx2), Math.max(ty1, ty2), Math.max(tz1, tz2));

      if (tmax >= tmin && tmax >= 0) {
        if (tmin < closestDist) {
          closestDist = tmin;
          closestElement = el;
        }
      }
    });

    return closestElement;
  }

  public static updateHoverState(tree: SpatialUiTree, hoveredId: string | null): boolean {
    let changed = false;

    tree.elements.forEach((el) => {
      if (!el.interactive) return;

      if (el.id === hoveredId) {
        if (el.state !== 'hover' && el.state !== 'active') {
          el.state = 'hover';
          changed = true;
        }
      } else {
        if (el.state === 'hover') {
          el.state = 'normal';
          changed = true;
        }
      }
    });

    if (changed) {
      tree.version++;
      tree.timestamp = performance.now();
    }

    return changed;
  }

  public static triggerClick(tree: SpatialUiTree, elementId: string): boolean {
    const el = tree.elements.get(elementId);
    if (!el || !el.interactive) return false;

    el.state = 'active';
    tree.version++;
    tree.timestamp = performance.now();

    // Reset back to hover state after 200ms
    setTimeout(() => {
      if (el.state === 'active') {
        el.state = 'hover';
        tree.version++;
        tree.timestamp = performance.now();
      }
    }, 200);

    return true;
  }
}
