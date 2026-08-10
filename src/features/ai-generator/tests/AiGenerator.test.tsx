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

import { AiGeneratorShowcase } from '../components/AiGeneratorShowcase';

describe('Frontend Sprint 21 — AI Semantic Generator Interface Page', () => {
  it('AiGeneratorShowcase should render AI Spatial Generator title and WebGL canvas', () => {
    render(<AiGeneratorShowcase />);

    expect(screen.getByText('AI SPATIAL NODE GENERATOR')).toBeDefined();
    expect(screen.getByTestId('webgl-canvas')).toBeDefined();
  });
});
