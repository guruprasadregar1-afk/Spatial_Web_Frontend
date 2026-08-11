'use client';

import React from 'react';
import { Html } from '@react-three/drei';
import { SpatialNode } from '@/types/spatial';

interface RendererProps {
  node: SpatialNode;
  isSelected?: boolean;
  isHovered?: boolean;
  onSelect?: (id: string) => void;
  onHover?: (id: string | null) => void;
}

/**
 * Procedurally-generated 3D Building Geometry for Hawa Mahal
 * Multi-tiered step-back facade with roof turrets
 */
const HawaMahalGeometry: React.FC<{ material: React.ReactNode }> = ({ material }) => (
  <group position={[0, 0, 0]}>
    {/* Tier 1 - Base Level */}
    <mesh position={[0, 0.5, 0]}>
      <boxGeometry args={[3.4, 1.0, 1.2]} />
      {material}
    </mesh>
    {/* Tier 2 */}
    <mesh position={[0, 1.3, 0]}>
      <boxGeometry args={[2.8, 0.8, 1.0]} />
      {material}
    </mesh>
    {/* Tier 3 */}
    <mesh position={[0, 2.0, 0]}>
      <boxGeometry args={[2.2, 0.7, 0.8]} />
      {material}
    </mesh>
    {/* Tier 4 */}
    <mesh position={[0, 2.65, 0]}>
      <boxGeometry args={[1.6, 0.6, 0.6]} />
      {material}
    </mesh>
    {/* Tier 5 - Top Crown */}
    <mesh position={[0, 3.15, 0]}>
      <boxGeometry args={[1.0, 0.4, 0.4]} />
      {material}
    </mesh>

    {/* Side Turrets / Domes */}
    <mesh position={[-1.4, 1.8, 0]}>
      <coneGeometry args={[0.25, 0.6, 6]} />
      {material}
    </mesh>
    <mesh position={[1.4, 1.8, 0]}>
      <coneGeometry args={[0.25, 0.6, 6]} />
      {material}
    </mesh>
    <mesh position={[0, 3.5, 0]}>
      <coneGeometry args={[0.2, 0.5, 6]} />
      {material}
    </mesh>
  </group>
);

/**
 * Procedurally-generated 3D Building Geometry for Amer Fort
 * Fortified hilltop structure with corner bastions and main gate
 */
const AmerFortGeometry: React.FC<{ material: React.ReactNode }> = ({ material }) => (
  <group position={[0, 0, 0]}>
    {/* Main Fort Keep */}
    <mesh position={[0, 0.9, 0]}>
      <boxGeometry args={[3.2, 1.8, 2.4]} />
      {material}
    </mesh>
    {/* Upper Palace Wing */}
    <mesh position={[-0.4, 2.1, -0.3]}>
      <boxGeometry args={[2.0, 0.8, 1.4]} />
      {material}
    </mesh>
    {/* 4 Corner Cylindrical Bastions */}
    <mesh position={[-1.5, 1.0, -1.1]}>
      <cylinderGeometry args={[0.45, 0.5, 2.0, 8]} />
      {material}
    </mesh>
    <mesh position={[1.5, 1.0, -1.1]}>
      <cylinderGeometry args={[0.45, 0.5, 2.0, 8]} />
      {material}
    </mesh>
    <mesh position={[-1.5, 1.0, 1.1]}>
      <cylinderGeometry args={[0.45, 0.5, 2.0, 8]} />
      {material}
    </mesh>
    <mesh position={[1.5, 1.0, 1.1]}>
      <cylinderGeometry args={[0.45, 0.5, 2.0, 8]} />
      {material}
    </mesh>
    {/* Bastion Roof Domes */}
    <mesh position={[-1.5, 2.2, -1.1]}>
      <coneGeometry args={[0.45, 0.5, 8]} />
      {material}
    </mesh>
    <mesh position={[1.5, 2.2, -1.1]}>
      <coneGeometry args={[0.45, 0.5, 8]} />
      {material}
    </mesh>
    <mesh position={[-1.5, 2.2, 1.1]}>
      <coneGeometry args={[0.45, 0.5, 8]} />
      {material}
    </mesh>
    <mesh position={[1.5, 2.2, 1.1]}>
      <coneGeometry args={[0.45, 0.5, 8]} />
      {material}
    </mesh>
  </group>
);

/**
 * Procedurally-generated 3D Building Geometry for City Palace
 * Multi-story courtyard pavilion with central dome
 */
