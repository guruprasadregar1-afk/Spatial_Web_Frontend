import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// Mock Three.js canvas & hooks for JSDOM unit testing environment
vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="webgl-canvas">{children}</div>,
  useThree: () => ({ camera: { position: { lerp: vi.fn() }, lookAt: vi.fn() } }),
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Grid: () => <div data-testid="scene-grid" />,
}));

import { SpatialCanvas } from '../components/SpatialCanvas';

describe('Frontend Sprint 16 — 3D WebGL Canvas Infrastructure', () => {
  it('SpatialCanvas should render WebGL canvas wrapper with overlay metrics', () => {
    render(<SpatialCanvas />);

    expect(screen.getByTestId('webgl-canvas')).toBeDefined();
    expect(screen.getByText(/60 FPS/)).toBeDefined();
    expect(screen.getByText(/Rate Limit/)).toBeDefined();
  });
});
