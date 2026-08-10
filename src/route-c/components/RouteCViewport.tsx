'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { Sparkles, Cpu, Camera, EyeOff, Activity, ShieldAlert, Layers, Eye, Play, Pause, AlertTriangle } from 'lucide-react';
import { displayManager } from '../core/abstraction/DisplayManager';
import { VirtualPointCloudDriver } from '../drivers/virtual/VirtualPointCloudDriver';
import { PhysicalHardwareDriverStub } from '../drivers/physical/PhysicalHardwareDriverStub';
import { frameStream, StreamTelemetry } from '../stream/VolumetricFrameStream';
import { headPoseAdapter } from '../interaction/HeadPoseAdapter';
import { SpatialViewerState, TrackingMode } from '../interaction/SpatialViewerState';
import { SpatialUiModelUtils, SpatialUiTree } from '../ui/SpatialUiModel';
import { SpatialUiGeometry } from '../ui/SpatialUiGeometry';
import { SpatialUiHitTest } from '../ui/SpatialUiHitTest';
import { defaultScreenPlane, SpatialDepthRegion } from '../boundary/ScreenPlane';
import { defaultDisplayBoundary } from '../boundary/DisplayBoundary';
import { webcamService } from '@/vision/webcam/WebcamService';
import { faceTracker } from '@/vision/face-tracking/FaceTracker';
import { mockTrackingProvider } from '@/interaction/mock/MockTrackingProvider';
import { NormalizedHeadPose } from '@/spatial/coordinate-system/CoordinateSystem';

// Boundary-Crossing Animation Loop Ticker Component
const BoundaryAnimationTicker: React.FC<{
  isAnimating: boolean;
  uiTree: SpatialUiTree;
  onZUpdate: (z: number, region: SpatialDepthRegion) => void;
}> = ({ isAnimating, uiTree, onZUpdate }) => {
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    if (!isAnimating) return;
    timeRef.current += delta * 1.5;

    // Continuous smooth Z translation from Z = -4.0 to Z = +6.0
    const oscZ = Math.sin(timeRef.current) * 5.0 + 1.0;
    const region = SpatialUiModelUtils.updateElementZ(uiTree, 'floating-popout-card', oscZ);
    onZUpdate(oscZ, region);

    const snapshot = SpatialUiGeometry.convertTreeToSnapshot(uiTree);
    frameStream.submitSceneSnapshot(snapshot);
  });

  return null;
};

