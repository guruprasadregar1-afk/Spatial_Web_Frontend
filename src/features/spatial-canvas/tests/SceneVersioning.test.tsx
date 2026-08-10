import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { SceneVersioningToolbar } from '../components/versioning/SceneVersioningToolbar';

describe('Frontend Sprint 25 — Scene Versioning, Snapshot Timeline & Rollback UI', () => {
  it('SceneVersioningToolbar should open version timeline panel', () => {
    render(<SceneVersioningToolbar />);

    const openBtn = screen.getByText('Version History');
    fireEvent.click(openBtn);

    expect(screen.getByText('Scene Version Timeline')).toBeDefined();
    expect(screen.getByPlaceholderText('Snapshot Name...')).toBeDefined();
  });
});
