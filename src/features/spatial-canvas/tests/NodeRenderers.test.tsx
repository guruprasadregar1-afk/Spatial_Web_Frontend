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
  Html: ({ children }: { children: React.ReactNode }) => <div data-testid="drei-html">{children}</div>,
}));

import { NodeRendererDispatcher } from '../components/renderers/NodeRendererDispatcher';
import { SpatialNode } from '@/types/spatial';

describe('Frontend Sprint 17 — 3D Spatial Node Renderers', () => {
  const mockNode: SpatialNode = {
    id: 'test-card-1',
    type: 'card',
    parentId: 'root-1',
    content: {
      title: 'Sample Card Node',
      body: 'Testing card node rendering',
    },
    transform: {
      position: [5, 2, -5],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    },
    relations: [],
    interaction: {
      selectable: true,
      expandable: true,
      hoverable: true,
    },
    render: {
      color: '#7000ff',
    },
  };

  it('NodeRendererDispatcher should dispatch CardNodeRenderer for card node type', () => {
    render(
      <NodeRendererDispatcher
        node={mockNode}
        isSelected={false}
        isHovered={false}
        onSelect={vi.fn()}
        onHover={vi.fn()}
      />
    );

    expect(screen.getByText('Sample Card Node')).toBeDefined();
  });
});
