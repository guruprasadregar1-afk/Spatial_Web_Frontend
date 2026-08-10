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

import { ContentIngestShowcase } from '../components/ContentIngestShowcase';

describe('Frontend Sprint 22 — Web Content Ingestion UI Engine', () => {
  it('ContentIngestShowcase should render Web Content Ingestion title and WebGL canvas', () => {
    render(<ContentIngestShowcase />);

    expect(screen.getByText('WEB CONTENT INGESTION')).toBeDefined();
    expect(screen.getByTestId('webgl-canvas')).toBeDefined();
  });
});
