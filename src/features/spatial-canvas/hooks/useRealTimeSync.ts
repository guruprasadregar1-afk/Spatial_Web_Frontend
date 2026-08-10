'use client';

import { useEffect, useState } from 'react';
import { useSpatialStore } from '@/store/slices/spatialSlice';
import { config } from '@/lib/config';
import { apiClient } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';

export function useRealTimeSync() {
  const { selectedNodeId, setSelectedNodeId } = useSpatialStore();
  const [isConnected, setIsConnected] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    // Guard against SSR / non-browser / JSDOM environment
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') {
      return;
    }

    // Open Server-Sent Events (SSE) stream to backend port 3004
    const sseUrl = `${config.apiBaseUrl}${API_ENDPOINTS.SCENES.STREAM}`;
    let eventSource: EventSource | null = null;

    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onopen = () => {
        setIsConnected(true);
      };

      eventSource.addEventListener('connected', () => {
        setIsConnected(true);
      });

      eventSource.addEventListener('state_update', (event: MessageEvent) => {
        try {
          const data = JSON.parse(event.data);
          setLastSyncTime(new Date().toLocaleTimeString());

          if (data.selectedNodeId && data.selectedNodeId !== selectedNodeId) {
            setSelectedNodeId(data.selectedNodeId);
          }
        } catch (err) {
          console.warn('Error parsing SSE state update:', err);
        }
      });

      eventSource.onerror = () => {
        setIsConnected(false);
      };
    } catch (err) {
      setIsConnected(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, []);

  // Broadcast selection change to backend
  const broadcastSelection = async (nodeId: string | null) => {
    try {
      await apiClient(API_ENDPOINTS.SCENES.SELECT, {
        method: 'POST',
        body: JSON.stringify({ nodeId }),
      });
      setLastSyncTime(new Date().toLocaleTimeString());
    } catch (err) {
      console.warn('Failed to broadcast node selection:', err);
    }
  };

  return {
    isConnected,
    lastSyncTime,
    broadcastSelection,
  };
}
