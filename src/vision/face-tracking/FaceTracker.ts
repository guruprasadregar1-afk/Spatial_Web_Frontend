import { FilesetResolver, FaceLandmarker } from '@mediapipe/tasks-vision';
import { headPoseEstimator } from '../head-pose/HeadPoseEstimator';
import { NormalizedHeadPose } from '../../spatial/coordinate-system/CoordinateSystem';

export class FaceTracker {
  private landmarker: FaceLandmarker | null = null;
  private isInitializing: boolean = false;
  private isTracking: boolean = false;
  private animationFrameId: number | null = null;

  public async initialize(): Promise<boolean> {
    if (this.landmarker) return true;
    if (this.isInitializing || typeof window === 'undefined') return false;

    this.isInitializing = true;
    try {
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
          delegate: 'GPU',
        },
        outputFaceBlendshapes: false,
        runningMode: 'VIDEO',
        numFaces: 1,
      });

      this.isInitializing = false;
      return true;
    } catch (err) {
      console.warn('MediaPipe FaceLandmarker GPU init failed, falling back to CPU:', err);
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        this.landmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: 'CPU',
          },
          outputFaceBlendshapes: false,
          runningMode: 'VIDEO',
          numFaces: 1,
        });

        this.isInitializing = false;
        return true;
      } catch (cpuErr) {
        console.error('MediaPipe FaceLandmarker initialization failed completely:', cpuErr);
        this.isInitializing = false;
        return false;
      }
    }
  }

  public startTracking(
    videoElement: HTMLVideoElement,
    onPoseUpdate: (pose: NormalizedHeadPose) => void
  ): void {
    if (!this.landmarker || this.isTracking) return;
    this.isTracking = true;

    let lastVideoTime = -1;

    const renderLoop = () => {
      if (!this.isTracking) return;

      if (videoElement.readyState >= 2 && videoElement.currentTime !== lastVideoTime) {
        lastVideoTime = videoElement.currentTime;
        const now = performance.now();

        try {
          const results = this.landmarker?.detectForVideo(videoElement, now);
          if (results && results.faceLandmarks && results.faceLandmarks.length > 0) {
            const landmarks = results.faceLandmarks[0];
            const pose = headPoseEstimator.estimatePose(landmarks, now);
            onPoseUpdate(pose);
          }
        } catch (e) {
          // Ignore transient detection errors
        }
      }

      this.animationFrameId = requestAnimationFrame(renderLoop);
    };

    renderLoop();
  }

  public stopTracking(): void {
    this.isTracking = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }
}

export const faceTracker = new FaceTracker();
