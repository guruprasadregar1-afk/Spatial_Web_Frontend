export type NodeSemanticType = 'root' | 'section' | 'panel' | 'card' | 'building' | 'landmark' | 'connector';

export interface SpatialTransform {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: [number, number, number];
}

export interface NodeContent {
  title: string;
  description?: string;
  body?: string;
  attribution?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface NodeInteractionRules {
  selectable: boolean;
  expandable: boolean;
  hoverable: boolean;
}

export interface NodeRenderConfig {
  color?: string;
  wireframe?: boolean;
  opacity?: number;
  assetUrl?: string;
  imageUrl?: string;
  lodLevel?: 'high' | 'medium' | 'low';
}

export interface SpatialNode {
  id: string;
  type: NodeSemanticType;
  parentId: string | null;
  content: NodeContent;
  transform: SpatialTransform;
  relations: string[];
  interaction: NodeInteractionRules;
  render: NodeRenderConfig;
}

export interface SpatialGraph {
  version: string;
  rootId: string;
  nodes: Record<string, SpatialNode>;
  updatedAt: string;
}
