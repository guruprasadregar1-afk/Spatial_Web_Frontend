import * as THREE from 'three';
import { VoxelFrame, VoxelPoint, VoxelBounds } from '../core/types/VoxelTypes';
import { VoxelGrid } from './VoxelGrid';
import { SpatialGraph } from '@/types/spatial';

export interface VoxelizerOptions {
  resolution: [number, number, number];
  bounds: VoxelBounds;
}

export class Voxelizer {
  /**
   * Deterministically voxelizes a simple 3D Point
   */
  public voxelizePoint(
    point: [number, number, number],
    color: string = '#00f3ff',
    options: VoxelizerOptions = { resolution: [32, 32, 32], bounds: { min: [-20, -20, -20], max: [20, 20, 20] } }
  ): VoxelFrame {
    const grid = new VoxelGrid(options.resolution, options.bounds);
    const colorObj = new THREE.Color(color);

    grid.setVoxel(point[0], point[1], point[2], {
      x: point[0],
      y: point[1],
      z: point[2],
      r: colorObj.r,
      g: colorObj.g,
      b: colorObj.b,
      a: 1.0,
      intensity: 1.0,
    });

    return {
      dimensions: options.resolution,
      bounds: options.bounds,
      voxels: grid.getAllVoxels(),
      timestamp: performance.now(),
    };
  }

  /**
   * Deterministically voxelizes a 3D Line segment
   */
  public voxelizeLine(
    start: [number, number, number],
    end: [number, number, number],
    steps: number = 16,
    color: string = '#00f3ff',
    options: VoxelizerOptions = { resolution: [32, 32, 32], bounds: { min: [-20, -20, -20], max: [20, 20, 20] } }
  ): VoxelFrame {
    const grid = new VoxelGrid(options.resolution, options.bounds);
    const colorObj = new THREE.Color(color);

    for (let i = 0; i <= steps; i++) {
      const t = i / Math.max(1, steps);
      const x = start[0] + t * (end[0] - start[0]);
      const y = start[1] + t * (end[1] - start[1]);
      const z = start[2] + t * (end[2] - start[2]);

      grid.setVoxel(x, y, z, {
        x,
        y,
        z,
        r: colorObj.r,
        g: colorObj.g,
        b: colorObj.b,
        a: 1.0,
        intensity: 1.0,
      });
    }

    return {
      dimensions: options.resolution,
      bounds: options.bounds,
      voxels: grid.getAllVoxels(),
      timestamp: performance.now(),
    };
  }

  /**
   * Deterministically voxelizes a simple 3D Box
   */
  public voxelizeBox(
    center: [number, number, number],
    size: [number, number, number],
    color: string = '#00f3ff',
    options: VoxelizerOptions = { resolution: [32, 32, 32], bounds: { min: [-20, -20, -20], max: [20, 20, 20] } }
  ): VoxelFrame {
    const grid = new VoxelGrid(options.resolution, options.bounds);
    const colorObj = new THREE.Color(color);
    const [cx, cy, cz] = center;
    const [sx, sy, sz] = size;

    const halfX = sx / 2;
    const halfY = sy / 2;
    const halfZ = sz / 2;

    const step = Math.min(sx, sy, sz) / 4 || 0.5;

    for (let x = cx - halfX; x <= cx + halfX; x += step) {
      for (let y = cy - halfY; y <= cy + halfY; y += step) {
        for (let z = cz - halfZ; z <= cz + halfZ; z += step) {
          grid.setVoxel(x, y, z, {
            x,
            y,
            z,
            r: colorObj.r,
            g: colorObj.g,
            b: colorObj.b,
            a: 1.0,
            intensity: 1.0,
          });
        }
      }
    }

    return {
      dimensions: options.resolution,
      bounds: options.bounds,
      voxels: grid.getAllVoxels(),
      timestamp: performance.now(),
    };
  }

  /**
   * Deterministically voxelizes a 3D Sphere
   */
  public voxelizeSphere(
    center: [number, number, number],
    radius: number,
    color: string = '#a855f7',
    options: VoxelizerOptions = { resolution: [32, 32, 32], bounds: { min: [-20, -20, -20], max: [20, 20, 20] } }
  ): VoxelFrame {
    const grid = new VoxelGrid(options.resolution, options.bounds);
    const colorObj = new THREE.Color(color);
    const [cx, cy, cz] = center;

    const steps = 24;
    for (let i = 0; i < steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      for (let j = 0; j < steps; j++) {
        const phi = (j / steps) * Math.PI;

        const x = cx + radius * Math.sin(phi) * Math.cos(theta);
        const y = cy + radius * Math.sin(phi) * Math.sin(theta);
        const z = cz + radius * Math.cos(phi);

        grid.setVoxel(x, y, z, {
          x,
          y,
          z,
          r: colorObj.r,
          g: colorObj.g,
          b: colorObj.b,
          a: 1.0,
          intensity: 1.0,
        });
      }
    }

    return {
      dimensions: options.resolution,
      bounds: options.bounds,
      voxels: grid.getAllVoxels(),
      timestamp: performance.now(),
    };
  }

  /**
   * Converts a 3D SpatialGraph node network into a VoxelFrame
   */
  public voxelizeGraph(
    graph: SpatialGraph | null,
    options: VoxelizerOptions = { resolution: [32, 32, 32], bounds: { min: [-20, -20, -20], max: [20, 20, 20] } }
  ): VoxelFrame {
    const grid = new VoxelGrid(options.resolution, options.bounds);

    if (!graph || !graph.nodes) {
      return {
        dimensions: options.resolution,
        bounds: options.bounds,
        voxels: [],
        timestamp: performance.now(),
      };
    }

    Object.values(graph.nodes).forEach((node) => {
      const [nx, ny, nz] = node.transform.position;
      const colorObj = new THREE.Color(node.render.color || '#00f3ff');
      const pointCount = node.type === 'landmark' ? 36 : 24;

      for (let i = 0; i < pointCount; i++) {
        const theta = (i / pointCount) * Math.PI * 2;
        const vx = nx + Math.cos(theta) * 1.5;
        const vy = ny + Math.sin(theta) * 1.5;
        const vz = nz;

        grid.setVoxel(vx, vy, vz, {
          x: vx,
          y: vy,
          z: vz,
          r: colorObj.r,
          g: colorObj.g,
          b: colorObj.b,
          a: 0.9,
          intensity: 1.0,
        });
      }
    });

    return {
      dimensions: options.resolution,
      bounds: options.bounds,
      voxels: grid.getAllVoxels(),
      timestamp: performance.now(),
    };
  }
}

export const voxelizer = new Voxelizer();
