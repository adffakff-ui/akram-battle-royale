import React, { useState } from 'react';
import { LucideTarget } from 'lucide-react';

interface ShootButtonProps {
  onShootStateChange: (isShooting: boolean) => void;
}

export const ShootButton: React.FC<ShootButtonProps> = ({ onShootStateChange }) => {
  const [active, setActive] = useState(false);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setActive(true);
    onShootStateChange(true);
  };

  const handleEnd = () => {
    setActive(false);
    onShootStateChange(false);
  };

  return (
    <div className="fixed bottom-12 right-12 z-50 select-none touch-none">
      <button
        onMouseDown={handleStart}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchEnd={handleEnd}
        className={`
          w-24 h-24 rounded-full flex items-center justify-center transition-all duration-75
          ${active 
            ? 'bg-rose-500 scale-90 shadow-inner' 
            : 'bg-rose-600/20 backdrop-blur-md border-4 border-rose-500/50 shadow-xl shadow-rose-900/20 active:scale-95'
          }
        `}
      >
        <div className={`
          w-16 h-16 rounded-full flex items-center justify-center border-2 
          ${active ? 'border-white/40 bg-rose-400' : 'border-rose-400/30 bg-rose-500/40'}
        `}>
          <LucideTarget className={`w-8 h-8 ${active ? 'text-white' : 'text-rose-200'}`} />
        </div>
      </button>
      
      <div className="mt-4 text-center">
        <span className="text-[10px] font-bold text-rose-500/60 uppercase tracking-widest">
          Primary Fire
        </span>
      </div>
    </div>
  );
};
