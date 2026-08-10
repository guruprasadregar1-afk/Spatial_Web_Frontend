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

export const LandmarkNodeRenderer: React.FC<RendererProps> = ({
  node,
  isSelected,
  isHovered,
  onSelect,
  onHover,
}) => {
  const [x, y, z] = node.transform.position;
  const color = isSelected ? '#00f3ff' : isHovered ? '#ffaa00' : node.render.color || '#e11d48';

  // Map real photographic texture URL for Jaipur monuments
  const imageUrlMap: Record<string, string> = {
    'jaipur-hawa-mahal': '/images/hawa_mahal.jpg',
    'jaipur-amer-fort': '/images/amer_fort.jpg',
    'jaipur-city-palace': '/images/city_palace.jpg',
    'jaipur-jantar-mantar': '/images/city_palace.jpg',
    'jaipur-jal-mahal': '/images/hawa_mahal.jpg',
  };

  const hasPhoto = Boolean(imageUrlMap[node.id] || node.render.imageUrl);
  const photoUrl = imageUrlMap[node.id] || node.render.imageUrl || '';

  return (
    <group
      position={[x, y + 1.2, z]}
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
      {/* 3D Floating Title Tag Badge */}
      <Html position={[0, hasPhoto ? 3.8 : 2.2, 0]} center distanceFactor={24} zIndexRange={[10, 0]}>
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

      {/* Render Real Photo Cutout ONLY if photo is provided (e.g. Jaipur Landmarks) */}
      {hasPhoto ? (
        <Html position={[0, 1.8, 0]} center distanceFactor={20} zIndexRange={[10, 0]}>
          <div
            className={`relative w-44 h-36 rounded-2xl overflow-hidden border-2 transition-all shadow-2xl pointer-events-none ${
              isSelected
                ? 'border-cyan-400 glow-cyan scale-105'
                : isHovered
                ? 'border-amber-400 glow-purple'
                : 'border-spatial-border/60 hover:border-cyan-400/80'
            }`}
          >
            <img src={photoUrl} alt={node.content.title} className="w-full h-full object-cover rounded-xl" />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent flex items-end p-2">
              <span className="text-[11px] font-bold text-cyan-300 font-mono truncate">{node.content.title}</span>
            </div>
          </div>
        </Html>
      ) : (
        /* Render Glowing 3D Celestial Body Sphere for Universe Nodes (Sun, Earth, Mars, Jupiter, etc.) */
        <group>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[1.2, 32, 32]} />
            <meshStandardMaterial
              color={color}
              emissive={color}
              emissiveIntensity={isHovered || isSelected ? 0.8 : 0.35}
              roughness={0.1}
              metalness={0.8}
            />
          </mesh>

          {/* Outer Glowing Wireframe Orbital Ring */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[1.8, 0.04, 16, 100]} />
            <meshBasicMaterial color={color} transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Glowing Ground Ring */}
      {(isSelected || isHovered) && (
        <mesh position={[0, -0.7, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.0, 2.7, 32]} />
          <meshBasicMaterial color="#00f3ff" side={2} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};
