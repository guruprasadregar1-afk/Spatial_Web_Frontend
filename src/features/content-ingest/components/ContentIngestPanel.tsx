'use client';

import React, { useState } from 'react';
import { FileCode, Code, UploadCloud, Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useSpatialStore } from '@/store/slices/spatialSlice';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export const ContentIngestPanel: React.FC = () => {
  const { setGraph, setLoading, setError, isLoading } = useSpatialStore();
  const [ingestMode, setIngestMode] = useState<'json' | 'html'>('json');
  const [title, setTitle] = useState('');
  const [payloadText, setPayloadText] = useState('');
  const [resultMetrics, setResultMetrics] = useState<any>(null);

  const sampleJson = JSON.stringify(
    {
      productName: 'Spatial Web 3D VR Headset',
      price: '$999',
      features: ['Dual 4K OLED', 'Hand Tracking', 'Spatial Audio'],
      inStock: true,
    },
    null,
    2
  );

  const sampleHtml = `<main id="spatial-root">
  <h1>Jaipur Heritage Landmarks</h1>
  <p>3D Spatial Node Network for Rajasthan Cultural Heritage</p>
  <article id="node-hawa-mahal">
    <h2>Hawa Mahal Main Facade</h2>
    <p>Five-story pink sandstone palace built in 1799 with 953 intricate jharokhas.</p>
  </article>
  <article id="node-amer-fort">
    <h2>Amer Fort Palace</h2>
    <p>Majestic hilltop fort overlooking Maota Lake.</p>
  </article>
</main>`;

  const handleIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payloadText.trim()) return;

    setLoading(true);
    setError(null);
    try {
      let activeMode = ingestMode;
      const textTrimmed = payloadText.trim();

      // Auto-detect HTML DOM payload if payload starts with '<'
      if (textTrimmed.startsWith('<') || textTrimmed.startsWith('<!--')) {
        activeMode = 'html';
        setIngestMode('html');
      }

      let endpoint = API_ENDPOINTS.INGEST.JSON;
      let bodyData: any = {};

      if (activeMode === 'json') {
        try {
          const parsedJson = JSON.parse(textTrimmed);
          bodyData = { title: title || 'Ingested JSON Dataset', payload: parsedJson };
        } catch (jsonErr) {
          endpoint = API_ENDPOINTS.INGEST.HTML;
          bodyData = {
            title: title || 'Ingested HTML DOM Document',
            htmlContent: textTrimmed,
            html: textTrimmed,
          };
        }
      } else {
        endpoint = API_ENDPOINTS.INGEST.HTML;
        bodyData = {
          title: title || 'Ingested HTML DOM Document',
          htmlContent: textTrimmed,
          html: textTrimmed,
        };
      }

      const response = await apiClient<any>(endpoint, {
        method: 'POST',
        body: JSON.stringify(bodyData),
      });

      const graphData = response?.data?.graph || response?.data || null;
      if (graphData) {
        setGraph(graphData);
        setResultMetrics({
          nodeCount: Object.keys(graphData.nodes || {}).length,
          type: activeMode.toUpperCase(),
          title: title || 'Ingested Web Data',
        });
      }
    } catch (err: any) {
      console.error('Ingest error:', err);
      setError(err.message || 'Failed to ingest web content');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="absolute top-20 left-6 w-96 max-h-[calc(100vh-8rem)] z-40 glass-panel p-5 rounded-2xl flex flex-col gap-4 overflow-y-auto border border-spatial-border/40 shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-spatial-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center glow-cyan">
            <UploadCloud className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">WEB CONTENT INGESTION</h2>
            <p className="text-[10px] text-cyan-300 font-mono">JSON / HTML DOM → 3D Graph Normalizer</p>
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-900/80 border border-gray-800">
        <button
          type="button"
          onClick={() => {
            setIngestMode('json');
            setPayloadText(sampleJson);
          }}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            ingestMode === 'json' ? 'bg-spatial-accent text-gray-950 glow-cyan' : 'text-gray-400 hover:text-white'
          }`}
        >
          <FileCode className="w-3.5 h-3.5" /> Web JSON
        </button>

        <button
          type="button"
          onClick={() => {
            setIngestMode('html');
            setPayloadText(sampleHtml);
          }}
          className={`py-1.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            ingestMode === 'html' ? 'bg-spatial-purple text-white glow-purple' : 'text-gray-400 hover:text-white'
          }`}
        >
          <Code className="w-3.5 h-3.5" /> HTML DOM
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleIngest} className="flex flex-col gap-3">
        <Input
          label="Document / Spatial Graph Title"
          placeholder="e.g. E-Commerce Product Catalog"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-300">
            Raw {ingestMode.toUpperCase()} Payload
          </label>
          <textarea
            rows={5}
            placeholder={`Paste raw ${ingestMode.toUpperCase()} code here...`}
            value={payloadText}
            onChange={(e) => setPayloadText(e.target.value)}
            className="px-3.5 py-2.5 bg-gray-900/80 border border-spatial-border rounded-lg text-xs font-mono text-cyan-300 placeholder-gray-500 focus:outline-none focus:border-spatial-accent focus:ring-1 focus:ring-spatial-accent transition-all resize-none"
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || !payloadText.trim()}
          className="w-full flex items-center justify-center gap-2 font-bold glow-cyan"
        >
          <UploadCloud className="w-4 h-4" />
          {isLoading ? 'Transforming to 3D Graph...' : `Transform ${ingestMode.toUpperCase()} to 3D Scene`}
        </Button>
      </form>

      {/* Result Metrics */}
      {resultMetrics && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between text-xs text-emerald-300">
          <span className="font-semibold flex items-center gap-1.5">
            <Layers className="w-4 h-4" /> 3D Nodes Generated
          </span>
          <span className="font-mono font-bold text-white">{resultMetrics.nodeCount} Nodes</span>
        </div>
      )}
    </div>
  );
};
