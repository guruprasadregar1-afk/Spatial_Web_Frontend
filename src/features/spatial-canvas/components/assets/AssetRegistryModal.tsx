'use client';

import React, { useEffect, useState } from 'react';
import { Box, X, Plus, HardDrive, ShieldCheck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssetRegistryModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [manifest, setManifest] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('monument');
  const [assetUrl, setAssetUrl] = useState('');

  const fetchManifest = async () => {
    setIsLoading(true);
    try {
      const res = await apiClient<any>(API_ENDPOINTS.ASSETS.MANIFEST);
      const list = res?.data?.manifest || res?.data || [];
      setManifest(Array.isArray(list) ? list : []);
    } catch (err) {
      console.warn('Manifest fetch notice:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchManifest();
    }
  }, [isOpen]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !assetUrl.trim()) return;

    setIsLoading(true);
    try {
      await apiClient(API_ENDPOINTS.ASSETS.REGISTER, {
        method: 'POST',
        body: JSON.stringify({
          name,
          category,
          assetUrl,
          lodVariants: { high: assetUrl, medium: assetUrl, low: assetUrl },
          attribution: 'User Registered 3D Asset',
        }),
      });
      setName('');
      setAssetUrl('');
      setShowRegisterForm(false);
      fetchManifest();
    } catch (err: any) {
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl p-6 rounded-2xl border border-spatial-border/50 shadow-2xl flex flex-col gap-5 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-spatial-border/30">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 to-purple-600 flex items-center justify-center glow-cyan">
              <Box className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">3D ASSET MANIFEST REGISTRY</h3>
              <p className="text-[10px] text-cyan-300 font-mono">GLB Models & LOD Level Variants</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowRegisterForm(!showRegisterForm)}
              className="flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" /> Register Model
            </Button>

            <button onClick={onClose} className="text-gray-400 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form to Register Model */}
        {showRegisterForm && (
          <form onSubmit={handleRegister} className="p-4 rounded-xl bg-gray-900/90 border border-spatial-border/40 flex flex-col gap-3">
            <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">Register New 3D Asset</h4>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Model Name" value={name} onChange={(e) => setName(e.target.value)} required />
              <Input label="Category" value={category} onChange={(e) => setCategory(e.target.value)} required />
            </div>
            <Input label="GLB Model File URL" value={assetUrl} onChange={(e) => setAssetUrl(e.target.value)} required />
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowRegisterForm(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" disabled={isLoading}>
                Save Asset
              </Button>
            </div>
          </form>
        )}

        {/* Asset Manifest Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {manifest.length > 0 ? (
            manifest.map((asset) => (
              <div key={asset.id} className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 flex flex-col gap-2 hover:border-spatial-accent/40 transition-all">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-white">{asset.name}</span>
                  <span className="glass-pill px-2 py-0.5 rounded text-[10px] font-mono text-purple-300 uppercase flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {asset.category || 'GLB'}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-400 font-mono">
                  <span className="flex items-center gap-1"><HardDrive className="w-3.5 h-3.5 text-cyan-400" /> GLB 3D</span>
                  <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> CC-BY / ODbL</span>
                </div>

                <p className="text-[11px] text-gray-400 truncate">{asset.assetUrl || asset.url || 'Model Asset Registered'}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 italic p-4 col-span-2 text-center">Loading 3D asset manifest registry...</p>
          )}
        </div>
      </div>
    </div>
  );
};
