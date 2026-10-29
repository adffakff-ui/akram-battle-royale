import React, { useEffect } from 'react';
import { 
  LucideTrophy, 
  LucideSkull, 
  LucideFlame, 
  LucideCoins, 
  LucideRotateCcw, 
  LucideHome,
  LucideTrendingUp,
  LucideStar
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface BooyahScreenProps {
  kills: number;
  damageDealt: number;
  forexGain: number;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const BooyahScreen: React.FC<BooyahScreenProps> = ({
  kills,
  damageDealt,
  forexGain,
  onPlayAgain,
  onReturnToLobby
}) => {
  useEffect(() => {
    try {
      sounds.playBooyah();
    } catch {}
  }, []);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500 select-none">
      
      {/* Golden Radial Aura Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/25 via-orange-600/10 to-transparent pointer-events-none" />

      {/* Main BOOYAH Card */}
      <div className="relative max-w-md w-full bg-gradient-to-b from-slate-900 via-slate-950 to-black p-6 sm:p-8 rounded-[2.5rem] text-center flex flex-col items-center gap-5 border-4 border-amber-400 shadow-[0_0_80px_rgba(251,191,36,0.4)]">
        
        {/* BOOYAH Header with Golden Wings */}
        <div className="relative flex flex-col items-center animate-bounce">
          <div className="flex items-center gap-3">
            <span className="text-3xl sm:text-4xl">👑</span>
            <span className="text-4xl sm:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 tracking-wider filter drop-shadow-[0_4px_10px_rgba(245,158,11,0.8)]">
              BOOYAH!
            </span>
            <span className="text-3xl sm:text-4xl">👑</span>
          </div>
          <span className="text-xs sm:text-sm font-black text-amber-300 tracking-widest uppercase mt-1">
            بــويــاه! نصر المعركة الحاسم
          </span>
        </div>

        {/* Rank Stars */}
        <div className="flex items-center gap-1.5 text-yellow-400">
          {[1, 2, 3, 4, 5].map((s) => (
            <LucideStar key={s} className="w-5 h-5 fill-current animate-pulse" />
          ))}
        </div>

        {/* Match Statistics Grid */}
        <div className="w-full grid grid-cols-2 gap-2.5">
          {/* Kills */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center shrink-0">
              <LucideSkull className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-white/50 block font-bold">التصفيات (Kills)</span>
              <span className="text-base font-black text-white font-mono">{kills}</span>
            </div>
          </div>

          {/* Damage */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <LucideFlame className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-white/50 block font-bold">إجمالي الضرر</span>
              <span className="text-base font-black text-white font-mono">{damageDealt}</span>
            </div>
          </div>

          {/* Rank Points */}
          <div className="bg-slate-900/80 p-3 rounded-2xl border border-white/10 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
              <LucideTrophy className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-white/50 block font-bold">نقاط التصنيف</span>
              <span className="text-base font-black text-cyan-400 font-mono">+55 RP</span>
            </div>
          </div>

          {/* Forex Spoils Credited */}
          <div className="bg-emerald-950/60 p-3 rounded-2xl border border-emerald-500/50 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <LucideTrendingUp className="w-5 h-5" />
            </div>
            <div className="text-right">
              <span className="text-[10px] text-emerald-300 block font-bold">غنائم الفوركس</span>
              <span className="text-base font-black text-emerald-400 font-mono">+${forexGain}</span>
            </div>
          </div>
        </div>

        {/* Free Fire Rewards Banner */}
        <div className="w-full bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 p-2.5 rounded-xl border border-amber-400/30 flex items-center justify-around">
          <div className="flex items-center gap-1.5">
            <span>💎</span>
            <span className="text-xs font-black text-cyan-300 font-mono">+50 الماس</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>🪙</span>
            <span className="text-xs font-black text-amber-300 font-mono">+1,200 ذهب</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-1">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black rounded-xl text-base shadow-[0_0_20px_rgba(251,191,36,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LucideRotateCcw className="w-5 h-5" />
            <span>معركة جديدة (PLAY AGAIN)</span>
          </button>

          <button
            type="button"
            onClick={onReturnToLobby}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white/80 font-bold rounded-xl text-xs border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LucideHome className="w-4 h-4" />
            <span>العودة إلى اللوبي (LOBBY)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
