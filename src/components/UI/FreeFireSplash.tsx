import React, { useState } from 'react';
import { LucidePlay, LucideVolume2, LucideSparkles, LucideFlame, LucideTrendingUp } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface FreeFireSplashProps {
  onEnterLobby: () => void;
}

export const FreeFireSplash: React.FC<FreeFireSplashProps> = ({ onEnterLobby }) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlaySound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsPlayingAudio(true);
    try {
      sounds.playFreeFireLogo();
    } catch {}
    setTimeout(() => setIsPlayingAudio(false), 2600);
  };

  const handleEnter = () => {
    try {
      sounds.playFreeFireLogo();
    } catch {}
    onEnterLobby();
  };

  return (
    <div className="absolute inset-0 z-[110] bg-slate-950 flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-hidden animate-in fade-in duration-500">
      
      {/* Background Cyber/Fiery Radial Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600/20 via-orange-950/20 to-black pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Garena & PWA Badge */}
      <div className="w-full flex items-center justify-between z-10 max-w-lg">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[10px] px-2.5 py-1 rounded-md uppercase tracking-wider shadow">
            GARENA
          </span>
          <span className="text-white/60 text-xs font-mono">FREE FIRE MAX</span>
        </div>

        <button
          type="button"
          onClick={handlePlaySound}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
            isPlayingAudio 
              ? 'bg-amber-500 text-slate-950 border-white shadow-[0_0_15px_#f59e0b]' 
              : 'bg-slate-900/80 border-amber-500/40 text-amber-300 hover:bg-slate-800'
          }`}
          title="تشغيل صوت البداية الأيقوني لـ Free Fire (fflogo.wav)"
        >
          <LucideVolume2 className={`w-3.5 h-3.5 ${isPlayingAudio ? 'animate-bounce' : ''}`} />
          <span>{isPlayingAudio ? 'جاري التشغيل...' : 'صوت اللعبة 🎵'}</span>
        </button>
      </div>

      {/* Center Hero Logo & Fire Shield */}
      <div className="flex flex-col items-center gap-6 z-10 my-auto text-center">
        
        {/* Free Fire Icon Container */}
        <div className="relative group cursor-pointer" onClick={handleEnter}>
          <div className="absolute inset-0 bg-amber-500 rounded-[2.5rem] blur-2xl opacity-40 group-hover:opacity-75 transition-opacity duration-500 animate-pulse" />
          
          <div className="relative w-36 h-36 sm:w-48 sm:h-48 rounded-[2.5rem] overflow-hidden border-4 border-amber-400 shadow-[0_0_40px_rgba(245,158,11,0.5)] transform group-hover:scale-105 transition-transform duration-300 bg-black">
            <img src="/freefire_icon.png" alt="Free Fire" className="w-full h-full object-cover" />
          </div>

          <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 px-4 py-1 rounded-full font-black text-xs shadow-xl tracking-wider flex items-center gap-1.5 whitespace-nowrap">
            <LucideFlame className="w-3.5 h-3.5 fill-current" />
            <span>FREE FIRE MAX</span>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="space-y-2 mt-2">
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight uppercase flex items-center justify-center gap-2">
            <span>فري فاير مـاكـس</span>
          </h1>
          <p className="text-amber-400 text-xs sm:text-sm font-black tracking-widest uppercase">
            معركة الباتل رويال الكبرى & تداول الفوركس المباشر
          </p>
          <div className="flex items-center justify-center gap-2 text-[11px] text-white/60 font-sans">
            <span>🇸🇦 🇾🇪 اليمن والوطن العربي</span>
            <span>•</span>
            <span>جدار الغلو 🧊</span>
            <span>•</span>
            <span>بوياه BOOYAH! 👑</span>
          </div>
        </div>

        {/* Big Entry Button */}
        <button
          type="button"
          onClick={handleEnter}
          className="mt-4 px-10 sm:px-14 py-4 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-lg sm:text-xl rounded-2xl shadow-[0_0_35px_rgba(251,191,36,0.6)] transform active:scale-95 transition-all flex items-center gap-3 cursor-pointer border-2 border-yellow-200"
        >
          <LucidePlay className="w-6 h-6 fill-current" />
          <span>دخول اللوبي (TAP TO ENTER) ⚔️</span>
        </button>

      </div>

      {/* Bottom Loading Progress & Version */}
      <div className="w-full max-w-md flex flex-col items-center gap-3 z-10 text-center">
        <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500 animate-[loading_2s_ease-in-out_infinite]" />
        </div>
        
        <div className="flex items-center justify-between w-full text-[10px] text-white/40 font-mono">
          <span>SERVER: REGION MENA (الشرق الأوسط)</span>
          <span>v1.104.1 • Free Fire Engine</span>
        </div>
      </div>

    </div>
  );
};
