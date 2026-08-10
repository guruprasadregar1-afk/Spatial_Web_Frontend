'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { TrackingControls } from './TrackingControls';
import { DebugPanel } from './DebugPanel';
import { VirtualCameraRig } from '../spatial/camera/VirtualCameraRig';
import { SpatialCityScene } from '../scene/city/SpatialCityScene';
import {
  NormalizedHeadPose,
  CalibrationOffset,
  applyCalibration,
  COORDINATE_SYSTEM,
} from '../spatial/coordinate-system/CoordinateSystem';
import { HeadPoseFilter } from '../vision/tracking-filter/OneEuroFilter';
import { webcamService, WebcamStatus } from '../vision/webcam/WebcamService';
import { faceTracker } from '../vision/face-tracking/FaceTracker';
import { mockTrackingProvider, TrackingPreset } from '../interaction/mock/MockTrackingProvider';

export const SpatialViewport: React.FC = () => {
  const [trackingMode, setTrackingMode] = useState<'mouse' | 'webcam' | 'mock'>('mouse');
  const [webcamStatus, setWebcamStatus] = useState<WebcamStatus>('unavailable');
  const [quality, setQuality] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [popOutBoost, setPopOutBoost] = useState<number>(2.0);

  const [rawPose, setRawPose] = useState<NormalizedHeadPose>({
    x: 0,
    y: 0,
    z: 1.0,
    yaw: 0,
    pitch: 0,
    roll: 0,
    confidence: 1.0,
    timestamp: performance.now(),
  });

  const [calibration, setCalibration] = useState<CalibrationOffset>({
    neutralX: 0,
    neutralY: 0,
    neutralZ: 1.0,
  });

  const [fps, setFps] = useState(60);
  const [latencyMs, setLatencyMs] = useState(8.5);

  const poseFilterRef = useRef(new HeadPoseFilter());
  const frameCountRef = useRef(0);
  const lastFpsCheckRef = useRef(performance.now());

  // Head pose update handler
  const handlePoseUpdate = useCallback(
    (newPose: NormalizedHeadPose) => {
      const now = performance.now();
      const filtered = poseFilterRef.current.filter(newPose.x, newPose.y, newPose.z, now);
      const calibrated = applyCalibration(
        { ...newPose, x: filtered.x, y: filtered.y, z: filtered.z },
        calibration
      );

      setRawPose(calibrated);
      setLatencyMs(now - newPose.timestamp);

      frameCountRef.current++;
      if (now - lastFpsCheckRef.current >= 1000) {
        setFps(Math.round((frameCountRef.current * 1000) / (now - lastFpsCheckRef.current)));
        frameCountRef.current = 0;
        lastFpsCheckRef.current = now;
      }
    },
    [calibration]
  );

  // Switch tracking mode handler
  const handleModeChange = async (mode: 'mouse' | 'webcam' | 'mock') => {
    setTrackingMode(mode);

    if (mode === 'webcam') {
      mockTrackingProvider.stopMockTracking();
      const videoEl = await webcamService.startWebcam();
      setWebcamStatus(webcamService.getStatus());

      if (videoEl) {
        const initialized = await faceTracker.initialize();
        if (initialized) {
          faceTracker.startTracking(videoEl, handlePoseUpdate);
        } else {
          console.warn('FaceTracker fallback to mock mode');
          setTrackingMode('mock');
          mockTrackingProvider.startMockTracking(handlePoseUpdate);
        }
      } else {
        setTrackingMode('mock');
        mockTrackingProvider.startMockTracking(handlePoseUpdate);
      }
    } else if (mode === 'mock') {
      webcamService.stopWebcam();
      faceTracker.stopTracking();
      setWebcamStatus('paused');
      mockTrackingProvider.startMockTracking(handlePoseUpdate);
    } else {
      // Mouse mode
      webcamService.stopWebcam();
      faceTracker.stopTracking();
      mockTrackingProvider.stopMockTracking();
      setWebcamStatus('paused');
      setRawPose({ x: 0, y: 0, z: 1.0, yaw: 0, pitch: 0, roll: 0, confidence: 1.0, timestamp: performance.now() });
    }
  };

  // Calibration neutral pose capture
  const handleCalibrate = () => {
    setCalibration({
      neutralX: rawPose.x + calibration.neutralX,
      neutralY: rawPose.y + calibration.neutralY,
      neutralZ: rawPose.z + calibration.neutralZ - 1.0,
    });
    poseFilterRef.current.reset();
  };

  const handleResetCamera = () => {
    setCalibration({ neutralX: 0, neutralY: 0, neutralZ: 1.0 });
    poseFilterRef.current.reset();
    setRawPose({ x: 0, y: 0, z: 1.0, yaw: 0, pitch: 0, roll: 0, confidence: 1.0, timestamp: performance.now() });
  };

  const handlePresetSelect = (preset: TrackingPreset) => {
    if (trackingMode === 'mock') {
      mockTrackingProvider.applyPreset(preset);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      webcamService.stopWebcam();
      faceTracker.stopTracking();
      mockTrackingProvider.stopMockTracking();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-[#080d1a] overflow-hidden select-none font-sans">
      {/* Top Header Control Toolbar */}
      <TrackingControls
        trackingMode={trackingMode}
        webcamStatus={webcamStatus}
        quality={quality}
        popOutBoost={popOutBoost}
        onModeChange={handleModeChange}
        onCalibrate={handleCalibrate}
        onResetCamera={handleResetCamera}
        onQualityChange={setQuality}
        onPopOutBoostChange={setPopOutBoost}
        onPresetSelect={handlePresetSelect}
      />

      {/* Developer Debug Telemetry Panel */}
      <DebugPanel
        webcamStatus={webcamStatus}
        headPose={rawPose}
        fps={fps}
        latencyMs={latencyMs}
        trackingMode={trackingMode}
      />

      {/* 3D WebGL Canvas Viewport */}
      <Canvas
        camera={{
          position: [0, 0, COORDINATE_SYSTEM.DEFAULT_CAMERA_Z],
          fov: 45,
          near: 0.1,
          far: 1000,
        }}
        gl={{ antialias: quality !== 'LOW' }}
        className="w-full h-full"
      >
        <color attach="background" args={['#080d1a']} />

        {/* Ambient & Directional Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 15]} intensity={1.2} castShadow={quality === 'HIGH'} />
        <pointLight position={[-10, -10, 10]} intensity={0.5} color="#00f3ff" />

        {/* Off-Axis Virtual Camera Rig */}
        <VirtualCameraRig headPose={rawPose} trackingMode={trackingMode} popOutBoost={popOutBoost} />

        {/* Mouse Mode Orbit Controls */}
        {trackingMode === 'mouse' && (
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 - 0.05} />
        )}

        {/* 3D Spatial City & Foreground Depth Scene */}
        <SpatialCityScene />
      </Canvas>
    </div>
  );
};
