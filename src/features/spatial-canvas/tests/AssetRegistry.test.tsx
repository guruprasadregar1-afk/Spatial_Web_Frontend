import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { AssetRegistryModal } from '../components/assets/AssetRegistryModal';

describe('Frontend Sprint 26 — 3D Asset Registry & GLB Model Browser UI', () => {
  it('AssetRegistryModal should render 3D asset registry title when open', () => {
    const onClose = vi.fn();
    render(<AssetRegistryModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('3D ASSET MANIFEST REGISTRY')).toBeDefined();
    expect(screen.getByText('Register Model')).toBeDefined();
  });
});
