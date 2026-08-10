'use client';

import React, { useState } from 'react';
import { Search, Radar, BoxSelect, Target, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useSpatialStore } from '@/store/slices/spatialSlice';

export const SpatialQueryToolbar: React.FC = () => {
  const { setSelectedNodeId, setTargetFocusPosition } = useSpatialStore();
  const [isOpen, setIsOpen] = useState(false);
  const [queryType, setQueryType] = useState<'proximity' | 'nearest' | 'box'>('proximity');
  const [radius, setRadius] = useState(50);
  const [kLimit, setKLimit] = useState(5);
  const [matchingCount, setMatchingCount] = useState<number | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  const handleRunQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsExecuting(true);
    setMatchingCount(null);

    try {
      if (queryType === 'proximity') {
        const endpoint = `${API_ENDPOINTS.SPATIAL.PROXIMITY}?x=0&y=0&z=0&radius=${radius}`;
        const res = await apiClient<any>(endpoint);
        const nodes = res?.data?.nodes || res?.data || [];
        setMatchingCount(Array.isArray(nodes) ? nodes.length : 0);
      } else if (queryType === 'nearest') {
        const endpoint = `${API_ENDPOINTS.SPATIAL.NEAREST}?x=0&y=0&z=0&limit=${kLimit}`;
        const res = await apiClient<any>(endpoint);
        const nodes = res?.data?.nodes || res?.data || [];
        setMatchingCount(Array.isArray(nodes) ? nodes.length : 0);
        if (Array.isArray(nodes) && nodes.length > 0) {
          const nearest = nodes[0];
          setSelectedNodeId(nearest.id);
          if (nearest.transform?.position) {
            setTargetFocusPosition(nearest.transform.position);
          }
        }
      } else {
        const body = {
          min: [-100, -100, -100],
          max: [100, 100, 100],
        };
        const res = await apiClient<any>(API_ENDPOINTS.SPATIAL.BOX, {
          method: 'POST',
          body: JSON.stringify(body),
        });
        const nodes = res?.data?.nodes || res?.data || [];
        setMatchingCount(Array.isArray(nodes) ? nodes.length : 0);
      }
    } catch (err: any) {
      console.warn('3D Spatial Query execution notice:', err);
      setMatchingCount(0);
    } finally {
      setIsExecuting(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="absolute top-20 right-6 z-30">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 glow-cyan"
        >
          <Search className="w-4 h-4 text-cyan-300" /> 3D Spatial Query Solver
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-6 w-80 z-30 glass-panel p-4 rounded-2xl flex flex-col gap-3 border border-spatial-border/40 shadow-2xl animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-spatial-border/30">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <Search className="w-4 h-4 text-cyan-300" /> 3D Spatial Query Solvers
        </span>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-1 p-1 rounded-lg bg-gray-900/80 border border-gray-800 text-[11px]">
        <button
          type="button"
          onClick={() => setQueryType('proximity')}
          className={`py-1 rounded flex items-center justify-center gap-1 font-medium transition-all ${
            queryType === 'proximity' ? 'bg-spatial-accent text-gray-950 font-bold' : 'text-gray-400'
          }`}
        >
          <Radar className="w-3 h-3" /> Radius
        </button>

        <button
          type="button"
          onClick={() => setQueryType('nearest')}
          className={`py-1 rounded flex items-center justify-center gap-1 font-medium transition-all ${
            queryType === 'nearest' ? 'bg-spatial-accent text-gray-950 font-bold' : 'text-gray-400'
          }`}
        >
          <Target className="w-3 h-3" /> Nearest
        </button>

        <button
          type="button"
          onClick={() => setQueryType('box')}
          className={`py-1 rounded flex items-center justify-center gap-1 font-medium transition-all ${
            queryType === 'box' ? 'bg-spatial-accent text-gray-950 font-bold' : 'text-gray-400'
          }`}
        >
          <BoxSelect className="w-3 h-3" /> AABB Box
        </button>
      </div>

      <form onSubmit={handleRunQuery} className="flex flex-col gap-3">
        {queryType === 'proximity' && (
          <Input
            label="Proximity Radius (Meters)"
            type="number"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
          />
        )}

        {queryType === 'nearest' && (
          <Input
            label="K-Nearest Neighbors Count"
            type="number"
            value={kLimit}
            onChange={(e) => setKLimit(Number(e.target.value))}
          />
        )}

        {queryType === 'box' && (
          <p className="text-xs text-gray-400 italic">
            Evaluates Axis-Aligned Bounding Box containment `[-100, -100, -100]` to `[100, 100, 100]`.
          </p>
        )}

        <Button type="submit" variant="primary" size="sm" disabled={isExecuting} className="w-full flex items-center justify-center gap-2">
          {isExecuting ? 'Solving Query...' : 'Execute 3D Spatial Query'}
        </Button>
      </form>

      {matchingCount !== null && (
        <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300 flex items-center justify-between font-mono">
          <span>Matching 3D Nodes:</span>
          <span className="font-bold text-white text-sm">{matchingCount}</span>
        </div>
      )}
    </div>
  );
};
