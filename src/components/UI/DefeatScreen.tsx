import React from 'react';
import { LucideSkull, LucideRotateCcw, LucideHome, LucideFlame } from 'lucide-react';

interface DefeatScreenProps {
  kills: number;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const DefeatScreen: React.FC<DefeatScreenProps> = ({
  kills,
  onPlayAgain,
  onReturnToLobby
}) => {
  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 select-none">
      
      {/* Dark Red Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-rose-900/30 via-slate-950/60 to-transparent pointer-events-none" />

      {/* Main Defeat Card */}
      <div className="relative max-w-sm w-full bg-slate-950 p-6 sm:p-8 rounded-[2.5rem] text-center flex flex-col items-center gap-5 border-2 border-rose-500/50 shadow-[0_0_50px_rgba(244,63,94,0.3)]">
        
        <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500/50 flex items-center justify-center text-rose-500 animate-pulse">
          <LucideSkull className="w-10 h-10" />
        </div>

        <div>
          <h2 className="text-3xl font-black text-rose-500 tracking-wide uppercase">
            انتهت المعركة
          </h2>
          <p className="text-white/60 text-xs mt-1">
            حظاً أوفر! تم القضاء عليك في ساحة النزال
          </p>
        </div>

        {/* Stats */}
        <div className="w-full bg-slate-900/80 p-3 rounded-2xl border border-white/5 flex items-center justify-around font-mono">
          <div>
            <span className="text-[10px] text-white/50 block">التصفيات (Kills)</span>
            <span className="text-lg font-black text-white">{kills}</span>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div>
            <span className="text-[10px] text-white/50 block">النقاط المكتسبة</span>
            <span className="text-lg font-black text-amber-400">+{kills * 100}</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="w-full flex flex-col gap-2.5 mt-2">
          <button
            type="button"
            onClick={onPlayAgain}
            className="w-full py-3.5 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black rounded-xl text-sm shadow-lg shadow-rose-900/30 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LucideRotateCcw className="w-4 h-4" />
            <span>إعادة المحاولة (TRY AGAIN)</span>
          </button>

          <button
            type="button"
            onClick={onReturnToLobby}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white/80 font-bold rounded-xl text-xs border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LucideHome className="w-4 h-4" />
            <span>العودة للوبي (LOBBY)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
