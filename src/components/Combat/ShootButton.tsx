import React, { useState } from 'react';
import { LucideArrowUp, LucideChevronsDown, LucideZap } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ShootButtonProps {
  onShootStateChange: (isShooting: boolean) => void;
  onJump?: () => void;
  onCrouch?: () => void;
  onProne?: () => void;
}

export const ShootButton: React.FC<ShootButtonProps> = ({ 
  onShootStateChange,
  onJump,
  onCrouch,
  onProne
}) => {
  const [active, setActive] = useState(false);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setActive(true);
    onShootStateChange(true);
    try {
      sounds.playShoot();
    } catch {}
  };

  const handleEnd = (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    setActive(false);
    onShootStateChange(false);
  };

  return (
    <div id="primary-fire-container" className="fixed bottom-8 right-6 sm:bottom-12 sm:right-10 z-50 select-none touch-none flex items-end gap-4 pointer-events-auto">
      
      {/* Side Actions Cluster */}
      <div className="flex flex-col gap-3 pb-2">
        {/* Prone Button (Matching screenshot) */}
        <button
          type="button"
          onClick={() => {
            onProne?.();
            try { sounds.playWeaponSwitch(); } catch {}
          }}
          className="w-11 h-11 rounded-full bg-black/60 border border-white/20 text-white/80 flex items-center justify-center active:scale-90 transition-transform shadow-lg cursor-pointer"
        >
          <span className="text-lg">🧎</span>
        </button>

        {/* Crouch Button */}
        <button
          type="button"
          onClick={() => {
            onCrouch?.();
            try { sounds.playWeaponSwitch(); } catch {}
          }}
          className="w-13 h-13 rounded-full bg-black/60 border border-white/30 text-white flex items-center justify-center active:scale-90 transition-transform shadow-lg cursor-pointer"
        >
          <LucideChevronsDown className="w-6 h-6" />
        </button>
      </div>

      {/* Main Cluster */}
      <div className="flex flex-col items-center gap-4">
        {/* Jump Button */}
        <button
          type="button"
          onClick={() => {
            onJump?.();
            try { sounds.playTeleport(); } catch {}
          }}
          className="w-13 h-13 rounded-full bg-black/60 border border-white/30 text-white flex items-center justify-center active:scale-90 transition-transform shadow-lg cursor-pointer"
        >
          <LucideArrowUp className="w-6 h-6" />
        </button>

        {/* Iconic FF Max Fire Button (Bullet Icon) */}
        <div className="relative">
          <button
            id="primary-fire-button"
            onMouseDown={handleStart}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchEnd={handleEnd}
            className={`
              w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-75 relative cursor-pointer border-4
              ${active 
                ? 'bg-red-600 scale-90 border-white shadow-[0_0_40px_rgba(239,68,68,0.8)]' 
                : 'bg-black/60 border-white/40 shadow-2xl active:scale-95'
              }
            `}
          >
            {/* Bullet Icon Overlay (Similar to screenshot) */}
            <div className={`
              w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center border-2 transition-all
              ${active ? 'border-white bg-red-500' : 'border-white/20 bg-white/5'}
            `}>
              <svg viewBox="0 0 24 24" className={`w-10 h-10 ${active ? 'fill-white' : 'fill-white/40'}`}>
                <path d="M12,2L12,2c-1.1,0-2,0.9-2,2v12c0,1.1,0.9,2,2,2s2-0.9,2-2V4C14,2.9,13.1,2,12,2z M12,22c-1.1,0-2-0.9-2-2h4C14,21.1,13.1,22,12,22z" />
              </svg>
            </div>
            
            {/* Speed/Recoil Visualizer */}
            <div className="absolute inset-0 rounded-full border border-white/5 animate-ping opacity-20" />
          </button>
          
          <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[8px] font-black text-white/60 uppercase tracking-widest bg-black/80 px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
            إطلاق النار
          </span>
        </div>
      </div>
    </div>
  );
};
