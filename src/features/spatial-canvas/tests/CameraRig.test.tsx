import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="webgl-canvas">{children}</div>,
  useThree: () => ({ camera: { position: { lerp: vi.fn() }, lookAt: vi.fn() } }),
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Grid: () => <div data-testid="scene-grid" />,
}));

import { CameraControlsToolbar } from '../components/CameraControlsToolbar';

describe('Frontend Sprint 18 — Camera Rig & Interactive Spatial Controls', () => {
  it('CameraControlsToolbar should switch camera modes', () => {
    const onModeChange = vi.fn();
    const onResetView = vi.fn();

    render(
      <CameraControlsToolbar
        cameraMode="orbit"
        onModeChange={onModeChange}
        onResetView={onResetView}
      />
    );

    const focusBtn = screen.getByText('Focus');
    fireEvent.click(focusBtn);
    expect(onModeChange).toHaveBeenCalledWith('focus');

    const topDownBtn = screen.getByText('Top-Down');
    fireEvent.click(topDownBtn);
    expect(onModeChange).toHaveBeenCalledWith('topdown');
  });
});