const CityPalaceGeometry: React.FC<{ material: React.ReactNode }> = ({ material }) => (
  <group position={[0, 0, 0]}>
    {/* Courtyard Base */}
    <mesh position={[0, 0.6, 0]}>
      <boxGeometry args={[3.0, 1.2, 2.8]} />
      {material}
    </mesh>
    {/* Upper Pavilion */}
    <mesh position={[0, 1.6, 0]}>
      <boxGeometry args={[1.8, 0.8, 1.8]} />
      {material}
    </mesh>
    {/* Central Royal Dome */}
    <mesh position={[0, 2.3, 0]}>
      <sphereGeometry args={[0.65, 12, 12]} />
      {material}
    </mesh>
    {/* Corner Finials */}
    <mesh position={[-0.8, 2.1, -0.8]}>
      <coneGeometry args={[0.2, 0.4, 6]} />
      {material}
    </mesh>
    <mesh position={[0.8, 2.1, -0.8]}>
      <coneGeometry args={[0.2, 0.4, 6]} />
      {material}
    </mesh>
    <mesh position={[-0.8, 2.1, 0.8]}>
      <coneGeometry args={[0.2, 0.4, 6]} />
      {material}
    </mesh>
    <mesh position={[0.8, 2.1, 0.8]}>
      <coneGeometry args={[0.2, 0.4, 6]} />
      {material}
    </mesh>
  </group>
);

/**
 * Default Extruded Low-Poly Architectural Building
 */
const DefaultLandmarkGeometry: React.FC<{ material: React.ReactNode }> = ({ material }) => (
  <group position={[0, 0, 0]}>
    <mesh position={[0, 0.8, 0]}>
      <boxGeometry args={[2.4, 1.6, 2.0]} />
      {material}
    </mesh>
    <mesh position={[0, 1.9, 0]}>
      <boxGeometry args={[1.4, 0.6, 1.2]} />
      {material}
    </mesh>
    <mesh position={[0, 2.4, 0]}>
      <coneGeometry args={[0.5, 0.6, 6]} />
      {material}
    </mesh>
  </group>
);

export const LandmarkNodeRenderer: React.FC<RendererProps> = ({
  node,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const [x, y, z] = node.transform.position;

  // Pink/salmon color palette (#e8a598) with subtle hover/selection state highlight
  const salmonColor = isSelected ? '#00f3ff' : isHovered ? '#ffaa00' : '#e8a598';

  // Flat-shaded terracotta material
  const buildingMaterial = (
    <meshStandardMaterial
      color={salmonColor}
      flatShading={true}
      roughness={0.5}
      metalness={0.1}
    />
  );

  return (
    <group
      position={[x, y, z]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(node.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        onHover?.(node.id);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onHover?.(null);
      }}
    >
      {/* 3D Floating Title Tag Badge (No Photo Card) */}
      <Html position={[0, 3.8, 0]} center distanceFactor={24} zIndexRange={[10, 0]}>
        <div
          className={`glass-panel px-3 py-1.5 rounded-xl border transition-all shadow-2xl pointer-events-none whitespace-nowrap flex items-center gap-2 ${
            isSelected
              ? 'border-cyan-400 glow-cyan bg-cyan-950/90'
              : isHovered
              ? 'border-amber-400 glow-purple bg-purple-950/90'
              : 'border-spatial-border/60 bg-gray-950/90'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse glow-cyan" />
          <span className="text-xs font-bold text-white">{node.content.title}</span>
        </div>
      </Html>

      {/* Dark Navy Ground Pad with Cyan Wireframe Grid Network */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.02, 0]}>
          <boxGeometry args={[4.2, 0.04, 3.8]} />
          <meshStandardMaterial color="#080e1e" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[4.0, 3.6]} />
          <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.4} />
        </mesh>
      </group>

      {/* Render Procedural Low-Poly 3D Extruded Building Geometry based on Landmark ID */}
      {node.id === 'jaipur-hawa-mahal' ? (
        <HawaMahalGeometry material={buildingMaterial} />
      ) : node.id === 'jaipur-amer-fort' ? (
        <AmerFortGeometry material={buildingMaterial} />
      ) : node.id === 'jaipur-city-palace' ? (
        <CityPalaceGeometry material={buildingMaterial} />
      ) : (
        <DefaultLandmarkGeometry material={buildingMaterial} />
      )}

      {/* Selection / Hover Highlight Base Ring */}
      {(isSelected || isHovered) && (
        <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.2, 2.5, 32]} />
          <meshBasicMaterial color={isSelected ? '#00f3ff' : '#ffaa00'} side={2} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};
