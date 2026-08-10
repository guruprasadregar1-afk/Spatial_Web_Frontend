'use client';

import React, { useState } from 'react';
import { Sparkles, Send, Box, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TelemetryBadge } from './TelemetryBadge';
import { useSpatialStore } from '@/store/slices/spatialSlice';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const AiGeneratorPanel: React.FC = () => {
  const { setGraph, setLoading, setError, isLoading } = useSpatialStore();
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [telemetry, setTelemetry] = useState<any>(null);

  const samplePrompts = [
    'Create a 3D smart energy grid with solar arrays and wind telemetry nodes',
    'Generate a futuristic 3D e-commerce spatial showcase with featured products',
    'Build a 3D urban traffic control center with sensor towers',
  ];

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setError(null);
    try {
      // POST prompt to backend port 3004 AI Semantic Map endpoint
      const response = await apiClient<any>(API_ENDPOINTS.AI.SEMANTIC_MAP, {
        method: 'POST',
        body: JSON.stringify({ prompt, context }),
      });

      const graphData = response?.data?.graph || response?.data || null;
      const telemetryData = response?.data?.telemetry || response?.telemetry || {
        model: 'claude-3-5-sonnet-mock',
        totalTokens: 360,
        fallbackUsed: true,
      };

      if (graphData) {
        setGraph(graphData);
      }
      setTelemetry(telemetryData);
    } catch (err: any) {
      console.error('AI Generation error:', err);
      setError(err.message || 'Failed to generate AI spatial map');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-20 left-6 w-96 max-h-[calc(100vh-8rem)] z-30 glass-panel p-5 rounded-2xl flex flex-col gap-4 overflow-y-auto border border-purple-500/30 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-spatial-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-purple-600 to-cyan-400 flex items-center justify-center glow-purple">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">AI SPATIAL GENERATOR</h2>
            <p className="text-[10px] text-purple-300 font-mono">Claude 3.5 Sonnet Semantic Engine</p>
          </div>
        </div>
      </div>

      {/* Prompt Form */}
      <form onSubmit={handleGenerate} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300">Natural Language Prompt</label>
          <textarea
            rows={3}
            placeholder="Describe the 3D scene environment you want to build..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="px-3.5 py-2.5 bg-gray-900/80 border border-purple-500/40 rounded-lg text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all resize-none"
            required
          />
        </div>

        <Input
          label="Optional Context / Domain Metadata"
          placeholder="e.g. Telemetry sensors, 3D dashboards"
          value={context}
          onChange={(e) => setContext(e.target.value)}
        />

        <Button
          type="submit"
          variant="secondary"
          disabled={isLoading || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <span className="animate-pulse">Generating 3D Graph...</span>
          ) : (
            <>
              <Send className="w-4 h-4" /> Generate 3D Spatial Scene
            </>
          )}
        </Button>
      </form>

      {/* Sample Prompts */}
      <div className="flex flex-col gap-2 pt-2 border-t border-spatial-border/30">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Lightbulb className="w-3 h-3 text-amber-400" /> Sample AI Prompts
        </span>
        <div className="flex flex-col gap-1.5">
          {samplePrompts.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => setPrompt(sample)}
              className="p-2 rounded-lg bg-gray-900/60 hover:bg-purple-500/10 border border-gray-800 hover:border-purple-500/30 text-left text-xs text-gray-300 hover:text-white transition-all text-ellipsis overflow-hidden"
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>

      {/* Telemetry Output */}
      {telemetry && <TelemetryBadge telemetry={telemetry} />}
    </div>
  );
};
