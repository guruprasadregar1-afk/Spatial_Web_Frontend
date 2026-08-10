'use client';

import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSpatialStore } from '@/store/slices/spatialSlice';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NodeEditorModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const { graph, selectedNodeId, setGraph } = useSpatialStore();

  const node = selectedNodeId && graph?.nodes[selectedNodeId] ? graph.nodes[selectedNodeId] : null;

  // Unconditional React hooks (must be declared at top level)
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);
  const [isSaving, setIsSaving] = useState(false);

  // Synchronize local form state whenever active node changes
  useEffect(() => {
    if (node) {
      setTitle(node.content.title || '');
      setBody(node.content.body || '');
      setPosX(node.transform.position[0] ?? 0);
      setPosY(node.transform.position[1] ?? 0);
      setPosZ(node.transform.position[2] ?? 0);
    }
  }, [node]);

  if (!isOpen || !selectedNodeId || !node || !graph) {
    return null;
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const updatedNode = {
        ...node,
        content: {
          ...node.content,
          title,
          body,
        },
        transform: {
          ...node.transform,
          position: [Number(posX), Number(posY), Number(posZ)] as [number, number, number],
        },
      };

      // Persist node edit to backend port 3004
      await apiClient(API_ENDPOINTS.SPATIAL.NODE_BY_ID(node.id), {
        method: 'PUT',
        body: JSON.stringify(updatedNode),
      });

      // Update local Zustand store state
      const updatedGraph = {
        ...graph,
        nodes: {
          ...graph.nodes,
          [node.id]: updatedNode,
        },
      };
      setGraph(updatedGraph);
      onClose();
    } catch (err: any) {
      console.error('Error saving node edits:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
      <div className="glass-panel w-full max-w-lg p-6 rounded-2xl border border-spatial-border/50 shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between pb-3 border-b border-spatial-border/30">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            Edit 3D Node: <span className="text-cyan-300 font-mono">{node.id}</span>
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Input
            label="Node Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-300">Description / Body Content</label>
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="px-3.5 py-2.5 bg-gray-900/80 border border-spatial-border rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-spatial-accent focus:ring-1 focus:ring-spatial-accent transition-all resize-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-300">3D Position Coordinates [X, Y, Z]</label>
            <div className="grid grid-cols-3 gap-2">
              <Input
                label="X"
                type="number"
                step="any"
                value={posX}
                onChange={(e) => setPosX(Number(e.target.value))}
              />
              <Input
                label="Y"
                type="number"
                step="any"
                value={posY}
                onChange={(e) => setPosY(Number(e.target.value))}
              />
              <Input
                label="Z"
                type="number"
                step="any"
                value={posZ}
                onChange={(e) => setPosZ(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-spatial-border/30">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" disabled={isSaving} className="flex items-center gap-2">
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
