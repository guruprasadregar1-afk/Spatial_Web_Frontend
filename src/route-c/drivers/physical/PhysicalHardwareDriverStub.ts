import { IVolumetricDisplayDriver } from '../../core/abstraction/IVolumetricDisplayDriver';
import { VoxelFrame } from '../../core/types/VoxelTypes';
import { DisplayDriverCapabilities, DisplayDriverMode } from '../../core/types/DisplayTypes';

export type HardwareStatus = 'NOT_IMPLEMENTED' | 'NO_PHYSICAL_DEVICE' | 'INITIALIZING';

export class PhysicalHardwareDriverStub implements IVolumetricDisplayDriver {
  public id = 'physical-hardware-driver-stub';
  public name = 'Future Free-Space Volumetric Hardware Driver (STUB)';
  public mode: DisplayDriverMode = 'physical-hardware-stub';

  public capabilities: DisplayDriverCapabilities = {
    maxResolution: [128, 128, 128],
    supportsColor: false,
    supportsTransparency: false,
    isPhysical: true,
  };

  private status: HardwareStatus = 'NO_PHYSICAL_DEVICE';
  private frameCounter: number = 0;

  public async initialize(): Promise<void> {
    // Explicitly set status to NO_PHYSICAL_DEVICE indicating hardware is not attached
    this.status = 'NO_PHYSICAL_DEVICE';
    console.warn('[PhysicalHardwareDriverStub] Hardware stub initialized — Status: NO_PHYSICAL_DEVICE (No physical volumetric hardware connected).');
  }

  public renderFrame(frame: VoxelFrame): void {
    // Frame submission fails safely because no physical hardware exists
    if (this.status === 'NO_PHYSICAL_DEVICE' || this.status === 'NOT_IMPLEMENTED') {
      // Discard frame without claiming successful physical rendering
      return;
    }
    this.frameCounter++;
  }

  public getStatus(): HardwareStatus {
    return this.status;
  }

  public getFrameCount(): number {
    return this.frameCounter;
  }

  public dispose(): void {
    this.status = 'NOT_IMPLEMENTED';
    this.frameCounter = 0;
  }
}
