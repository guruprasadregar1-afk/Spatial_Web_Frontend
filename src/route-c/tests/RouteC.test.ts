import { describe, it, expect } from 'vitest';
import { Voxelizer } from '../voxel-engine/Voxelizer';
import { DisplayManager } from '../core/abstraction/DisplayManager';
import { VirtualPointCloudDriver } from '../drivers/virtual/VirtualPointCloudDriver';
import { PhysicalHardwareDriverStub } from '../drivers/physical/PhysicalHardwareDriverStub';

describe('ROUTE C — Display-Agnostic Volumetric Architecture', () => {
  it('Voxelizer should convert 3D SpatialGraph nodes into VoxelFrame buffers', () => {
    const voxelizer = new Voxelizer();
    const mockGraph = {
      version: '2.1',
      rootId: 'root-1',
      nodes: {
        'root-1': {
          id: 'root-1',
          type: 'root' as const,
          parentId: null,
          content: { title: 'Volumetric Core' },
          transform: { position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },
          relations: [],
          interaction: { selectable: true, expandable: true, hoverable: true },
          render: { color: '#00f3ff' },
        },
      },
      updatedAt: new Date().toISOString(),
    };

    const frame = voxelizer.voxelizeGraph(mockGraph, {
      resolution: [32, 32, 32],
      bounds: { min: [-20, -20, -20], max: [20, 20, 20] },
    });
    expect(frame.voxels.length).toBeGreaterThan(0);
    expect(frame.dimensions).toEqual([32, 32, 32]);
  });

  it('DisplayManager should register and switch between Virtual Simulator and Physical Hardware Stub', async () => {
    const manager = new DisplayManager();
    const virtualDriver = new VirtualPointCloudDriver();
    const physicalDriver = new PhysicalHardwareDriverStub();

    manager.registerDriver(virtualDriver);
    manager.registerDriver(physicalDriver);

    expect(manager.getRegisteredDrivers().length).toBe(2);

    await manager.setActiveDriver('physical-hardware-driver-stub');
    expect(manager.getActiveDriver()?.id).toBe('physical-hardware-driver-stub');
  });
});
