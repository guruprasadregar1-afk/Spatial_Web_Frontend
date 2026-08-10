import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

vi.mock('@react-three/fiber', () => ({
  Canvas: ({ children }: { children: React.ReactNode }) => <div data-testid="webgl-canvas">{children}</div>,
  useThree: () => ({ camera: { position: { lerp: vi.fn() }, lookAt: vi.fn() } }),
  useFrame: vi.fn(),
}));

vi.mock('@react-three/drei', () => ({
  OrbitControls: () => <div data-testid="orbit-controls" />,
  Grid: () => <div data-testid="scene-grid" />,
  Html: ({ children }: { children: React.ReactNode }) => <div data-testid="drei-html">{children}</div>,
}));

import { JaipurShowcase } from '../components/JaipurShowcase';

describe('Frontend Sprint 20 — Mini Jaipur 3D Interactive Showcase Engine', () => {
  it('JaipurShowcase should render Spatial Web Engine title and WebGL canvas', () => {
    render(<JaipurShowcase />);

    expect(screen.getByText('SPATIAL WEB ENGINE')).toBeDefined();
    expect(screen.getByTestId('webgl-canvas')).toBeDefined();
  });
});
