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
    try {
      sounds.playPickup();
    } catch {}
    onActivate();
    setTimer(cooldown);
  };

  return (
    <div 
      id="hero-active-skill-container" 
      className="fixed bottom-36 right-24 sm:bottom-40 sm:right-32 z-40 select-none touch-none pointer-events-auto flex flex-col items-center"
    >
      <button
        type="button"
        onClick={handleActivate}
        disabled={isOnCooldown}
        className={`
          w-16 h-16 sm:w-18 sm:h-18 rounded-full flex flex-col items-center justify-center transition-all duration-200 relative cursor-pointer border-2
          ${isOnCooldown 
            ? 'bg-slate-950/80 border-slate-700 opacity-60 cursor-not-allowed scale-95' 
            : 'bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-500 border-yellow-300 shadow-[0_0_25px_rgba(245,158,11,0.6)] active:scale-90 hover:scale-105'
          }
        `}
        title={`مهارة البطل الخارقة: ${ability.name}`}
      >
        {/* Inner Skill Ring */}
        <div className={`
          w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border transition-all
          ${isOnCooldown ? 'border-slate-600 bg-slate-900' : 'border-yellow-200/80 bg-black/40'}
        `}>
          {isOnCooldown ? (
            <span className="font-mono text-xs sm:text-sm font-black text-amber-300">
              {timer}s
            </span>
          ) : (
            <LucideZap className="w-6 h-6 text-yellow-200 animate-pulse" />
          )}
        </div>

        {/* Tactical Active Skill Label */}
        <span className="absolute -bottom-1 font-mono text-[7px] font-black uppercase tracking-wider text-black bg-yellow-400 px-1.5 py-0.2 rounded-full shadow">
          SKILL
        </span>
      </button>

      {/* Hero Skill Name */}
      <span className="mt-1 text-[8px] font-bold text-amber-300/90 tracking-tight bg-black/70 px-2 py-0.5 rounded-full border border-amber-500/30 truncate max-w-[80px]">
        {ability.name}
      </span>
    </div>
  );
};
