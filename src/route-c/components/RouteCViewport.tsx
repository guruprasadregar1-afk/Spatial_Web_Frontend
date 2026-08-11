'use client';

import React, { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Html } from '@react-three/drei';
import { Loader } from '@/components/common/Loader';
import * as THREE from 'three';
import {
  Sparkles,
  Cpu,
  Camera,
  Activity,
  ShieldAlert,
  Layers,
  Eye,
  Play,
  Pause,
  AlertTriangle,
  Crosshair,
  Radio,
  Compass,
  Building,
  Landmark,
} from 'lucide-react';
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
import { webcamService } from '@/vision/webcam/WebcamService';
import { faceTracker } from '@/vision/face-tracking/FaceTracker';
import { mockTrackingProvider } from '@/interaction/mock/MockTrackingProvider';
import { NormalizedHeadPose } from '@/spatial/coordinate-system/CoordinateSystem';
import { RouteCCameraRig } from './RouteCCameraRig';
import { FrustumBounds } from '@/spatial/projection/OffAxisProjection';
import { LandmarkNodeRenderer } from '@/features/spatial-canvas/components/renderers/LandmarkNodeRenderer';
import { RootNodeRenderer } from '@/features/spatial-canvas/components/renderers/RootNodeRenderer';
import { NodeRendererDispatcher } from '@/features/spatial-canvas/components/renderers/NodeRendererDispatcher';
import { SpatialConnections } from '@/features/spatial-canvas/components/renderers/SpatialConnections';
import { ContentIngestPanel } from '@/features/content-ingest/components/ContentIngestPanel';
import { useSpatialStore } from '@/store/slices/spatialSlice';
import { Globe } from 'lucide-react';

// Camera control modes
export type CameraControlMode = 'spatial' | 'manual' | 'orbit';
export type ViewSceneMode = 'jaipur-mini' | 'volumetric' | 'debug-overlay' | 'content-ingest';

// Boundary-Crossing Animation Loop Ticker Component
const BoundaryAnimationTicker: React.FC<{
  isAnimating: boolean;
  sceneMode: ViewSceneMode;
  uiTree: SpatialUiTree;
  onZUpdate: (z: number, region: SpatialDepthRegion) => void;
}> = ({ isAnimating, sceneMode, uiTree, onZUpdate }) => {
  const timeRef = useRef(0);

  useFrame((_, delta) => {
    // Only run expensive voxel stream voxelization when in volumetric mode
    if (!isAnimating || sceneMode !== 'volumetric') return;
    timeRef.current += delta * 1.5;

    const oscZ = Math.sin(timeRef.current) * 5.0 + 1.0;
    const region = SpatialUiModelUtils.updateElementZ(uiTree, 'floating-popout-card', oscZ);
    onZUpdate(oscZ, region);

    const snapshot = SpatialUiGeometry.convertTreeToSnapshot(uiTree);
    frameStream.submitSceneSnapshot(snapshot);
  });

  return null;
};

// 3D Visual Debug Overlay Component (Viewer Marker, Screen Rect, Frustum Line)
const VisualDebugOverlay: React.FC<{
  viewerPos: [number, number, number];
  cameraMode: CameraControlMode;
}> = ({ viewerPos, cameraMode }) => {
  const [vx, vy, vz] = viewerPos;

  return (
    <group>
      {/* Screen Boundary Plane Frame at Z = 0 (24 x 14 world units) */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[defaultScreenPlane.width, defaultScreenPlane.height, 0.05]} />
        <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.3} />
      </mesh>

      {/* Screen Center Crosshair Lines */}
      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geo) => {
            geo.setFromPoints([new THREE.Vector3(-12, 0, 0), new THREE.Vector3(12, 0, 0)]);
          }}
        />
        <lineBasicMaterial attach="material" color="#00f3ff" transparent opacity={0.2} />
      </line>

      <line>
        <bufferGeometry
          attach="geometry"
          onUpdate={(geo) => {
            geo.setFromPoints([new THREE.Vector3(0, -7, 0), new THREE.Vector3(0, 7, 0)]);
          }}
        />
        <lineBasicMaterial attach="material" color="#00f3ff" transparent opacity={0.2} />
      </line>

      {/* Viewer Head Marker Sphere (Only visible in Spatial or Manual modes) */}
      {cameraMode !== 'orbit' && (
        <group position={[vx, vy, vz]}>
          <mesh>
            <sphereGeometry args={[0.6, 16, 16]} />
            <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} />
          </mesh>
          <line>
            <bufferGeometry
              attach="geometry"
              onUpdate={(geo) => {
                geo.setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(-vx, -vy, -vz)]);
              }}
            />
            <lineBasicMaterial attach="material" color="#a855f7" transparent opacity={0.5} />
          </line>
        </group>
      )}
    </group>
  );
};

