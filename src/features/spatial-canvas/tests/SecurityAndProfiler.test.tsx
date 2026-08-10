import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SecurityTelemetryPill } from '../components/security/SecurityTelemetryPill';
import { ProfilerOverlay } from '../components/performance/ProfilerOverlay';

describe('Frontend Sprints 27-30 — Security Telemetry, Profiler & Final Stage Verification', () => {
  it('SecurityTelemetryPill should render rate limit quota', () => {
    render(<SecurityTelemetryPill rateLimitLimit={100} rateLimitRemaining={95} />);
    expect(screen.getByText('Rate Limit: 95/100')).toBeDefined();
  });

  it('ProfilerOverlay should render WebGL FPS and memory profiler telemetry', () => {
    render(<ProfilerOverlay />);
    expect(screen.getByText('60 FPS')).toBeDefined();
    expect(screen.getByText('12 MB WebGL')).toBeDefined();
  });
});
