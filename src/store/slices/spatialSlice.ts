import { create } from 'zustand';
import { SpatialGraph } from '@/types/spatial';

interface SpatialStoreState {
  graph: SpatialGraph | null;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  targetFocusPosition: [number, number, number] | null;
  isLoading: boolean;
  error: string | null;

  setGraph: (graph: SpatialGraph) => void;
  setSelectedNodeId: (id: string | null) => void;
  setHoveredNodeId: (id: string | null) => void;
  setTargetFocusPosition: (pos: [number, number, number] | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useSpatialStore = create<SpatialStoreState>((set) => ({
  graph: null,
  selectedNodeId: null,
  hoveredNodeId: null,
  targetFocusPosition: null,
  isLoading: false,
  error: null,

  setGraph: (graph) => set({ graph }),
  setSelectedNodeId: (id) => set({ selectedNodeId: id }),
  setHoveredNodeId: (id) => set({ hoveredNodeId: id }),
  setTargetFocusPosition: (pos) => set({ targetFocusPosition: pos }),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}));
