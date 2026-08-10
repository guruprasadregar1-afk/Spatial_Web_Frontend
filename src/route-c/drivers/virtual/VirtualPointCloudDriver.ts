import * as THREE from 'three';
import { IVolumetricDisplayDriver } from '../../core/abstraction/IVolumetricDisplayDriver';
import { VoxelFrame } from '../../core/types/VoxelTypes';
import { DisplayDriverCapabilities, DisplayDriverMode } from '../../core/types/DisplayTypes';

export class VirtualPointCloudDriver implements IVolumetricDisplayDriver {
  public id = 'virtual-point-cloud-driver';
  public name = 'WebGL Monitor Volumetric Simulator';
  public mode: DisplayDriverMode = 'virtual-point-cloud';

  public capabilities: DisplayDriverCapabilities = {
    maxResolution: [64, 64, 64],
    supportsColor: true,
    supportsTransparency: true,
    isPhysical: false,
  };

  private pointsMesh: THREE.Points | null = null;
  private geometry: THREE.BufferGeometry | null = null;
  private material: THREE.PointsMaterial | null = null;
  private currentCapacity: number = 0;

  public async initialize(): Promise<void> {
    if (this.pointsMesh) return;

    this.geometry = new THREE.BufferGeometry();
    this.material = new THREE.PointsMaterial({
      size: 0.35,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    });

    this.pointsMesh = new THREE.Points(this.geometry, this.material);
  }

  public renderFrame(frame: VoxelFrame): void {
    if (!this.geometry || !frame.voxels) return;

    const count = frame.voxels.length;

    // Allocate / resize buffer attributes dynamically if capacity increases
    if (count > this.currentCapacity) {
      this.currentCapacity = Math.max(count, this.currentCapacity * 2 || 1024);
      const posArray = new Float32Array(this.currentCapacity * 3);
      const colArray = new Float32Array(this.currentCapacity * 3);

      this.geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
      this.geometry.setAttribute('color', new THREE.BufferAttribute(colArray, 3));
    }

    const posAttr = this.geometry.attributes.position as THREE.BufferAttribute;
    const colAttr = this.geometry.attributes.color as THREE.BufferAttribute;

    const posArray = posAttr.array as Float32Array;
    const colArray = colAttr.array as Float32Array;

    frame.voxels.forEach((v, i) => {
      posArray[i * 3] = v.x;
      posArray[i * 3 + 1] = v.y;
      posArray[i * 3 + 2] = v.z;

      colArray[i * 3] = v.r;
      colArray[i * 3 + 1] = v.g;
      colArray[i * 3 + 2] = v.b;
    });

    this.geometry.setDrawRange(0, count);
    posAttr.needsUpdate = true;
    colAttr.needsUpdate = true;
  }

  public getPointsMesh(): THREE.Points | null {
    return this.pointsMesh;
  }

  public dispose(): void {
    if (this.geometry) {
      this.geometry.dispose();
      this.geometry = null;
    }
    if (this.material) {
      this.material.dispose();
      this.material = null;
    }
    this.pointsMesh = null;
    this.currentCapacity = 0;
  }
}
