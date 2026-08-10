import { NormalizedHeadPose } from '../../spatial/coordinate-system/CoordinateSystem';

export type TrackingPreset = 'CENTER' | 'LEFT' | 'RIGHT' | 'UP' | 'DOWN' | 'CLOSE' | 'FAR';

export class MockTrackingProvider {
  private currentPose: NormalizedHeadPose = {
    x: 0,
    y: 0,
    z: 1.0,
    yaw: 0,
    pitch: 0,
    roll: 0,
    confidence: 1.0,
    timestamp: performance.now(),
  };

  private isActive: boolean = false;
  private onPoseCallback: ((pose: NormalizedHeadPose) => void) | null = null;
  private keyListenerAttached: boolean = false;

  public startMockTracking(onPoseUpdate: (pose: NormalizedHeadPose) => void): void {
    this.onPoseCallback = onPoseUpdate;
    this.isActive = true;

    if (typeof window !== 'undefined' && !this.keyListenerAttached) {
      window.addEventListener('keydown', this.handleKeyDown);
      this.keyListenerAttached = true;
    }

    this.emitPose();
  }

  public stopMockTracking(): void {
    this.isActive = false;
    if (typeof window !== 'undefined' && this.keyListenerAttached) {
      window.removeEventListener('keydown', this.handleKeyDown);
      this.keyListenerAttached = false;
    }
  }

  public applyPreset(preset: TrackingPreset): void {
    switch (preset) {
      case 'CENTER':
        this.currentPose.x = 0;
        this.currentPose.y = 0;
        this.currentPose.z = 1.0;
        break;
      case 'LEFT':
        this.currentPose.x = -0.7;
        break;
      case 'RIGHT':
        this.currentPose.x = 0.7;
        break;
      case 'UP':
        this.currentPose.y = 0.7;
        break;
      case 'DOWN':
        this.currentPose.y = -0.7;
        break;
      case 'CLOSE':
        this.currentPose.z = 0.6;
        break;
      case 'FAR':
        this.currentPose.z = 1.6;
        break;
    }
    this.emitPose();
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    if (!this.isActive) return;

    // Ignore key presses inside input or textarea
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      return;
    }

    const step = 0.1;
    switch (e.key.toLowerCase()) {
      case 'a':
        this.currentPose.x = Math.max(-1.5, this.currentPose.x - step);
        this.emitPose();
        break;
      case 'd':
        this.currentPose.x = Math.min(1.5, this.currentPose.x + step);
        this.emitPose();
        break;
      case 'w':
        this.currentPose.y = Math.min(1.5, this.currentPose.y + step);
        this.emitPose();
        break;
      case 's':
        this.currentPose.y = Math.max(-1.5, this.currentPose.y - step);
        this.emitPose();
        break;
      case 'q':
        this.currentPose.z = Math.max(0.4, this.currentPose.z - step);
        this.emitPose();
        break;
      case 'e':
        this.currentPose.z = Math.min(2.5, this.currentPose.z + step);
        this.emitPose();
        break;
    }
  };

  private emitPose(): void {
    if (this.onPoseCallback) {
      this.currentPose.timestamp = performance.now();
      this.onPoseCallback({ ...this.currentPose });
    }
  }

  public getCurrentPose(): NormalizedHeadPose {
    return { ...this.currentPose };
  }
}

export const mockTrackingProvider = new MockTrackingProvider();
