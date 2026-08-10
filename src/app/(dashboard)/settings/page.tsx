'use client';

import React, { useState } from 'react';
import { Settings, Server, Shield, Globe } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function SettingsPage() {
  const [apiUrl, setApiUrl] = useState('http://localhost:3004/api/v1');
  const [fov, setFov] = useState(50);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto flex flex-col gap-6">
      <div className="glass-panel p-6 rounded-2xl border border-spatial-border/40 flex items-center gap-3">
        <Settings className="w-6 h-6 text-cyan-300" />
        <div>
          <h1 className="text-xl font-bold text-white">Spatial Engine Settings</h1>
          <p className="text-xs text-gray-400">Configure API connection endpoints, WebGL canvas FOV, and performance quotas.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-spatial-border/30 flex flex-col gap-5">
        <Input
          label="Backend API Base URL"
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
        />

        <Input
          label="Default WebGL Camera Field of View (FOV)"
          type="number"
          value={fov}
          onChange={(e) => setFov(Number(e.target.value))}
        />

        <div className="flex items-center justify-between pt-4 border-t border-spatial-border/30">
          {saved && <span className="text-xs font-mono text-emerald-400">Settings saved successfully!</span>}
          <Button type="submit" variant="primary" className="ml-auto">
            Save Engine Configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
