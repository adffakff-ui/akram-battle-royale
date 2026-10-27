import React from 'react';
import { LucideChevronUp } from 'lucide-react';

interface CompassProps {
  rotationX: number;
}

export const Compass: React.FC<CompassProps> = ({ rotationX }) => {
  // Normalize rotation to 0-360
  const normalizedRotation = ((rotationX % 360) + 360) % 360;
  
  // Directions for the compass bar
  const directions = [
    { label: 'N', angle: 0 },
    { label: '45', angle: 45 },
    { label: 'E', angle: 90 },
    { label: '135', angle: 135 },
    { label: 'S', angle: 180 },
    { label: '225', angle: 225 },
    { label: 'W', angle: 270 },
    { label: '315', angle: 315 },
    { label: 'N', angle: 360 },
  ];

  return (
    <div className="absolute top-16 left-1/2 -translate-x-1/2 w-64 h-8 bg-slate-900/60 backdrop-blur-sm border border-white/10 rounded-lg overflow-hidden flex items-center justify-center pointer-events-none z-30">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 text-amber-500 z-10">
        <LucideChevronUp className="w-4 h-4 translate-y-[-2px]" />
      </div>
      
      <div 
        className="flex items-center gap-12 transition-transform duration-100 ease-linear"
        style={{ transform: `translateX(${(180 - normalizedRotation) * 2}px)` }}
      >
        {directions.map((d, i) => (
          <div key={i} className="flex flex-col items-center shrink-0 w-8">
            <span className={`text-[10px] font-black ${d.label === 'N' || d.label === 'S' || d.label === 'E' || d.label === 'W' ? 'text-white' : 'text-white/40'}`}>
              {d.label}
            </span>
            <div className="w-[1px] h-2 bg-white/20 mt-0.5" />
          </div>
        ))}
        {/* Repeat some for smooth looping if needed, but for now simple translateX is fine */}
      </div>
    </div>
  );
};
