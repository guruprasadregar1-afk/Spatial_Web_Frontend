'use client';

import React, { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { LightingRig } from './LightingRig';
import { SceneGrid } from './SceneGrid';
import { NodeRendererDispatcher } from './renderers/NodeRendererDispatcher';
import { SpatialConnections } from './renderers/SpatialConnections';
import { CameraControlsToolbar } from './CameraControlsToolbar';
import { NodeInspectorPanel } from './inspector/NodeInspectorPanel';
import { NodeEditorModal } from './inspector/NodeEditorModal';
import { RealTimeStatusPill } from './RealTimeStatusPill';
import { SpatialQueryToolbar } from './query/SpatialQueryToolbar';
import { SceneVersioningToolbar } from './versioning/SceneVersioningToolbar';
import { SecurityTelemetryPill } from './security/SecurityTelemetryPill';
import { ProfilerOverlay } from './performance/ProfilerOverlay';
import { useCameraRig, CameraMode } from '../hooks/useCameraRig';
import { useRealTimeSync } from '../hooks/useRealTimeSync';
import { useSpatialStore } from '@/store/slices/spatialSlice';

interface SpatialCanvasProps {
  children?: React.ReactNode;
}

function CameraRigController({ mode }: { mode: CameraMode }) {
  useCameraRig(mode);
  return null;
}

export const SpatialCanvas: React.FC<SpatialCanvasProps> = ({ children }) => {
  const {
    graph,
    selectedNodeId,
    hoveredNodeId,
    setSelectedNodeId,
    setHoveredNodeId,
    setTargetFocusPosition,
  } = useSpatialStore();

  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Mount real-time SSE stream hook
  const { isConnected, lastSyncTime, broadcastSelection } = useRealTimeSync();

  const handleSelectNode = (id: string | null) => {
    setSelectedNodeId(id);
    broadcastSelection(id);
  };

  const handleResetView = () => {
    handleSelectNode(null);
    setTargetFocusPosition(null);
    setCameraMode('orbit');
  };

  return (
    <div className="w-full h-[calc(100vh-4rem)] relative bg-[#0b0f19] overflow-hidden">
      {/* Camera Rig Mode & Control Toolbar */}
      <CameraControlsToolbar
        cameraMode={cameraMode}
        onModeChange={(mode) => setCameraMode(mode)}
        onResetView={handleResetView}
      />

      {/* Versioning & Snapshot Timeline Toolbar */}
      <SceneVersioningToolbar />

      {/* 3D Spatial Query Solvers Toolbar */}
      <SpatialQueryToolbar />

      {/* 2D Glassmorphic Overlay Node Inspector Panel */}
      <NodeInspectorPanel onEditNode={() => setIsEditorOpen(true)} />

      {/* Node Transform & Content Editor Modal */}
      <NodeEditorModal isOpen={isEditorOpen} onClose={() => setIsEditorOpen(false)} />

      {/* 3D WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 10, 25], fov: 50, near: 0.1, far: 100000 }}
        gl={{ antialias: true, alpha: false }}
        className="w-full h-full"
        onPointerMissed={() => handleSelectNode(null)}
      >
        <color attach="background" args={['#0b0f19']} />
        <LightingRig />
        <SceneGrid />
        <CameraRigController mode={cameraMode} />
        <OrbitControls makeDefault enableDamping dampingFactor={0.05} maxPolarAngle={Math.PI / 2 - 0.05} />

        <Suspense fallback={null}>
          {children}

          {/* Render 3D Laser Connections */}
          <SpatialConnections />

          {/* Render 3D Spatial Nodes */}
          {graph &&
            Object.values(graph.nodes).map((node) => (
              <NodeRendererDispatcher
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                isHovered={hoveredNodeId === node.id}
                onSelect={(id) => handleSelectNode(id)}
                onHover={(id) => setHoveredNodeId(id)}
              />
            ))}
        </Suspense>
      </Canvas>

      {/* Canvas Overlay Controls, Security & Performance Profiler Telemetry */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3">
        <RealTimeStatusPill isConnected={isConnected} lastSyncTime={lastSyncTime} />
        <SecurityTelemetryPill />
        <ProfilerOverlay />
      </div>
    </div>
  );
};
