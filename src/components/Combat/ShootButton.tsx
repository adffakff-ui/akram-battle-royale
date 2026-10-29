import React, { useState } from 'react';
import { LucideTarget, LucideArrowUp, LucideChevronsDown } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface ShootButtonProps {
  onShootStateChange: (isShooting: boolean) => void;
  onJump?: () => void;
  onCrouch?: () => void;
}

export const ShootButton: React.FC<ShootButtonProps> = ({ 
  onShootStateChange,
  onJump,
  onCrouch
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
    <div id="primary-fire-container" className="fixed bottom-8 right-6 sm:bottom-12 sm:right-10 z-50 select-none touch-none flex items-end gap-3 pointer-events-auto">
      
      {/* Side Tactical Actions: Jump & Crouch */}
      <div className="flex flex-col gap-2.5 pb-2">
        {/* Jump Button */}
        <button
          type="button"
          onClick={() => {
            onJump?.();
            try { sounds.playTeleport(); } catch {}
          }}
          className="w-12 h-12 rounded-2xl bg-slate-900/85 border border-amber-500/40 text-amber-300 flex flex-col items-center justify-center active:scale-90 transition-transform shadow-lg cursor-pointer"
          title="قفز (Jump / Space)"
        >
          <LucideArrowUp className="w-5 h-5" />
          <span className="text-[7px] font-black uppercase">JUMP</span>
        </button>

        {/* Crouch Button */}
        <button
          type="button"
          onClick={() => {
            onCrouch?.();
            try { sounds.playWeaponSwitch(); } catch {}
          }}
          className="w-12 h-12 rounded-2xl bg-slate-900/85 border border-amber-500/40 text-amber-300 flex flex-col items-center justify-center active:scale-90 transition-transform shadow-lg cursor-pointer"
          title="انحناء (Crouch / C)"
        >
          <LucideChevronsDown className="w-5 h-5" />
          <span className="text-[7px] font-black uppercase">CROUCH</span>
        </button>
      </div>

      {/* Main Free Fire Iconic Fire Button */}
      <div className="flex flex-col items-center">
        <button
          id="primary-fire-button"
          onMouseDown={handleStart}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchEnd={handleEnd}
          className={`
            w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all duration-75 relative cursor-pointer
            ${active 
              ? 'bg-gradient-to-tr from-amber-600 via-red-600 to-yellow-500 scale-90 shadow-[0_0_40px_rgba(239,68,68,0.8)] border-4 border-yellow-300' 
              : 'bg-gradient-to-tr from-red-950/80 via-slate-950/90 to-amber-950/80 backdrop-blur-md border-4 border-amber-500/70 shadow-2xl shadow-red-950/40 active:scale-95'
            }
          `}
        >
          {/* Inner Crosshair Rings */}
          <div className={`
            w-16 h-16 sm:w-18 sm:h-18 rounded-full flex items-center justify-center border-2 transition-all
            ${active ? 'border-yellow-200 bg-red-500/40' : 'border-amber-400/40 bg-amber-500/20'}
          `}>
            <LucideTarget className={`w-9 h-9 ${active ? 'text-yellow-200 scale-110' : 'text-amber-400'}`} />
          </div>

          {/* Fire Embers Accent */}
          <span className="absolute -top-1 font-mono text-[8px] font-black tracking-widest text-yellow-300 bg-red-600 px-2 py-0.5 rounded-full uppercase shadow">
            FIRE
          </span>
        </button>
        
        <span className="mt-1 text-[8px] font-bold text-amber-300/80 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded-full border border-amber-500/30">
          إطلاق النار
        </span>
      </div>

    </div>
  );
};
