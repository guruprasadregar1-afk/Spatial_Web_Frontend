'use client';

import React from 'react';
import { Activity, Camera, Eye, Cpu } from 'lucide-react';
import { NormalizedHeadPose } from '../spatial/coordinate-system/CoordinateSystem';
import { WebcamStatus } from '../vision/webcam/WebcamService';

interface DebugPanelProps {
  webcamStatus: WebcamStatus;
  headPose: NormalizedHeadPose;
  fps: number;
  latencyMs: number;
  trackingMode: 'mouse' | 'webcam' | 'mock';
}

export const DebugPanel: React.FC<DebugPanelProps> = ({
  webcamStatus,
  headPose,
  fps,
  latencyMs,
  trackingMode,
}) => {
  return (
    <aside className="absolute bottom-6 right-6 w-80 glass-panel p-4 rounded-2xl border border-spatial-border/40 shadow-2xl z-40 flex flex-col gap-3 font-mono text-xs text-gray-200">
      <div className="flex items-center justify-between pb-2 border-b border-gray-800">
        <span className="font-bold text-white flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400" /> SPATIAL TRACKING DEBUG
        </span>
        <span className="text-[10px] text-cyan-300 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-500/30">
          {trackingMode.toUpperCase()}
        </span>
      </div>

      {/* Realtime Metrics Grid */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="p-2 rounded bg-black/40 border border-gray-800">
          <span className="text-gray-500 text-[10px] block">WEBCAM STATE</span>
          <span className="text-cyan-300 font-bold capitalize truncate block">{webcamStatus}</span>
        </div>

        <div className="p-2 rounded bg-black/40 border border-gray-800">
          <span className="text-gray-500 text-[10px] block">FACE CONFIDENCE</span>
          <span className="text-emerald-400 font-bold block">
            {(headPose.confidence * 100).toFixed(0)}%
          </span>
        </div>

        <div className="p-2 rounded bg-black/40 border border-gray-800">
          <span className="text-gray-500 text-[10px] block">RENDER FPS</span>
          <span className="text-purple-300 font-bold block">{fps} FPS</span>
        </div>

        <div className="p-2 rounded bg-black/40 border border-gray-800">
          <span className="text-gray-500 text-[10px] block">LATENCY</span>
          <span className="text-amber-400 font-bold block">{latencyMs.toFixed(1)} ms</span>
        </div>
      </div>

      {/* Head Pose Coordinates Readout */}
      <div className="p-2.5 rounded-xl bg-gray-950 border border-spatial-border/30 flex flex-col gap-1 text-[11px]">
        <div className="flex justify-between text-gray-400 border-b border-gray-800 pb-1 font-bold">
          <span>HEAD DISPLACEMENT</span>
          <span className="text-cyan-300">[X, Y, Z]</span>
        </div>
        <div className="flex justify-between text-cyan-200">
          <span>X (Left/Right):</span>
          <span className="font-bold">{headPose.x.toFixed(3)}</span>
        </div>
        <div className="flex justify-between text-cyan-200">
          <span>Y (Up/Down):</span>
          <span className="font-bold">{headPose.y.toFixed(3)}</span>
        </div>
        <div className="flex justify-between text-cyan-200">
          <span>Z (Distance):</span>
          <span className="font-bold">{headPose.z.toFixed(3)}</span>
        </div>
      </div>

      {/* Head Angles Readout */}
      <div className="p-2.5 rounded-xl bg-gray-950 border border-spatial-border/30 flex flex-col gap-1 text-[11px]">
        <div className="flex justify-between text-gray-400 border-b border-gray-800 pb-1 font-bold">
          <span>ANGULAR ORIENTATION</span>
          <span className="text-purple-300">[Y, P, R]</span>
        </div>
        <div className="flex justify-between text-purple-200">
          <span>Yaw / Pitch / Roll:</span>
          <span className="font-bold">
            {headPose.yaw.toFixed(2)} | {headPose.pitch.toFixed(2)} | {headPose.roll.toFixed(2)}
          </span>
        </div>
      </div>
    </aside>
  );
};
