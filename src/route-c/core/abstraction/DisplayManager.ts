import { IVolumetricDisplayDriver } from './IVolumetricDisplayDriver';
import { VoxelFrame } from '../types/VoxelTypes';

export class DisplayManager {
  private drivers = new Map<string, IVolumetricDisplayDriver>();
  private activeDriverId: string | null = null;

  public registerDriver(driver: IVolumetricDisplayDriver): void {
    this.drivers.set(driver.id, driver);
    if (!this.activeDriverId) {
      this.activeDriverId = driver.id;
    }
  }

  public async setActiveDriver(id: string): Promise<boolean> {
    if (!this.drivers.has(id)) return false;

    if (this.activeDriverId && this.drivers.has(this.activeDriverId)) {
      this.drivers.get(this.activeDriverId)?.dispose();
    }

    this.activeDriverId = id;
    const driver = this.drivers.get(id);
    if (driver) {
      await driver.initialize();
    }
    return true;
  }

  public getActiveDriver(): IVolumetricDisplayDriver | null {
    if (!this.activeDriverId) return null;
    return this.drivers.get(this.activeDriverId) || null;
  }

  public render(frame: VoxelFrame): void {
    const active = this.getActiveDriver();
    if (active) {
      active.renderFrame(frame);
    }
  }

  public getRegisteredDrivers(): IVolumetricDisplayDriver[] {
    return Array.from(this.drivers.values());
  }

  public dispose(): void {
    this.drivers.forEach((driver) => driver.dispose());
    this.drivers.clear();
    this.activeDriverId = null;
  }
}

export const displayManager = new DisplayManager();
