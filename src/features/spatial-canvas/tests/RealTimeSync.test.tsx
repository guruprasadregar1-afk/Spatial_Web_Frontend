import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { RealTimeStatusPill } from '../components/RealTimeStatusPill';

describe('Frontend Sprint 23 — Real-Time SSE Synchronization Engine UI', () => {
  it('RealTimeStatusPill should display connected SSE status pill', () => {
    render(<RealTimeStatusPill isConnected={true} lastSyncTime="17:08:00" />);

    expect(screen.getByText('SSE Sync Live')).toBeDefined();
    expect(screen.getByText('Sync: 17:08:00')).toBeDefined();
  });

  it('RealTimeStatusPill should display reconnecting status pill when disconnected', () => {
    render(<RealTimeStatusPill isConnected={false} />);

    expect(screen.getByText('SSE Reconnecting...')).toBeDefined();
  });
});