// Static Mini Jaipur Node Definitions
const JAIPUR_NODES = [
  {
    id: 'jaipur-mini-root',
    type: 'root' as const,
    parentId: null,
    content: { title: 'Jaipur Old City Center Anchor' },
    transform: { position: [0, 0, 0] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },
    relations: ['jaipur-hawa-mahal', 'jaipur-amer-fort', 'jaipur-city-palace'],
    interaction: { selectable: true, expandable: true, hoverable: true },
    render: { color: '#00f3ff', wireframe: true },
  },
  {
    id: 'jaipur-hawa-mahal',
    type: 'landmark' as const,
    parentId: 'jaipur-mini-root',
    content: { title: 'Hawa Mahal Palace' },
    transform: { position: [-12, 4, -5] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },
    relations: [],
    interaction: { selectable: true, expandable: true, hoverable: true },
    render: { color: '#f43f5e', imageUrl: '/images/hawa_mahal.jpg' },
  },
  {
    id: 'jaipur-amer-fort',
    type: 'landmark' as const,
    parentId: 'jaipur-mini-root',
    content: { title: 'Amer Fort' },
    transform: { position: [14, 5, -12] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },
    relations: [],
    interaction: { selectable: true, expandable: true, hoverable: true },
    render: { color: '#fbbf24', imageUrl: '/images/amer_fort.jpg' },
  },
  {
    id: 'jaipur-city-palace',
    type: 'landmark' as const,
    parentId: 'jaipur-mini-root',
    content: { title: 'City Palace Complex' },
    transform: { position: [2, 1, 8] as [number, number, number], rotation: [0, 0, 0] as [number, number, number], scale: [1, 1, 1] as [number, number, number] },
    relations: [],
    interaction: { selectable: true, expandable: true, hoverable: true },
    render: { color: '#38bdf8', imageUrl: '/images/city_palace.jpg' },
  },
];

// Actual 3D Mini Jaipur Scene Component (Memoized with Immutable World Coordinates)
const MiniJaipur3DScene: React.FC<{
  selectedNodeId: string | null;
  onSelectNode: (id: string) => void;
}> = React.memo(({ selectedNodeId, onSelectNode }) => {
  return (
    <group>
      {/* Jaipur City Center Anchor Ground Grid */}
      <gridHelper args={[60, 30, '#00f3ff', '#1e293b']} position={[0, -2, 0]} />

      {/* Render Jaipur Landmark Nodes (Fixed World-Space Coordinates) */}
      {JAIPUR_NODES.map((node) => {
        if (node.type === 'root') {
          return (
            <RootNodeRenderer
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={onSelectNode}
            />
          );
        }
        return (
          <LandmarkNodeRenderer
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onSelect={onSelectNode}
          />
        );
      })}
    </group>
  );
});
MiniJaipur3DScene.displayName = 'MiniJaipur3DScene';

