'use client';

import React, { useState } from 'react';
import { History, Camera, RotateCcw, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { useSpatialStore } from '@/store/slices/spatialSlice';

export const SceneVersioningToolbar: React.FC = () => {
  const { setGraph, setSelectedNodeId } = useSpatialStore();
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [snapshotName, setSnapshotName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient<any>(API_ENDPOINTS.SCENES.HISTORY);
      const list = res?.data?.history || res?.data || [];
      setHistory(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('History fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchHistory();
  };

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotName.trim()) return;

    setIsLoading(true);
    setMessage(null);
    try {
      await apiClient(API_ENDPOINTS.SCENES.SNAPSHOT, {
        method: 'POST',
        body: JSON.stringify({
          name: snapshotName,
          description: 'User created milestone snapshot',
        }),
      });
      setSnapshotName('');
      setMessage('Snapshot saved successfully!');
      fetchHistory();
    } catch (err: any) {
      console.error('Snapshot error:', err);
      setMessage(err.message || 'Failed to save snapshot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    setIsLoading(true);
    setMessage(null);
    try {
      const res = await apiClient<any>(API_ENDPOINTS.SCENES.ROLLBACK(versionId), {
        method: 'POST',
      });
      const restoredGraph = res?.data?.graph || res?.data?.snapshot?.graph || null;
      if (restoredGraph) {
        setGraph(restoredGraph);
        setSelectedNodeId(null);
        setMessage(`Scene rolled back to version ${versionId}`);
      }
    } catch (err: any) {
      console.error('Rollback error:', err);
      setMessage(err.message || 'Rollback failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <div className="absolute top-20 right-56 z-30">
        <Button variant="outline" size="sm" onClick={handleOpen} className="flex items-center gap-2 glow-purple">
          <History className="w-4 h-4 text-purple-400" /> Version History
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute top-20 right-56 w-88 z-30 glass-panel p-4 rounded-2xl flex flex-col gap-3 border border-purple-500/40 shadow-2xl animate-in fade-in duration-200">
      <div className="flex items-center justify-between pb-2 border-b border-spatial-border/30">
        <span className="text-xs font-bold text-white flex items-center gap-1.5">
          <History className="w-4 h-4 text-purple-400" /> Scene Version Timeline
        </span>
        <button onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Save Snapshot Form */}
      <form onSubmit={handleCreateSnapshot} className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Input
            placeholder="Snapshot Name..."
            value={snapshotName}
            onChange={(e) => setSnapshotName(e.target.value)}
            className="text-xs py-1.5"
          />
          <Button type="submit" variant="secondary" size="sm" disabled={isLoading || !snapshotName.trim()} className="px-3">
            <Camera className="w-3.5 h-3.5" /> Save
          </Button>
        </div>
      </form>

      {message && <p className="text-[11px] text-cyan-300 font-mono italic">{message}</p>}

      {/* History Timeline */}
      <div className="flex flex-col gap-2 pt-2 border-t border-spatial-border/30 max-h-48 overflow-y-auto">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
          Snapshots ({history.length})
        </span>

        {history.length > 0 ? (
          history.map((item) => (
            <div key={item.versionId || item.id} className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800 flex items-center justify-between text-xs">
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-white truncate max-w-[150px]">{item.name || item.versionId}</span>
                <span className="text-[10px] text-gray-500 font-mono">{new Date(item.timestamp || item.createdAt).toLocaleTimeString()}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleRollback(item.versionId || item.id)}
                disabled={isLoading}
                className="text-[10px] px-2 py-0.5"
              >
                <RotateCcw className="w-3 h-3 mr-1" /> Rollback
              </Button>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-500 italic p-2">No historical snapshots yet.</p>
        )}
      </div>
    </div>
  );
};