export const RouteCViewport: React.FC = () => {
  const [activeDriverId, setActiveDriverId] = useState<string>('virtual-point-cloud-driver');
  const [renderMode, setRenderMode] = useState<'volumetric' | 'perspective'>('volumetric');
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('manual');
  const [gridRes, setGridRes] = useState<number>(32);
  const [uiTree, setUiTree] = useState<SpatialUiTree>(SpatialUiModelUtils.createDemoUiTree());
  const [viewerState, setViewerState] = useState<SpatialViewerState>(headPoseAdapter.getCurrentState());
  const [telemetry, setTelemetry] = useState<StreamTelemetry>(frameStream.getTelemetryStatistics());

  // Animation & Calibration State
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [currentZ, setCurrentZ] = useState<number>(4.0);
  const [currentRegion, setCurrentRegion] = useState<SpatialDepthRegion>(SpatialDepthRegion.BEYOND_SCREEN);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  const virtualDriverRef = useRef(new VirtualPointCloudDriver());
  const physicalDriverRef = useRef(new PhysicalHardwareDriverStub());

  const handlePoseUpdate = useCallback((pose: NormalizedHeadPose) => {
    const updated = headPoseAdapter.adaptNormalizedPose(pose);
    setViewerState(updated);
  }, []);

  useEffect(() => {
    displayManager.registerDriver(virtualDriverRef.current);
    displayManager.registerDriver(physicalDriverRef.current);
    displayManager.setActiveDriver('virtual-point-cloud-driver');

    headPoseAdapter.setMode('manual');
    mockTrackingProvider.startMockTracking(handlePoseUpdate);

    frameStream.start(30);

    const interval = setInterval(() => {
      setTelemetry(frameStream.getTelemetryStatistics());
    }, 100);

    return () => {
      clearInterval(interval);
      frameStream.stop();
      webcamService.stopWebcam();
      faceTracker.stopTracking();
      mockTrackingProvider.stopMockTracking();
    };
  }, [handlePoseUpdate]);

  const handleDriverChange = async (id: string) => {
    setActiveDriverId(id);
    await displayManager.setActiveDriver(id);
  };

  const handleModeChange = async (mode: TrackingMode) => {
    setTrackingMode(mode);
    headPoseAdapter.setMode(mode);

    if (mode === 'webcam') {
      mockTrackingProvider.stopMockTracking();
      const videoEl = await webcamService.startWebcam();
      if (videoEl) {
        const initialized = await faceTracker.initialize();
        if (initialized) {
          faceTracker.startTracking(videoEl, handlePoseUpdate);
        } else {
          setTrackingMode('manual');
          mockTrackingProvider.startMockTracking(handlePoseUpdate);
        }
      } else {
        setTrackingMode('manual');
        mockTrackingProvider.startMockTracking(handlePoseUpdate);
      }
    } else if (mode === 'manual') {
      webcamService.stopWebcam();
      faceTracker.stopTracking();
      mockTrackingProvider.startMockTracking(handlePoseUpdate);
    } else {
      webcamService.stopWebcam();
      faceTracker.stopTracking();
      mockTrackingProvider.stopMockTracking();
      setViewerState(headPoseAdapter.resetViewerPosition());
    }
  };

  const handleResChange = (res: number) => {
    setGridRes(res);
    frameStream.setResolution([res, res, res]);
  };

  const handleZUpdate = useCallback((z: number, region: SpatialDepthRegion) => {
    setCurrentZ(z);
    setCurrentRegion(region);
  }, []);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const hit = SpatialUiHitTest.testRay(uiTree, {
      origin: [x * 12, y * 8, 15],
      direction: [0, 0, -1],
    });

    const newHoveredId = hit ? hit.id : null;
    setHoveredElementId(newHoveredId);
    SpatialUiHitTest.updateHoverState(uiTree, newHoveredId);
  };

  const handlePointerClick = () => {
    if (hoveredElementId) {
      SpatialUiHitTest.triggerClick(uiTree, hoveredElementId);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#060911] text-gray-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Header Toolbar */}
      <header className="h-14 bg-[#0b0f19]/90 border-b border-purple-500/30 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center glow-purple">
            <Sparkles className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white">
              Virtual Volumetric Display — Software Simulation
            </h1>
            <p className="text-[10px] text-purple-300 font-mono">Screen-Boundary Crossing Spatial UI Prototype</p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-3">
          {/* Dual View Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setRenderMode('volumetric')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                renderMode === 'volumetric' ? 'bg-purple-600 text-white glow-purple' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Volumetric Voxel UI
            </button>

            <button
              onClick={() => setRenderMode('perspective')}
              className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                renderMode === 'perspective' ? 'bg-cyan-500 text-gray-950 glow-cyan' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Perspective UI
            </button>
          </div>

          {/* Animation Play/Pause */}
          <button
            onClick={() => setIsAnimating(!isAnimating)}
            className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all border ${
              isAnimating
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-gray-900 border-gray-800 text-gray-400'
            }`}
          >
            {isAnimating ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isAnimating ? 'Crossing Active' : 'Paused'}
          </button>

          {/* Display Driver Selector */}
          <div className="flex items-center gap-2 bg-gray-900/90 p-1 rounded-xl border border-gray-800">
            <button
              onClick={() => handleDriverChange('virtual-point-cloud-driver')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                activeDriverId === 'virtual-point-cloud-driver'
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Cpu className="w-3 h-3" /> Virtual Sim
            </button>

            <button
              onClick={() => handleDriverChange('physical-hardware-driver-stub')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                activeDriverId === 'physical-hardware-driver-stub'
                  ? 'bg-amber-500 text-gray-950 font-bold'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <ShieldAlert className="w-3 h-3" /> Physical Stub
            </button>
          </div>

          {/* Grid Resolution */}
          <select
            value={gridRes}
            onChange={(e) => handleResChange(parseInt(e.target.value))}
            className="bg-gray-900 border border-gray-800 text-purple-300 font-mono text-xs font-bold rounded-xl px-2.5 py-1 focus:outline-none"
          >
            <option value={16}>16³</option>
            <option value={32}>32³</option>
            <option value={64}>64³</option>
          </select>
        </div>
      </header>

      {/* Limitation Notice Bar */}
      <div className="bg-amber-950/80 border-b border-amber-500/40 px-6 py-1 flex items-center gap-2 text-[11px] font-mono text-amber-300 z-30">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
        <span>Development Simulator: Physical free-space light output is not implemented.</span>
      </div>

      {/* Main Workspace Canvas */}
      <main
        className="flex-1 relative cursor-pointer"
        onPointerMove={handlePointerMove}
        onClick={handlePointerClick}
      >
        <Canvas camera={{ position: [0, 5, 25], fov: 45 }}>
          <color attach="background" args={['#060911']} />
          <ambientLight intensity={0.6} />
          <pointLight position={[10, 20, 15]} intensity={1.5} color="#00f3ff" />
          <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

          {/* 3D Visual Debug Overlay: Screen Boundary Plane Frame at Z = 0 */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[defaultScreenPlane.width, defaultScreenPlane.height, 0.05]} />
            <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.3} />
          </mesh>

          {/* PERSPECTIVE UI RENDERER MODE */}
          {renderMode === 'perspective' && (
            <group>
              {Array.from(uiTree.elements.values()).map((el) => {
                const [px, py, pz] = el.position;
                const actualZ = pz + el.depthOffset;
                const [w, h, d] = el.dimensions;
                const isHovered = el.id === hoveredElementId;

                return (
                  <mesh key={el.id} position={[px, py, actualZ]}>
                    <boxGeometry args={[w, h, d]} />
                    <meshStandardMaterial
                      color={isHovered ? '#00f3ff' : el.color}
                      emissive={isHovered ? '#00f3ff' : el.color}
                      emissiveIntensity={isHovered ? 0.8 : 0.2}
                    />
                  </mesh>
                );
              })}
            </group>
          )}

          {/* Boundary-Crossing Animation Loop Ticker */}
          <BoundaryAnimationTicker
            isAnimating={isAnimating}
            uiTree={uiTree}
            onZUpdate={handleZUpdate}
          />
        </Canvas>

        {/* Development Telemetry & Calibration Panel */}
        <aside className="absolute bottom-6 right-6 w-88 glass-panel p-4 rounded-2xl border border-purple-500/40 shadow-2xl z-30 font-mono text-xs text-gray-200 flex flex-col gap-2.5">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" /> BOUNDARY CROSSING TELEMETRY
            </span>
            <span className="text-[10px] text-amber-300 bg-amber-950 px-1.5 py-0.5 rounded border border-amber-500/30 uppercase">
              {currentRegion}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 rounded bg-black/40 border border-gray-800">
              <span className="text-gray-500 text-[10px] block">SCREEN PLANE Z</span>
              <span className="text-cyan-300 font-bold block">0.00 (Width: 24, Height: 14)</span>
            </div>

            <div className="p-2 rounded bg-black/40 border border-gray-800">
              <span className="text-gray-500 text-[10px] block">OBJECT Z POSITION</span>
              <span className="text-amber-300 font-bold block">{currentZ.toFixed(2)}</span>
            </div>

            <div className="p-2 rounded bg-black/40 border border-gray-800">
              <span className="text-gray-500 text-[10px] block">DIST TO PLANE</span>
              <span className="text-purple-300 font-bold block">
                {defaultScreenPlane.getSignedDistance(currentZ).toFixed(2)}
              </span>
            </div>

            <div className="p-2 rounded bg-black/40 border border-gray-800">
              <span className="text-gray-500 text-[10px] block">VOXEL COUNT</span>
              <span className="text-emerald-400 font-bold block">{telemetry.voxelCount}</span>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
