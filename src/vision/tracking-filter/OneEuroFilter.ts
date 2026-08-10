/**
 * One Euro Filter — Low-latency adaptive noise reduction filter for head tracking.
 */
export class LowPassFilter {
  private alpha: number = 1.0;
  private s: number = 0;
  private initialized: boolean = false;

  public filter(value: number, alpha: number): number {
    this.alpha = alpha;
    if (!this.initialized) {
      this.s = value;
      this.initialized = true;
    } else {
      this.s = alpha * value + (1.0 - alpha) * this.s;
    }
    return this.s;
  }

  public reset(): void {
    this.initialized = false;
  }
}

export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xFilter: LowPassFilter;
  private dxFilter: LowPassFilter;
  private lastTime: number = 0;

  constructor(minCutoff: number = 1.0, beta: number = 0.007, dCutoff: number = 1.0) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.xFilter = new LowPassFilter();
    this.dxFilter = new LowPassFilter();
  }

  private alpha(cutoff: number, dt: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  public filter(value: number, timestamp: number = performance.now()): number {
    if (this.lastTime === 0) {
      this.lastTime = timestamp;
      return this.xFilter.filter(value, 1.0);
    }

    const dt = Math.max((timestamp - this.lastTime) / 1000.0, 0.001);
    this.lastTime = timestamp;

    const prevX = this.xFilter.filter(value, 1.0);
    const dx = (value - prevX) / dt;
    const edx = this.dxFilter.filter(dx, this.alpha(this.dCutoff, dt));

    const cutoff = this.minCutoff + this.beta * Math.abs(edx);
    return this.xFilter.filter(value, this.alpha(cutoff, dt));
  }

  public reset(): void {
    this.lastTime = 0;
    this.xFilter.reset();
    this.dxFilter.reset();
  }
}

export class HeadPoseFilter {
  private xFilter = new OneEuroFilter(1.2, 0.01);
  private yFilter = new OneEuroFilter(1.2, 0.01);
  private zFilter = new OneEuroFilter(1.0, 0.005);

  public filter(x: number, y: number, z: number, timestamp: number): { x: number; y: number; z: number } {
    return {
      x: this.xFilter.filter(x, timestamp),
      y: this.yFilter.filter(y, timestamp),
      z: this.zFilter.filter(z, timestamp),
    };
  }

  public reset(): void {
    this.xFilter.reset();
    this.yFilter.reset();
    this.zFilter.reset();
  }
}
