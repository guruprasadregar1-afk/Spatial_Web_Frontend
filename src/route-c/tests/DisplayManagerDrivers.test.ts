import { describe, it, expect } from 'vitest';
import { DisplayManager } from '../core/abstraction/DisplayManager';
import { VirtualPointCloudDriver } from '../drivers/virtual/VirtualPointCloudDriver';
import { PhysicalHardwareDriverStub } from '../drivers/physical/PhysicalHardwareDriverStub';

describe('ROUTE C — Tasks 8, 9 & 10: DisplayManager & Driver Contracts', () => {
  it('Task 8: DisplayManager should handle driver registration, selection, switching, and disposal', async () => {
    const manager = new DisplayManager();
    const virtualDriver = new VirtualPointCloudDriver();
    const physicalDriver = new PhysicalHardwareDriverStub();

    manager.registerDriver(virtualDriver);
    manager.registerDriver(physicalDriver);

    expect(manager.getRegisteredDrivers().length).toBe(2);

    await manager.setActiveDriver('physical-hardware-driver-stub');
    expect(manager.getActiveDriver()?.id).toBe('physical-hardware-driver-stub');

    manager.dispose();
    expect(manager.getActiveDriver()).toBeNull();
  });

  it('Task 9: VirtualPointCloudDriver should initialize, accept frames, and dispose resources without leaking', async () => {
    const virtualDriver = new VirtualPointCloudDriver();
    await virtualDriver.initialize();

    expect(virtualDriver.capabilities.supportsColor).toBe(true);
    expect(virtualDriver.capabilities.isPhysical).toBe(false);

    virtualDriver.renderFrame({
      dimensions: [16, 16, 16],
      bounds: { min: [-10, -10, -10], max: [10, 10, 10] },
      voxels: [{ x: 0, y: 0, z: 0, r: 0, g: 1, b: 0, a: 1, intensity: 1 }],
      timestamp: performance.now(),
    });

    expect(virtualDriver.getPointsMesh()).toBeDefined();
    virtualDriver.dispose();
    expect(virtualDriver.getPointsMesh()).toBeNull();
  });

  it('Task 10: PhysicalHardwareDriverStub should explicitly expose NO_PHYSICAL_DEVICE status and discard frames safely', async () => {
    const physicalDriver = new PhysicalHardwareDriverStub();
    await physicalDriver.initialize();

    expect(physicalDriver.getStatus()).toBe('NO_PHYSICAL_DEVICE');
    expect(physicalDriver.capabilities.isPhysical).toBe(true);

    // Frame rendering should be safely discarded without error
    physicalDriver.renderFrame({
      dimensions: [16, 16, 16],
      bounds: { min: [-10, -10, -10], max: [10, 10, 10] },
      voxels: [],
      timestamp: performance.now(),
    });

    expect(physicalDriver.getFrameCount()).toBe(0);
  });
});
