import { defaultScreenPlane, SpatialDepthRegion } from '../boundary/ScreenPlane';

export type UiElementType = 'panel' | 'button' | 'text' | 'indicator' | 'icon' | 'container';
export type UiElementState = 'normal' | 'hover' | 'active' | 'disabled';

export interface SpatialUiElement {
  id: string;
  type: UiElementType;
  position: [number, number, number]; // [X, Y, Z] World Coordinates
  rotation?: [number, number, number];
  scale?: [number, number, number];
  dimensions: [number, number, number]; // [Width, Height, Depth]
  color: string;
  label?: string;
  state: UiElementState;
  interactive: boolean;
  visible: boolean;
  depthOffset: number; // Z-axis depth elevation e.g. -3.0, 0, +4.0
  region?: SpatialDepthRegion;
  children?: SpatialUiElement[];
}

export interface SpatialUiTree {
  version: number;
  rootId: string;
  elements: Map<string, SpatialUiElement>;
  timestamp: number;
}

export class SpatialUiModelUtils {
  public static createDemoUiTree(): SpatialUiTree {
    const elements = new Map<string, SpatialUiElement>();

    // 1. REGION A — SCREEN INTERIOR: Background Panel (Z = -3.0)
    const mainPanel: SpatialUiElement = {
      id: 'main-panel',
      type: 'panel',
      position: [0, 0, -3.0],
      dimensions: [22, 12, 0.2],
      color: '#080d1a',
      state: 'normal',
      interactive: false,
      visible: true,
      depthOffset: 0.0,
      region: SpatialDepthRegion.SCREEN_INTERIOR,
    };
    elements.set(mainPanel.id, mainPanel);

    // 2. REGION A — SCREEN INTERIOR: Action Buttons (Z = -2.0)
    const buttonScan: SpatialUiElement = {
      id: 'btn-scan',
      type: 'button',
      position: [-6, 1.0, -2.0],
      dimensions: [5, 2, 0.6],
      color: '#38bdf8',
      label: 'SCAN',
      state: 'normal',
      interactive: true,
      visible: true,
      depthOffset: 0.0,
      region: SpatialDepthRegion.SCREEN_INTERIOR,
    };
    elements.set(buttonScan.id, buttonScan);

    const buttonView: SpatialUiElement = {
      id: 'btn-view',
      type: 'button',
      position: [0, 1.0, -2.0],
      dimensions: [5, 2, 0.6],
      color: '#a855f7',
      label: 'VIEW',
      state: 'normal',
      interactive: true,
      visible: true,
      depthOffset: 0.0,
      region: SpatialDepthRegion.SCREEN_INTERIOR,
    };
    elements.set(buttonView.id, buttonView);

    const buttonReset: SpatialUiElement = {
      id: 'btn-reset',
      type: 'button',
      position: [6, 1.0, -2.0],
      dimensions: [5, 2, 0.6],
      color: '#f43f5e',
      label: 'RESET',
      state: 'normal',
      interactive: true,
      visible: true,
      depthOffset: 0.0,
      region: SpatialDepthRegion.SCREEN_INTERIOR,
    };
    elements.set(buttonReset.id, buttonReset);

    // 3. REGION B — SCREEN BOUNDARY: Virtual Glass Frame (Z = 0.0)
    const boundaryFrame: SpatialUiElement = {
      id: 'screen-boundary-frame',
      type: 'container',
      position: [0, 0, 0.0],
      dimensions: [24, 14, 0.1],
      color: '#00f3ff',
      label: 'SCREEN BOUNDARY PLANE (Z = 0)',
      state: 'normal',
      interactive: false,
      visible: true,
      depthOffset: 0.0,
      region: SpatialDepthRegion.SCREEN_BOUNDARY,
    };
    elements.set(boundaryFrame.id, boundaryFrame);

    // 4. REGION C — BEYOND SCREEN: Floating Pop-Out Hologram UI Card (Z = +4.0)
    const floatingPopoutCard: SpatialUiElement = {
      id: 'floating-popout-card',
      type: 'container',
      position: [0, 3.5, 4.0],
      dimensions: [16, 3, 0.8],
      color: '#fbbf24',
      label: '✨ BEYOND SCREEN SPATIAL UI (Z = +4.0)',
      state: 'normal',
      interactive: true,
      visible: true,
      depthOffset: 0.0,
      region: SpatialDepthRegion.BEYOND_SCREEN,
    };
    elements.set(floatingPopoutCard.id, floatingPopoutCard);

    return {
      version: 1,
      rootId: 'main-panel',
      elements,
      timestamp: performance.now(),
    };
  }

  public static updateElementZ(tree: SpatialUiTree, elementId: string, newZ: number): SpatialDepthRegion {
    const el = tree.elements.get(elementId);
    if (!el) return SpatialDepthRegion.SCREEN_INTERIOR;

    el.position[2] = newZ;
    el.region = defaultScreenPlane.classifyDepthRegion(newZ);
    tree.version++;
    tree.timestamp = performance.now();
    return el.region;
  }
}
