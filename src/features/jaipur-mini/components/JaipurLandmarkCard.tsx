'use client';

import React from 'react';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface LandmarkProps {
  landmark: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    description: string;
    attribution: string;
    position3D?: [number, number, number];
    local3D?: [number, number, number];
  };
  onFocusLandmark?: () => void;
}

export const JaipurLandmarkCard: React.FC<LandmarkProps> = ({
  landmark,
  onFocusLandmark,
}) => {
  const coords = landmark.position3D || landmark.local3D || [0, 0, 0];
  const posX = Array.isArray(coords) ? coords[0] : 0;
  const posY = Array.isArray(coords) ? coords[1] : 0;
  const posZ = Array.isArray(coords) ? coords[2] : 0;

  const imageUrlMap: Record<string, string> = {
    'jaipur-hawa-mahal': '/images/hawa_mahal.jpg',
    'jaipur-amer-fort': '/images/amer_fort.jpg',
    'jaipur-city-palace': '/images/city_palace.jpg',
    'jaipur-jantar-mantar': '/images/city_palace.jpg',
    'jaipur-jal-mahal': '/images/hawa_mahal.jpg',
  };

  const imgUrl = imageUrlMap[landmark.id] || '/images/hawa_mahal.jpg';

  return (
    <div className="p-3.5 rounded-xl bg-gray-900/80 border border-spatial-border/30 hover:border-spatial-accent/50 transition-all flex flex-col gap-2 shadow-lg">
      <div className="flex gap-3 items-center">
        {/* Real Photographic Thumbnail */}
        <div className="w-16 h-14 rounded-lg overflow-hidden border border-spatial-border/50 shrink-0">
          <img src={imgUrl} alt={landmark.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex flex-col flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-white truncate">{landmark.name}</h4>
            <span className="text-[10px] text-cyan-300 font-mono">
              [{posX.toFixed(1)}, {posY.toFixed(1)}, {posZ.toFixed(1)}]
            </span>
          </div>
          <p className="text-[11px] text-gray-400 line-clamp-2 mt-0.5">{landmark.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-[10px] text-gray-500 font-mono">
        <span className="flex items-center gap-1">
          <Navigation className="w-3 h-3 text-cyan-400" />
          {landmark.latitude.toFixed(4)}° N, {landmark.longitude.toFixed(4)}° E
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={onFocusLandmark}
          className="text-[10px] px-2.5 py-1 flex items-center gap-1"
        >
          <MapPin className="w-3 h-3 text-amber-400" /> Fly to 3D
        </Button>
      </div>
    </div>
  );
};
