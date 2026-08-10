import { VoxelFrame } from '../types/VoxelTypes';
import { DisplayDriverCapabilities, DisplayDriverMode } from '../types/DisplayTypes';

export interface IVolumetricDisplayDriver {
  id: string;
  name: string;
  mode: DisplayDriverMode;
  capabilities: DisplayDriverCapabilities;
  
  initialize(): Promise<void>;
  renderFrame(frame: VoxelFrame): void;
  dispose(): void;
}
