export type WebcamStatus =
  | 'unavailable'
  | 'required'
  | 'initializing'
  | 'active'
  | 'paused'
  | 'error';

export class WebcamService {
  private stream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private status: WebcamStatus = 'unavailable';

  public async startWebcam(): Promise<HTMLVideoElement | null> {
    if (typeof window === 'undefined' || !navigator.mediaDevices) {
      this.status = 'unavailable';
      return null;
    }

    this.status = 'initializing';

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
          facingMode: 'user',
        },
        audio: false,
      });

      if (!this.videoElement) {
        this.videoElement = document.createElement('video');
        this.videoElement.setAttribute('autoplay', '');
        this.videoElement.setAttribute('playsinline', '');
        this.videoElement.muted = true;
      }

      this.videoElement.srcObject = this.stream;

      await new Promise<void>((resolve) => {
        if (!this.videoElement) return resolve();
        this.videoElement.onloadedmetadata = () => {
          this.videoElement?.play();
          resolve();
        };
      });

      this.status = 'active';
      return this.videoElement;
    } catch (err: any) {
      console.warn('Webcam initialization failed:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        this.status = 'required';
      } else {
        this.status = 'error';
      }
      this.stopWebcam();
      return null;
    }
  }

  public stopWebcam(): void {
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
    this.status = 'paused';
  }

  public getStatus(): WebcamStatus {
    return this.status;
  }

  public getVideoElement(): HTMLVideoElement | null {
    return this.videoElement;
  }
}

export const webcamService = new WebcamService();
