'use client';

import React, { useMemo } from 'react';
import { Html } from '@react-three/drei';

export const SpatialCityScene: React.FC = () => {
  // Generate 35 procedural stylized 3D buildings behind screen plane (Z < 0)
  const buildings = useMemo(() => {
    const list: { id: string; x: number; z: number; width: number; height: number; depth: number; color: string }[] = [];
    const colors = ['#00f3ff', '#a855f7', '#38bdf8', '#34d399', '#fbbf24', '#f43f5e'];

    let count = 0;
    for (let row = -3; row <= 3; row++) {
      for (let col = -3; col <= 3; col++) {
        if (row === 0 && col === 0) continue;
        count++;
        const x = col * 7.5 + Math.sin(count) * 1.5;
        const z = row * 7.5 - 16 + Math.cos(count) * 1.5; // Placed behind screen plane (Z < 0)
        const height = 4 + (Math.abs(row) + Math.abs(col)) * 2 + (count % 5) * 1.5;
        const color = colors[count % colors.length];

        list.push({
          id: `bldg-${count}`,
          x,
          z,
          width: 3.2,
          height,
          depth: 3.2,
          color,
        });
      }
    }
    return list;
  }, []);

  return (
    <group position={[0, -4, 0]}>
      {/* =========================================================
          PHYSICAL MONITOR GLASS SCREEN PLANE GUIDE (Z = 0)
          ========================================================= */}
      <group position={[0, 4, 0]}>
        {/* Glowing Monitor Screen Boundary Frame at Z = 0 */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[32, 18, 0.1]} />
          <meshBasicMaterial color="#00f3ff" wireframe transparent opacity={0.35} />
        </mesh>

        <Html position={[0, 9.5, 0]} center distanceFactor={25} zIndexRange={[5, 0]}>
          <div className="px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/60 text-[11px] font-mono font-bold text-cyan-300 shadow-xl whitespace-nowrap">
            🖥️ PHYSICAL MONITOR SCREEN PLANE (Z = 0)
          </div>
        </Html>
      </group>


      {/* =========================================================
          BACKGROUND LAYER 1: 3D CITY (Z < 0, BEHIND MONITOR GLASS)
          ========================================================= */}
      {/* 3D City Ground Grid Plane */}
      <mesh position={[0, 0, -16]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[70, 70]} />
        <meshStandardMaterial color="#080d1a" roughness={0.8} metalness={0.5} />
      </mesh>

      {/* Glowing Cyber Grid Overlay */}
      <gridHelper args={[70, 35, '#00f3ff', '#1e293b']} position={[0, 0.05, -16]} />

      {/* Central Cyber Landmark Tower */}
      <group position={[0, 0, -16]}>
        <mesh position={[0, 8, 0]}>
          <boxGeometry args={[4, 16, 4]} />
          <meshStandardMaterial color="#00f3ff" emissive="#00f3ff" emissiveIntensity={0.3} roughness={0.1} metalness={0.9} />
        </mesh>

        <mesh position={[0, 17, 0]}>
          <coneGeometry args={[2.5, 6, 4]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} />
        </mesh>

        <Html position={[0, 21, 0]} center distanceFactor={25} zIndexRange={[10, 0]}>
          <div className="glass-panel px-3 py-1.5 rounded-xl border border-cyan-400/80 shadow-2xl flex items-center gap-2 text-xs font-bold text-cyan-300">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse glow-cyan" />
            <span>BACKGROUND CITY CORE (Z = -16)</span>
          </div>
        </Html>
      </group>

      {/* Procedural City Buildings */}
      {buildings.map((bldg) => (
        <group key={bldg.id} position={[bldg.x, 0, bldg.z]}>
          <mesh position={[0, bldg.height / 2, 0]}>
            <boxGeometry args={[bldg.width, bldg.height, bldg.depth]} />
            <meshStandardMaterial
              color={bldg.color}
              emissive={bldg.color}
              emissiveIntensity={0.2}
              roughness={0.2}
              metalness={0.8}
            />
          </mesh>

          <mesh position={[0, bldg.height + 0.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 1, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}


      {/* =========================================================
          FOREGROUND POP-OUT LAYER 2: SPATIAL UI (Z > 0, FLOATING OUT IN FRONT OF MONITOR)
          ========================================================= */}
      
      {/* Pop-Out Element 1: Left Floating Cyber Ring (Z = +12) */}
      <group position={[-11, 5, 12]}>
        {/* Laser Projection Line connecting Z=0 screen plane to Z=+12 pop-out element */}
        <mesh position={[0, 0, -6]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 12, 8]} />
          <meshBasicMaterial color="#00f3ff" transparent opacity={0.6} />
        </mesh>

        <mesh>
          <torusGeometry args={[1.8, 0.1, 16, 100]} />
          <meshBasicMaterial color="#00f3ff" />
        </mesh>

        <Html position={[0, 2.4, 0]} center distanceFactor={18} zIndexRange={[30, 0]}>
          <div className="glass-panel p-3.5 rounded-2xl border-2 border-cyan-400 glow-cyan bg-cyan-950/95 text-xs font-bold text-cyan-200 shadow-2xl flex flex-col gap-1 min-w-[200px]">
            <div className="flex items-center gap-2 text-cyan-300">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse glow-cyan" />
              <span>✨ POP-OUT UI (Z = +12)</span>
            </div>
            <p className="text-[10px] font-mono text-cyan-200">
              Floating 12 units OUT in front of monitor plane!
            </p>
          </div>
        </Html>
      </group>

      {/* Pop-Out Element 2: Right Floating Crystal Node (Z = +14) */}
      <group position={[11, 4, 14]}>
        {/* Laser Projection Line connecting Z=0 screen plane to Z=+14 pop-out element */}
        <mesh position={[0, 0, -7]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 14, 8]} />
          <meshBasicMaterial color="#a855f7" transparent opacity={0.6} />
        </mesh>

        <mesh>
          <octahedronGeometry args={[1.5, 0]} />
          <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.8} />
        </mesh>

        <Html position={[0, 2.4, 0]} center distanceFactor={18} zIndexRange={[30, 0]}>
          <div className="glass-panel p-3.5 rounded-2xl border-2 border-purple-400 glow-purple bg-purple-950/95 text-xs font-bold text-purple-200 shadow-2xl flex flex-col gap-1 min-w-[200px]">
            <div className="flex items-center gap-2 text-purple-300">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse glow-purple" />
              <span>🔮 NEURAL METRICS (Z = +14)</span>
            </div>
            <p className="text-[10px] font-mono text-purple-200">
              Floating 14 units OUT towards your eyes!
            </p>
          </div>
        </Html>
      </group>

      {/* Pop-Out Element 3: Center Hologram Crown Ring (Z = +16) */}
      <group position={[0, 8, 16]}>
        <mesh>
          <torusGeometry args={[2.5, 0.08, 16, 100]} />
          <meshBasicMaterial color="#fbbf24" />
        </mesh>
        <Html position={[0, 0, 0]} center distanceFactor={16} zIndexRange={[40, 0]}>
          <div className="glass-panel px-4 py-2 rounded-2xl border-2 border-amber-400 glow-purple bg-amber-950/95 text-xs font-extrabold text-amber-200 shadow-2xl flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-pulse glow-cyan" />
            <span>🌟 EXTREME FOREGROUND HOLOGRAM (Z = +16)</span>
          </div>
        </Html>
      </group>
    </group>
  );
};
