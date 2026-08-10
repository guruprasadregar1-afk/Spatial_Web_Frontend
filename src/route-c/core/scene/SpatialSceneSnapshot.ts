export type SpatialObjectType = 'box' | 'sphere' | 'line' | 'point' | 'mesh';

export interface SpatialObjectDescriptor {
  id: string;
  type: SpatialObjectType;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
  color: string;
  params?: {
    size?: [number, number, number];
    radius?: number;
    start?: [number, number, number];
    end?: [number, number, number];
  };
}

export interface SpatialSceneSnapshot {
  version: number;
  timestamp: number;
  objects: SpatialObjectDescriptor[];
  metadata?: Record<string, unknown>;
}

export class SceneSnapshotUtils {
  public static createSnapshot(
    objects: SpatialObjectDescriptor[],
    version: number = 1
  ): SpatialSceneSnapshot {
    return Object.freeze({
      version,
      timestamp: performance.now(),
      objects: objects.map((obj) => Object.freeze({ ...obj })),
    });
  }

  public static isDifferent(prev: SpatialSceneSnapshot | null, next: SpatialSceneSnapshot): boolean {
    if (!prev) return true;
    if (prev.objects.length !== next.objects.length) return true;

    for (let i = 0; i < prev.objects.length; i++) {
      const p = prev.objects[i];
      const n = next.objects[i];
      if (
        p.id !== n.id ||
        p.type !== n.type ||
        p.color !== n.color ||
        p.position[0] !== n.position[0] ||
        p.position[1] !== n.position[1] ||
        p.position[2] !== n.position[2]
      ) {
        return true;
      }
    }

    return false;
  }
}
