'use client';

import React from 'react';
import { Camera, MousePointer, Cpu, RotateCcw, Target, Sparkles, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TrackingPreset } from '../interaction/mock/MockTrackingProvider';
import { WebcamStatus } from '../vision/webcam/WebcamService';

interface TrackingControlsProps {
  trackingMode: 'mouse' | 'webcam' | 'mock';
  webcamStatus: WebcamStatus;
  quality: 'LOW' | 'MEDIUM' | 'HIGH';
  popOutBoost: number;
  onModeChange: (mode: 'mouse' | 'webcam' | 'mock') => void;
  onCalibrate: () => void;
  onResetCamera: () => void;
  onQualityChange: (quality: 'LOW' | 'MEDIUM' | 'HIGH') => void;
  onPopOutBoostChange: (boost: number) => void;
  onPresetSelect: (preset: TrackingPreset) => void;
}

export const TrackingControls: React.FC<TrackingControlsProps> = ({
  trackingMode,
  webcamStatus,
  quality,
  popOutBoost,
  onModeChange,
  onCalibrate,
  onResetCamera,
  onQualityChange,
  onPopOutBoostChange,
  onPresetSelect,
}) => {
  return (
    <header className="absolute top-4 left-6 right-6 z-40 flex items-center justify-between glass-panel p-3.5 rounded-2xl border border-spatial-border/40 shadow-2xl">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center glow-cyan">
          <Sparkles className="w-4 h-4 text-gray-950 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wider text-white">SPATIAL WEB VIEWPORT</h1>
          <p className="text-[10px] text-cyan-300 font-mono flex items-center gap-1">
            <Layers className="w-3 h-3 text-amber-400" /> Out-of-Screen Pop-Out Holographic Engine (Z &gt; 0)
          </p>
        </div>
      </div>

      {/* Tracking Mode Selector */}
      <div className="flex items-center gap-2 bg-gray-900/90 p-1 rounded-xl border border-gray-800">
        <button
          type="button"
          onClick={() => onModeChange('mouse')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            trackingMode === 'mouse' ? 'bg-cyan-500 text-gray-950 glow-cyan' : 'text-gray-400 hover:text-white'
          }`}
        >
          <MousePointer className="w-3.5 h-3.5" /> Mouse Mode
        </button>

        <button
          type="button"
          onClick={() => onModeChange('webcam')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            trackingMode === 'webcam' ? 'bg-purple-600 text-white glow-purple' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Camera className="w-3.5 h-3.5" /> Webcam Tracking
        </button>

        <button
          type="button"
          onClick={() => onModeChange('mock')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            trackingMode === 'mock' ? 'bg-amber-500 text-gray-950 glow-purple' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Cpu className="w-3.5 h-3.5" /> Mock Keyboard (WASDQE)
        </button>
      </div>

      {/* Action Buttons & Pop-Out Boost Selector */}
      <div className="flex items-center gap-2">
        {trackingMode === 'mock' && (
          <div className="flex items-center gap-1 bg-gray-900/80 p-1 rounded-lg border border-gray-800 text-[11px] font-mono text-cyan-300">
            <span className="text-gray-400 px-1">Presets:</span>
            <button onClick={() => onPresetSelect('LEFT')} className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-cyan-950">L</button>
            <button onClick={() => onPresetSelect('CENTER')} className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-cyan-950">C</button>
            <button onClick={() => onPresetSelect('RIGHT')} className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-cyan-950">R</button>
            <button onClick={() => onPresetSelect('UP')} className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-cyan-950">U</button>
            <button onClick={() => onPresetSelect('DOWN')} className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-cyan-950">D</button>
            <button onClick={() => onPresetSelect('CLOSE')} className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-cyan-950">Z+</button>
            <button onClick={() => onPresetSelect('FAR')} className="px-1.5 py-0.5 rounded bg-gray-800 hover:bg-cyan-950">Z-</button>
          </div>
        )}

        {/* Pop-Out Effect Intensity Multiplier */}
        <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-500/40 rounded-lg px-2 py-1 text-xs">
          <span className="text-amber-300 font-bold text-[11px]">Pop-Out:</span>
          <select
            value={popOutBoost}
            onChange={(e) => onPopOutBoostChange(parseFloat(e.target.value))}
            className="bg-gray-950 text-amber-300 font-mono text-xs font-bold rounded px-1 focus:outline-none"
          >
            <option value={1.0}>1.0x Normal</option>
            <option value={1.5}>1.5x Medium</option>
            <option value={2.0}>2.0x Strong</option>
            <option value={3.0}>3.0x MAX</option>
          </select>
        </div>

        <Button variant="secondary" size="sm" onClick={onCalibrate} className="text-xs flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-cyan-400" /> Calibrate
        </Button>

        <Button variant="secondary" size="sm" onClick={onResetCamera} className="text-xs flex items-center gap-1.5">
          <RotateCcw className="w-3.5 h-3.5 text-gray-400" /> Reset
        </Button>

        {/* Quality Selector */}
        <select
          value={quality}
          onChange={(e) => onQualityChange(e.target.value as any)}
          className="bg-gray-900 border border-gray-800 rounded-lg px-2.5 py-1 text-xs text-cyan-300 font-mono focus:outline-none"
        >
          <option value="LOW">LOW</option>
          <option value="MEDIUM">MEDIUM</option>
          <option value="HIGH">HIGH</option>
        </select>
      </div>
    </header>
  );
};