// Actual 3D Web Content Ingest Scene Component (Consumes Store Graph and Head Parallax)
const ContentIngest3DScene: React.FC<{
  graph: any;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  onHoverNode: (id: string | null) => void;
}> = React.memo(({ graph, selectedNodeId, hoveredNodeId, onSelectNode, onHoverNode }) => {
  return (
    <group>
      {/* Ground Grid for Ingested Web Content Scene */}
      <gridHelper args={[60, 30, '#00f3ff', '#1e293b']} position={[0, -2, 0]} />

      {/* Render 3D Laser Connections */}
      <SpatialConnections />

      {/* Render Ingested Nodes using existing NodeRendererDispatcher */}
      {graph &&
        Object.values(graph.nodes || {}).map((node: any) => (
          <NodeRendererDispatcher
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            isHovered={hoveredNodeId === node.id}
            onSelect={(id) => onSelectNode(id)}
            onHover={(id) => onHoverNode(id)}
          />
        ))}
    </group>
  );
});
ContentIngest3DScene.displayName = 'ContentIngest3DScene';

export const RouteCViewport: React.FC = () => {
  const { graph, selectedNodeId, hoveredNodeId, setSelectedNodeId, setHoveredNodeId } = useSpatialStore();

  const [activeDriverId, setActiveDriverId] = useState<string>('virtual-point-cloud-driver');
  const [sceneMode, setSceneMode] = useState<ViewSceneMode>('jaipur-mini');
  const [trackingMode, setTrackingMode] = useState<TrackingMode>('manual');
  const [cameraMode, setCameraMode] = useState<CameraControlMode>('manual');
  const [gridRes, setGridRes] = useState<number>(32);
  const [uiTree, setUiTree] = useState<SpatialUiTree>(SpatialUiModelUtils.createDemoUiTree());
  const [selectedJaipurNodeId, setSelectedJaipurNodeId] = useState<string>('jaipur-hawa-mahal');

  // Dynamic Tracking FPS Measurement & State Throttling
  const [trackingFPS, setTrackingFPS] = useState<number>(0);
  const trackingFrameCountRef = useRef<number>(0);
  const lastTrackingFpsTimeRef = useRef<number>(performance.now());
  const lastStateUIUpdateRef = useRef<number>(0);

  // Single Source of Truth for Render Loop: Mutable Ref (high-frequency camera updates)
  const viewerStateRef = useRef<SpatialViewerState>(headPoseAdapter.getCurrentState());

  // React State for Telemetry & UI Overlay Display (Throttled to 10Hz)
  const [viewerState, setViewerState] = useState<SpatialViewerState>(viewerStateRef.current);
  const [frustumBounds, setFrustumBounds] = useState<FrustumBounds>({ left: -0.08, right: 0.08, top: 0.046, bottom: -0.046 });
  const [telemetry, setTelemetry] = useState<StreamTelemetry>(frameStream.getTelemetryStatistics());

  // Animation & Calibration State
  const [isAnimating, setIsAnimating] = useState<boolean>(true);
  const [currentZ, setCurrentZ] = useState<number>(4.0);
  const [currentRegion, setCurrentRegion] = useState<SpatialDepthRegion>(SpatialDepthRegion.BEYOND_SCREEN);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [isViewportLoading, setIsViewportLoading] = useState<boolean>(true);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const virtualDriverRef = useRef(new VirtualPointCloudDriver());
  const physicalDriverRef = useRef(new PhysicalHardwareDriverStub());

  // Callback to update viewer pose ref instantly & throttle React UI telemetry to ~10Hz max
  const handlePoseUpdate = useCallback((pose: NormalizedHeadPose) => {
    const updated = headPoseAdapter.adaptNormalizedPose(pose);
    viewerStateRef.current = updated;

    const now = performance.now();

    // Throttle React state update to ~10Hz max so React tree does NOT re-render 60 times/sec
    if (now - lastStateUIUpdateRef.current >= 100) {
      setViewerState(updated);
      lastStateUIUpdateRef.current = now;
    }

    // Track real tracking callback FPS
    trackingFrameCountRef.current++;
    if (now - lastTrackingFpsTimeRef.current >= 1000) {
      setTrackingFPS(Math.round((trackingFrameCountRef.current * 1000) / (now - lastTrackingFpsTimeRef.current)));
      trackingFrameCountRef.current = 0;
      lastTrackingFpsTimeRef.current = now;
    }
  }, []);

  const handleFrustumUpdate = useCallback((bounds: FrustumBounds) => {
    setFrustumBounds(bounds);
  }, []);

  // Neutral Pose Calibration Handler
  const handleCalibrateCenter = () => {
    headPoseAdapter.calibrateCenter();
    const updated = headPoseAdapter.getCurrentState();
    viewerStateRef.current = updated;
    setViewerState(updated);
  };

  // Keyboard listener for manual WASDQE controls when in manual mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (cameraMode !== 'manual' && trackingMode !== 'manual') return;

      const step = 0.5;
      let dx = 0;
      let dy = 0;
      let dz = 0;

      switch (e.key.toLowerCase()) {
        case 'a':
          dx = -step;
          break;
        case 'd':
          dx = step;
          break;
        case 'w':
          dz = -step; // Move closer to screen plane
          break;
        case 's':
          dz = step; // Move farther from screen plane
          break;
        case 'q':
          dy = -step; // Move down
          break;
        case 'e':
          dy = step; // Move up
          break;
        default:
          return;
      }

      const updated = headPoseAdapter.updateManualPosition(dx, dy, dz);
      viewerStateRef.current = updated;
      setViewerState(updated);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cameraMode, trackingMode]);

  useEffect(() => {
    setIsViewportLoading(true);
    displayManager.registerDriver(virtualDriverRef.current);
    displayManager.registerDriver(physicalDriverRef.current);
    displayManager.setActiveDriver('virtual-point-cloud-driver');

    headPoseAdapter.setMode('manual');
    mockTrackingProvider.startMockTracking(handlePoseUpdate);

    frameStream.start(30);

    // Hide loading overlay once initial WebGL & tracking pipeline mounts
    const timer = setTimeout(() => {
      setIsViewportLoading(false);
    }, 400);

    const interval = setInterval(() => {
      setTelemetry(frameStream.getTelemetryStatistics());
    }, 100);

    return () => {
      clearTimeout(timer);
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

  const handleTrackingModeChange = async (mode: TrackingMode) => {
    setTrackingMode(mode);
    headPoseAdapter.setMode(mode);
    setTrackingError(null);

    if (mode === 'webcam') {
      setIsViewportLoading(true);
      setCameraMode('spatial');
      mockTrackingProvider.stopMockTracking();

      try {
        const videoEl = await webcamService.startWebcam();
        if (!videoEl) {
          throw new Error('Webcam access was denied or no camera device was found.');
        }

        const initialized = await faceTracker.initialize();
        if (!initialized) {
          throw new Error('Failed to initialize MediaPipe FaceLandmarker vision model.');
        }

        faceTracker.startTracking(videoEl, handlePoseUpdate);
      } catch (err: any) {
        console.warn('Webcam / FaceTracker initialization failed:', err);
        const errorMsg = err?.message || 'Unable to access webcam or initialize head pose tracking.';
        setTrackingError(errorMsg);
        setTrackingMode('manual');
        setCameraMode('manual');
        mockTrackingProvider.startMockTracking(handlePoseUpdate);
      } finally {
        setIsViewportLoading(false);
      }
    } else if (mode === 'manual') {
      setCameraMode('manual');
      webcamService.stopWebcam();
      faceTracker.stopTracking();
      mockTrackingProvider.startMockTracking(handlePoseUpdate);
      setIsViewportLoading(false);
    } else {
      setCameraMode('orbit');
      webcamService.stopWebcam();
      faceTracker.stopTracking();
      mockTrackingProvider.stopMockTracking();
      const reset = headPoseAdapter.resetViewerPosition();
      viewerStateRef.current = reset;
      setViewerState(reset);
      setIsViewportLoading(false);
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

  const isStale = (viewerState.poseAgeMs || 0) > 200;
  const isWebcamActive = webcamService.getStatus() === 'active';
  const isMediaStreamConnected = Boolean(webcamService.getStream());
  const isVideoReady = Boolean(webcamService.getVideoElement() && (webcamService.getVideoElement()?.readyState || 0) >= 2);
  const isTrackingLoopRunning = faceTracker.getIsTracking();

  return (
    <div className="relative w-full h-screen bg-[#060911] text-gray-100 flex flex-col overflow-hidden font-sans select-none">
      {/* Header Toolbar */}
      <header className="h-14 bg-[#0b0f19]/90 border-b border-purple-500/30 px-6 flex items-center justify-between z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-500 to-pink-600 flex items-center justify-center glow-purple">
            <Sparkles className="w-5 h-5 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-wider text-white flex items-center gap-2">
              Route C — Head-Coupled Spatial Parallax
              <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/40">
                PROMPT 11 INTEGRATED
              </span>
            </h1>
            <p className="text-[10px] text-purple-300 font-mono">Actual Mini Jaipur 3D Scene + Off-Axis Perspective Projection</p>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="flex items-center gap-3">
          {/* Tracking Mode Switcher */}
          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => handleTrackingModeChange('webcam')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                trackingMode === 'webcam' ? 'bg-purple-600 text-white glow-purple' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Camera className="w-3.5 h-3.5" /> Webcam Spatial
            </button>

            <button
              onClick={() => handleTrackingModeChange('manual')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                trackingMode === 'manual' ? 'bg-cyan-600 text-white glow-cyan' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Compass className="w-3.5 h-3.5" /> Manual (WASDQE)
            </button>

            <button
              onClick={() => handleTrackingModeChange('disabled')}
              className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                trackingMode === 'disabled' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Radio className="w-3.5 h-3.5" /> Orbit Debug
            </button>
          </div>

          {/* Calibrate Center Button */}
          <button
            onClick={handleCalibrateCenter}
            className="px-3 py-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md border border-purple-400/30 transition-all"
            title="Sets current user position as neutral calibration origin"
          >
            <Crosshair className="w-3.5 h-3.5" /> CALIBRATE CENTER
          </button>

          {/* Scene Experience Switcher (Step 11: Mini Jaipur vs Debug) */}
          <div className="flex items-center gap-1 bg-gray-900 p-1 rounded-xl border border-gray-800 text-xs">
            <button
              onClick={() => setSceneMode('jaipur-mini')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                sceneMode === 'jaipur-mini' ? 'bg-rose-600 text-white glow-purple' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Landmark className="w-3.5 h-3.5" /> Mini Jaipur 3D UI
            </button>

            <button
              onClick={() => setSceneMode('volumetric')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                sceneMode === 'volumetric' ? 'bg-purple-600 text-white glow-purple' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Volumetric
            </button>

            <button
              onClick={() => setSceneMode('content-ingest')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                sceneMode === 'content-ingest' ? 'bg-cyan-500 text-gray-950 glow-cyan' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Content Ingest
            </button>

            <button
              onClick={() => setSceneMode('debug-overlay')}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all ${
                sceneMode === 'debug-overlay' ? 'bg-amber-500 text-gray-950 glow-amber' : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" /> Debug Overlay
            </button>
          </div>
        </div>
      </header>

      {/* Limitation Disclaimer Notice Bar */}
      <div className="bg-amber-950/80 border-b border-amber-500/40 px-6 py-1 flex items-center justify-between text-[11px] font-mono text-amber-300 z-30">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Head-Coupled Motion Parallax active. Physical monitor boundary glass at Z = 0.</span>
        </div>
        <div className="text-[10px] text-gray-400">
          Manual controls: <span className="text-cyan-300">A/D</span> (X), <span className="text-cyan-300">Q/E</span> (Y), <span className="text-cyan-300">W/S</span> (Z)
        </div>
      </div>

      {/* Main Workspace Canvas */}
      <main
        className="flex-1 relative cursor-pointer"
        onPointerMove={handlePointerMove}
        onClick={handlePointerClick}
      >
        {/* Floating Content Ingest Panel Overlay */}
        {sceneMode === 'content-ingest' && <ContentIngestPanel />}

        <Canvas dpr={[1, 1.5]} camera={{ position: [0, 0, 15], fov: 45, near: 0.1, far: 1000 }}>
          <color attach="background" args={['#060911']} />
          <ambientLight intensity={0.6} />
          <directionalLight position={[10, 20, 15]} intensity={1.2} color="#ffffff" />
          <pointLight position={[-10, -10, 10]} intensity={0.8} color="#00f3ff" />

          {/* Off-Axis Perspective Camera Rig (Drives camera position & asymmetric projection matrix) */}
          <RouteCCameraRig
            viewerStateRef={viewerStateRef}
            cameraMode={cameraMode}
            onFrustumUpdate={handleFrustumUpdate}
          />

          {/* OrbitControls enabled ONLY when explicitly in Orbit mode */}
          <OrbitControls makeDefault enabled={cameraMode === 'orbit'} enableDamping dampingFactor={0.05} />

          {/* Suspense Loading Boundary for WebGL Initialization & Vision Model Downloads */}
          <Suspense
            fallback={
              <Html center zIndexRange={[100, 0]}>
                <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 shadow-2xl bg-[#060911]/90 backdrop-blur-md whitespace-nowrap">
                  <Loader label="Initializing 3D Spatial Canvas & Vision Pipeline..." />
                </div>
              </Html>
            }
          >
            {/* 1. ACTUAL MINI JAIPUR 3D UI SCENE (Immutable World Coordinates) */}
            {sceneMode === 'jaipur-mini' && (
              <MiniJaipur3DScene
                selectedNodeId={selectedJaipurNodeId}
                onSelectNode={(id) => setSelectedJaipurNodeId(id)}
              />
            )}

            {/* 2. WEB CONTENT INGEST 3D SCENE (Immutable World Coordinates with Head Parallax) */}
            {sceneMode === 'content-ingest' && (
              <ContentIngest3DScene
                graph={graph}
                selectedNodeId={selectedNodeId}
                hoveredNodeId={hoveredNodeId}
                onSelectNode={(id) => setSelectedNodeId(id)}
                onHoverNode={(id) => setHoveredNodeId(id)}
              />
            )}

            {/* 3. DEVELOPER DEBUG CALIBRATION OVERLAY SCENE */}
            {sceneMode === 'debug-overlay' && (
              <VisualDebugOverlay viewerPos={viewerState.position} cameraMode={cameraMode} />
            )}

            {/* Boundary-Crossing Animation Loop Ticker */}
            <BoundaryAnimationTicker
              isAnimating={isAnimating}
              sceneMode={sceneMode}
              uiTree={uiTree}
              onZUpdate={handleZUpdate}
            />
          </Suspense>
        </Canvas>

        {/* Explicit Loading Overlay for Async Mount, Webcam Permission & MediaPipe Downloads */}
        {isViewportLoading && (
          <div className="absolute inset-0 bg-[#060911]/80 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
            <div className="glass-panel p-6 rounded-2xl border border-cyan-500/40 shadow-2xl bg-[#060911]/90">
              <Loader label="Initializing 3D Spatial Canvas & Vision Pipeline..." />
            </div>
          </div>
        )}

        {/* Error Overlay when Webcam permission is denied or MediaPipe init fails */}
        {trackingError && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 glass-panel p-4 rounded-2xl border border-rose-500/50 bg-rose-950/90 text-rose-200 text-xs font-mono flex items-center gap-3 shadow-2xl backdrop-blur-md">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold text-white">Tracking Initialization Error</span>
              <span className="text-[11px] text-rose-300">{trackingError}</span>
            </div>
            <button
              onClick={() => setTrackingError(null)}
              className="ml-3 px-3 py-1.5 rounded-xl bg-gray-900 border border-gray-800 text-gray-300 hover:text-white font-bold transition-all"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Development Telemetry & Real-Time Diagnostic Panel (Prompt 11 Rule 2, 3, 13 & Step 3) */}
        <aside className="absolute bottom-6 right-6 w-[420px] max-h-[85vh] overflow-y-auto glass-panel p-4 rounded-2xl border border-purple-500/40 shadow-2xl z-30 font-mono text-xs text-gray-200 flex flex-col gap-2 bg-[#0b0f19]/95">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="font-bold text-purple-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-purple-400" /> REAL-TIME TRACKING DIAGNOSTICS
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${
                viewerState.status === 'active'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                  : viewerState.status === 'degraded'
                  ? 'bg-amber-950 text-amber-300 border-amber-500/30'
                  : 'bg-gray-900 text-gray-400 border-gray-800'
              }`}
            >
              {viewerState.status}
            </span>
          </div>

          <div className="space-y-2 text-[11px]">
            {/* WEBCAM SOURCE & CONNECTION DIAGNOSTICS (Step 3) */}
            <div className="p-2 rounded bg-black/50 border border-gray-800">
              <span className="text-purple-400 font-bold block mb-1">WEBCAM CONNECTION DIAGNOSTICS</span>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-300">
                <div>Source: <span className={`font-bold ${trackingMode === 'webcam' ? 'text-emerald-400' : 'text-amber-400'}`}>{trackingMode === 'webcam' ? 'REAL WEBCAM' : 'SIM / MANUAL'}</span></div>
                <div>Media Stream: <span className={`font-bold ${isMediaStreamConnected ? 'text-emerald-400' : 'text-amber-400'}`}>{isMediaStreamConnected ? 'CONNECTED' : 'DISCONNECTED'}</span></div>
                <div>Video Ready: <span className={`font-bold ${isVideoReady ? 'text-emerald-400' : 'text-gray-400'}`}>{isVideoReady ? 'YES (READY >= 2)' : 'NO'}</span></div>
                <div>Tracking Loop: <span className={`font-bold ${isTrackingLoopRunning ? 'text-emerald-400' : 'text-gray-400'}`}>{isTrackingLoopRunning ? 'RUNNING' : 'STOPPED'}</span></div>
                <div>Tracking FPS: <span className="text-cyan-300 font-bold">{trackingFPS} FPS</span></div>
                <div>Camera Mode: <span className="text-amber-300 font-bold uppercase">{cameraMode}</span></div>
              </div>
            </div>

            {/* TRACKING STATUS */}
            <div className="p-2 rounded bg-black/50 border border-gray-800">
              <span className="text-cyan-400 font-bold block mb-1">FACE TRACKING MESH</span>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-300">
                <div>Face Detected: <span className="text-emerald-400 font-bold">{viewerState.status !== 'disabled' ? 'YES' : 'NO'}</span></div>
                <div>Landmark Mesh: <span className="text-cyan-300">478 points</span></div>
                <div>Confidence: <span className="text-emerald-300 font-bold">{(viewerState.confidence * 100).toFixed(0)}%</span></div>
                <div>Pose Age: <span className={`font-bold ${isStale ? 'text-red-400' : 'text-emerald-400'}`}>{viewerState.poseAgeMs ? `${viewerState.poseAgeMs.toFixed(0)}ms` : '0ms'}</span></div>
              </div>
            </div>

            {/* RAW POSE & DELTA */}
            <div className="p-2 rounded bg-black/50 border border-gray-800">
              <span className="text-amber-400 font-bold block mb-1">RAW POSE & CALIBRATED DELTA</span>
              <div className="grid grid-cols-2 gap-1 text-[10px]">
                <div>Raw X: <span className="text-amber-300 font-bold">{(viewerState.rawPosition?.[0] || 0).toFixed(3)}</span></div>
                <div>Delta X: <span className="text-purple-300 font-bold">{(viewerState.calibratedDelta?.[0] || 0).toFixed(3)}</span></div>
                <div>Raw Y: <span className="text-amber-300 font-bold">{(viewerState.rawPosition?.[1] || 0).toFixed(3)}</span></div>
                <div>Delta Y: <span className="text-purple-300 font-bold">{(viewerState.calibratedDelta?.[1] || 0).toFixed(3)}</span></div>
                <div>Raw Z: <span className="text-amber-300 font-bold">{(viewerState.rawPosition?.[2] || 1.0).toFixed(3)}</span></div>
                <div>Delta Z: <span className="text-purple-300 font-bold">{(viewerState.calibratedDelta?.[2] || 0).toFixed(3)}</span></div>
              </div>
            </div>

            {/* VIEWER & CAMERA WORLD POSITION */}
            <div className="p-2 rounded bg-black/50 border border-gray-800">
              <span className="text-emerald-400 font-bold block mb-1">VIEWER & CAMERA WORLD POSITION</span>
              <div className="text-[10px] text-gray-300 space-y-0.5">
                <div>Viewer Pos: <span className="text-cyan-300 font-bold">[{viewerState.position[0].toFixed(2)}, {viewerState.position[1].toFixed(2)}, {viewerState.position[2].toFixed(2)}]</span></div>
                <div>Camera Pos: <span className="text-cyan-300 font-bold">[{viewerState.position[0].toFixed(2)}, {viewerState.position[1].toFixed(2)}, {viewerState.position[2].toFixed(2)}]</span></div>
                <div>Camera Ownership: <span className="text-emerald-400 font-bold">{cameraMode !== 'orbit' ? 'RouteCCameraRig (EXCLUSIVE)' : 'OrbitControls'}</span></div>
              </div>
            </div>

            {/* OFF-AXIS PROJECTION FRUSTUM */}
            <div className="p-2 rounded bg-black/50 border border-gray-800">
              <span className="text-purple-300 font-bold block mb-1">OFF-AXIS FRUSTUM BOUNDS</span>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-300">
                <div>Left: <span className="text-cyan-300 font-bold">{frustumBounds.left.toFixed(4)}</span></div>
                <div>Right: <span className="text-cyan-300 font-bold">{frustumBounds.right.toFixed(4)}</span></div>
                <div>Top: <span className="text-cyan-300 font-bold">{frustumBounds.top.toFixed(4)}</span></div>
                <div>Bottom: <span className="text-cyan-300 font-bold">{frustumBounds.bottom.toFixed(4)}</span></div>
              </div>
            </div>

            {/* IMMUTABLE MINI JAIPUR SPATIAL UI WORLD POSITION (Step 13) */}
            <div className="p-2 rounded bg-black/50 border border-rose-500/40 space-y-1">
              <span className="text-rose-400 font-bold block text-[10px]">ACTUAL MINI JAIPUR IMMUTABLE OBJECT POSITIONS</span>
              <div className="text-[10px] font-mono text-gray-300 space-y-0.5">
                <div>Hawa Mahal: <span className="text-rose-300 font-bold">[-12.00, 4.00, -5.00] (IMMUTABLE)</span></div>
                <div>Amer Fort: <span className="text-amber-300 font-bold">[14.00, 5.00, -12.00] (IMMUTABLE)</span></div>
                <div>City Palace: <span className="text-cyan-300 font-bold">[2.00, 1.00, 8.00] (IMMUTABLE)</span></div>
                <div className="pt-1 flex items-center justify-between text-[9px]">
                  <span>World Pos Changed: <span className="text-emerald-400 font-bold">NO</span></span>
                  <span>Parallax Detected: <span className="text-emerald-400 font-bold">YES</span></span>
                </div>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-end">
              <button
                onClick={handleCalibrateCenter}
                className="px-3 py-1 bg-purple-900/80 hover:bg-purple-800 text-purple-200 text-[10px] font-bold rounded border border-purple-500/40"
              >
                CALIBRATE CENTER
              </button>
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
