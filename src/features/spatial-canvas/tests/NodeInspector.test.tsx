import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { NodeInspectorPanel } from '../components/inspector/NodeInspectorPanel';
import { useSpatialStore } from '@/store/slices/spatialSlice';

describe('Frontend Sprint 19 — Hybrid 2D/3D Inspector Panel Engine', () => {
  it('NodeInspectorPanel should render selected node metadata when selectedNodeId is set', () => {
    useSpatialStore.setState({
      selectedNodeId: 'node-01',
      graph: {
        version: '1.0',
        rootId: 'node-01',
        nodes: {
          'node-01': {
            id: 'node-01',
            type: 'card',
            parentId: null,
            content: { title: 'Inspector Test Node', body: 'Test node description body text' },
            transform: { position: [10, 2, -5], rotation: [0, 0, 0], scale: [1, 1, 1] },
            relations: ['child-01'],
            interaction: { selectable: true, expandable: true, hoverable: true },
            render: { color: '#00f3ff' },
          },
        },
        updatedAt: new Date().toISOString(),
      },
    });

    const onEditNode = vi.fn();
    render(<NodeInspectorPanel onEditNode={onEditNode} />);

    expect(screen.getByText('Inspector Test Node')).toBeDefined();
    expect(screen.getByText('Test node description body text')).toBeDefined();
    expect(screen.getByText('[10, 2, -5]')).toBeDefined();

    const editBtn = screen.getByText('Edit Node Transform');
    fireEvent.click(editBtn);
    expect(onEditNode).toHaveBeenCalled();
  });
});
