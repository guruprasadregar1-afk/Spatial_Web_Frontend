'use client';

import React from 'react';
import { Camera, Eye, RotateCcw, Compass } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { CameraMode } from '../hooks/useCameraRig';

interface ToolbarProps {
  cameraMode: CameraMode;
  onModeChange: (mode: CameraMode) => void;
  onResetView: () => void;
}

export const CameraControlsToolbar: React.FC<ToolbarProps> = ({
  cameraMode,
  onModeChange,
  onResetView,
}) => {
  return (
    <div className="absolute top-6 right-6 z-30 glass-panel p-2 rounded-xl flex items-center gap-2">
      <Button
        variant={cameraMode === 'orbit' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('orbit')}
        className="flex items-center gap-1.5"
      >
        <Compass className="w-3.5 h-3.5" /> Orbit
      </Button>

      <Button
        variant={cameraMode === 'focus' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('focus')}
        className="flex items-center gap-1.5"
      >
        <Eye className="w-3.5 h-3.5" /> Focus
      </Button>

      <Button
        variant={cameraMode === 'topdown' ? 'primary' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('topdown')}
        className="flex items-center gap-1.5"
      >
        <Camera className="w-3.5 h-3.5" /> Top-Down
      </Button>

      <div className="w-[1px] h-6 bg-spatial-border/40 my-auto mx-1" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onResetView}
        className="text-gray-400 hover:text-white"
        title="Reset Camera View"
      >
        <RotateCcw className="w-3.5 h-3.5" />
      </Button>
    </div>
  );
};
