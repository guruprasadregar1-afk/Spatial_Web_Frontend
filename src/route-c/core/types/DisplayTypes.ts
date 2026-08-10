export type DisplayDriverMode = 'virtual-point-cloud' | 'virtual-slice-stack' | 'physical-hardware-stub';

export interface DisplayDriverCapabilities {
  maxResolution: [number, number, number];
  supportsColor: boolean;
  supportsTransparency: boolean;
  isPhysical: boolean;
}
