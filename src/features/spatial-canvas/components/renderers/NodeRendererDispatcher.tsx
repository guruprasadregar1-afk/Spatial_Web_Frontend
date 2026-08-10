'use client';

import React from 'react';
import { SpatialNode } from '@/types/spatial';
import { RootNodeRenderer } from './RootNodeRenderer';
import { PanelNodeRenderer } from './PanelNodeRenderer';
import { CardNodeRenderer } from './CardNodeRenderer';
import { BuildingNodeRenderer } from './BuildingNodeRenderer';
import { LandmarkNodeRenderer } from './LandmarkNodeRenderer';

interface DispatcherProps {
  node: SpatialNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
}

export const NodeRendererDispatcher: React.FC<DispatcherProps> = (props) => {
  const { node } = props;

  switch (node.type) {
    case 'root':
      return <RootNodeRenderer {...props} />;
    case 'panel':
    case 'section':
      return <PanelNodeRenderer {...props} />;
    case 'card':
    case 'connector':
      return <CardNodeRenderer {...props} />;
    case 'building':
      return <BuildingNodeRenderer {...props} />;
    case 'landmark':
      return <LandmarkNodeRenderer {...props} />;
    default:
      return <CardNodeRenderer {...props} />;
  }
};
