import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SpatialQueryToolbar } from '../components/query/SpatialQueryToolbar';

describe('Frontend Sprint 24 — 3D Spatial Query Engine & Proximity Solver UI', () => {
  it('SpatialQueryToolbar should toggle query solver panel and switch query modes', () => {
    render(<SpatialQueryToolbar />);

    const openBtn = screen.getByText('3D Spatial Query Solver');
    fireEvent.click(openBtn);

    expect(screen.getByText('3D Spatial Query Solvers')).toBeDefined();
    expect(screen.getByText('Execute 3D Spatial Query')).toBeDefined();

    const nearestBtn = screen.getByText('Nearest');
    fireEvent.click(nearestBtn);
    expect(screen.getByText('K-Nearest Neighbors Count')).toBeDefined();
  });
});
