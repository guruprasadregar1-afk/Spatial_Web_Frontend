export const API_ENDPOINTS = {
  HEALTH: '/health',
  DOCS: '/docs',
  SPATIAL: {
    NODES: '/spatial/nodes',
    NODE_BY_ID: (id: string) => `/spatial/nodes/${id}`,
    LAYOUT: '/spatial/layout/calculate',
    PROXIMITY: '/spatial/query/proximity',
    NEAREST: '/spatial/query/nearest',
    BOX: '/spatial/query/box',
  },
  INGEST: {
    JSON: '/ingest/json',
    HTML: '/ingest/html',
  },
  AI: {
    SEMANTIC_MAP: '/ai/semantic-map',
  },
  JAIPUR: {
    LANDMARKS: '/jaipur/landmarks',
    LANDMARK_BY_ID: (id: string) => `/jaipur/landmarks/${id}`,
    GRAPH: '/jaipur/graph',
  },
  ASSETS: {
    MANIFEST: '/assets/manifest',
    MODEL: (id: string) => `/assets/model/${id}`,
    REGISTER: '/assets/register',
  },
  SCENES: {
    STATE: '/scenes/state',
    SELECT: '/scenes/select',
    STREAM: '/scenes/stream',
    SNAPSHOT: '/scenes/snapshot',
    HISTORY: '/scenes/history',
    ROLLBACK: (id: string) => `/scenes/rollback/${id}`,
  },
};
