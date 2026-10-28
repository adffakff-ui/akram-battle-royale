import React, { useState, useEffect } from 'react';
import { LucideZap } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { Ability } from './FighterSelectModal';

interface AbilityButtonProps {
  ability: Ability;
  onActivate: () => void;
  cooldown: number;
}

export const AbilityButton: React.FC<AbilityButtonProps> = ({ ability, onActivate, cooldown }) => {
  const [isOnCooldown, setIsOnCooldown] = useState(false);
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    if (timer > 0) {
      setIsOnCooldown(true);
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsOnCooldown(false);
    }
  }, [timer]);

  const handleActivate = () => {
    if (isOnCooldown) return;
    sounds.playPickup();
    onActivate();
    setTimer(cooldown);
  };

  return (
    <div className="fixed bottom-12 left-12 z-50 select-none touch-none">
      <button
        onClick={handleActivate}
        disabled={isOnCooldown}
        className={`
          w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
          ${isOnCooldown 
            ? 'bg-slate-700/50 border-4 border-slate-600 opacity-50 cursor-not-allowed' 
            : 'bg-amber-600/40 backdrop-blur-md border-4 border-amber-500/50 shadow-xl shadow-amber-900/20 active:scale-95'
          }
        `}
      >
        <div className={`
          w-14 h-14 rounded-full flex items-center justify-center border-2 
          ${isOnCooldown ? 'border-slate-500 bg-slate-800' : 'border-amber-400/30 bg-amber-500/40'}
        `}>
          <LucideZap className={`w-6 h-6 ${isOnCooldown ? 'text-slate-400' : 'text-amber-200'}`} />
        </div>
      </button>
      
      <div className="mt-4 text-center">
        <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-amber-500/20">
          {isOnCooldown ? timer : ability.name}
        </span>
      </div>
    </div>
  );
};
