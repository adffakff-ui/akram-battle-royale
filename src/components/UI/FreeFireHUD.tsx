import React from 'react';
import { 
  LucideCrosshair, 
  LucideShield, 
  LucidePlus, 
  LucideRotateCw, 
  LucideZap, 
  LucideSkull, 
  LucideTrendingUp,
  LucideCoins,
  LucideFlame,
  LucidePackage
} from 'lucide-react';
import { Weapon, TacticalUpgrade } from '../../data/weapons';
import { Fighter } from './FighterSelectModal';

interface FreeFireHUDProps {
  playerHealth: number;
  playerMaxHealth: number;
  ep: number;
  maxEp: number;
  armorLevel: number;
  helmetLevel: number;
  selectedFighter: Fighter;
  currentWeapon: Weapon;
  unlockedWeapons: string[];
  activeUpgrades: TacticalUpgrade[];
  currentAmmo: number;
  maxAmmo: number;
  glooWallCount: number;
  medkitCount: number;
  backpackCount: number;
  isScoped: boolean;
  onDeployGlooWall: () => void;
  onUseMedkit: () => void;
  onOpenBackpack: () => void;
  onToggleScope: () => void;
  onReload: () => void;
  onSelectWeapon: (weapon: Weapon) => void;
  defeatedCount: number;
  killFeed: Array<{ id: string; killer: string; victim: string; weapon: string; isHeadshot: boolean }>;
  forexEquity: number;
  floatingPnL: number;
  combatBonusActive: boolean;
  onOpenForex: () => void;
  onOpenLobby: () => void;
}

export const FreeFireHUD: React.FC<FreeFireHUDProps> = ({
  playerHealth,
  playerMaxHealth,
  ep,
  maxEp,
  armorLevel,
  helmetLevel,
  selectedFighter,
  currentWeapon,
  unlockedWeapons,
  activeUpgrades,
  currentAmmo,
  maxAmmo,
  glooWallCount,
  medkitCount,
  backpackCount,
  isScoped,
  onDeployGlooWall,
  onUseMedkit,
  onOpenBackpack,
  onToggleScope,
  onReload,
  onSelectWeapon,
  defeatedCount,
  killFeed,
  forexEquity,
  floatingPnL,
  combatBonusActive,
  onOpenForex,
  onOpenLobby
}) => {
  const hpPercent = Math.max(0, Math.min(100, (playerHealth / playerMaxHealth) * 100));
  const epPercent = Math.max(0, Math.min(100, (ep / maxEp) * 100));

  return (
    <div className="absolute inset-0 z-30 pointer-events-none select-none overflow-hidden">
      
      {/* 1. TOP HEADER: Kill Feed & Forex Currency Bar */}
      <div className="absolute top-2 left-3 right-3 sm:top-3 sm:left-6 sm:right-6 flex items-start justify-between">
        
        {/* Left: Free Fire Kill Feed */}
        <div className="flex flex-col gap-1.5 max-w-[280px]">
          {killFeed.slice(-3).map(kill => (
            <div 
              key={kill.id}
              className={`px-3 py-1 rounded-lg backdrop-blur-md text-[10px] font-black flex items-center gap-1.5 animate-in slide-in-from-left duration-200 border ${
                kill.isHeadshot 
                  ? 'bg-red-950/80 border-red-500/70 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.5)]' 
                  : 'bg-slate-900/80 border-amber-500/40 text-amber-200'
              }`}
            >
              <LucideSkull className={`w-3.5 h-3.5 ${kill.isHeadshot ? 'text-red-400 animate-pulse' : 'text-amber-400'}`} />
              <span className="text-white font-bold">{kill.killer}</span>
              <span className="text-[9px] text-white/50">[{kill.weapon}]</span>
              <span className="text-rose-400">{kill.victim}</span>
              {kill.isHeadshot && (
                <span className="bg-red-600 text-white text-[8px] font-black px-1 rounded">HEADSHOT</span>
              )}
            </div>
          ))}
        </div>

        {/* Center/Right: Score & Forex Market Status */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Forex Pill */}
          <button 
            type="button"
            onClick={onOpenForex}
            className={`px-3 py-1.5 rounded-xl border backdrop-blur-md flex items-center gap-2 cursor-pointer transition-transform active:scale-95 ${
              floatingPnL >= 0 
                ? 'bg-emerald-950/75 border-emerald-500/60 text-emerald-300' 
                : 'bg-rose-950/75 border-rose-500/60 text-rose-300'
            }`}
          >
            <LucideCoins className="w-3.5 h-3.5 text-amber-400" />
            <div className="text-right">
              <span className="text-[9px] text-white/60 block leading-none font-bold">محفظة الفوركس</span>
              <span className="text-xs font-black font-mono">
                ${forexEquity.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
            </div>
            {combatBonusActive && (
              <LucideFlame className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            )}
          </button>

          {/* Kills Badge */}
          <div className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-3 py-1.5 rounded-xl border border-yellow-300/40 shadow-lg flex items-center gap-1.5">
            <LucideSkull className="w-4 h-4 text-yellow-300" />
            <div className="text-center font-mono">
              <span className="text-[8px] text-yellow-200 block leading-none uppercase">KILLS</span>
              <span className="text-sm font-black leading-none">{defeatedCount}</span>
            </div>
          </div>

          {/* Lobby Switcher */}
          <button
            type="button"
            onClick={onOpenLobby}
            className="px-2.5 py-1.5 bg-slate-900/80 hover:bg-slate-800 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-black active:scale-95 transition-all cursor-pointer"
          >
            اللوبي ⚙️
          </button>
        </div>
      </div>

      {/* 2. SNIPER 4x SCOPE OVERLAY (Free Fire Reticle) */}
      {isScoped && (
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center">
          {/* Outer Vignette Darkening */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          
          {/* Circular Scope Lens */}
          <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full border-4 border-cyan-400/80 shadow-[0_0_80px_rgba(6,182,212,0.6)] flex items-center justify-center overflow-hidden bg-black/30">
            {/* Crosshairs Lines */}
            <div className="absolute w-full h-[1.5px] bg-cyan-400/80" />
            <div className="absolute h-full w-[1.5px] bg-cyan-400/80" />
            
            {/* Range Markings */}
            <div className="absolute w-24 h-24 rounded-full border border-cyan-400/40" />
            <div className="absolute w-44 h-44 rounded-full border border-dashed border-cyan-400/30" />
            
            {/* Center Red Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_10px_#ef4444] animate-pulse" />
            
            {/* Scope HUD Text */}
            <span className="absolute bottom-6 font-mono text-[10px] text-cyan-300 font-black tracking-widest">
              4X OPTICAL • AWM
            </span>
          </div>
        </div>
      )}

      {/* 3. TACTICAL ACTION BUTTONS: Gloo Wall, Medkit, Scope, Reload */}
      <div className="absolute bottom-24 right-4 sm:bottom-28 sm:right-8 flex flex-col items-end gap-3 pointer-events-auto">
        
        {/* Scope Toggle Button */}
        <button
          type="button"
          onClick={onToggleScope}
          className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all cursor-pointer active:scale-90 ${
            isScoped 
              ? 'bg-cyan-500 border-white text-slate-950 shadow-[0_0_20px_#06b6d4]' 
              : 'bg-slate-950/80 border-cyan-500/50 text-cyan-300 hover:border-cyan-400'
          }`}
          title="منظار القناص (Scope 4x)"
        >
          <LucideCrosshair className="w-6 h-6" />
        </button>

        {/* Gloo Wall Deploy Button (Iconic Free Fire Ice Wall) */}
        <button
          type="button"
          onClick={onDeployGlooWall}
          disabled={glooWallCount <= 0}
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer active:scale-90 ${
            glooWallCount > 0 
              ? 'bg-gradient-to-b from-cyan-500/40 to-blue-600/60 border-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.5)]' 
              : 'bg-slate-950/40 border-slate-700 opacity-40 cursor-not-allowed'
          }`}
          title="جدار الغلو الثلجي التكتيكي (Gloo Wall)"
        >
          <span className="text-2xl leading-none">🧊</span>
          <span className="text-[9px] font-black text-cyan-200 mt-0.5">غلو</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-cyan-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow">
            {glooWallCount}
          </span>
        </button>

        {/* Quick Medkit Button */}
        <button
          type="button"
          onClick={onUseMedkit}
          disabled={medkitCount <= 0 || playerHealth >= playerMaxHealth}
          className={`relative w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex flex-col items-center justify-center border-2 transition-all cursor-pointer active:scale-90 ${
            medkitCount > 0 
              ? 'bg-gradient-to-b from-emerald-500/30 to-green-700/50 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.4)]' 
              : 'bg-slate-950/40 border-slate-700 opacity-40 cursor-not-allowed'
          }`}
          title="إسعافات أولية (+75 HP)"
        >
          <span className="text-xl leading-none">💉</span>
          <span className="text-[8px] font-black text-emerald-200">علاج</span>
          <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-emerald-400 text-slate-950 font-black text-[10px] flex items-center justify-center shadow">
            {medkitCount}
          </span>
        </button>

        {/* Reload Button */}
        <button
          type="button"
          onClick={onReload}
          className="w-11 h-11 rounded-xl bg-slate-950/80 border border-amber-500/40 text-amber-300 flex items-center justify-center hover:bg-slate-800 active:scale-90 transition-all cursor-pointer"
          title="إعادة تلقيم الذخيرة (R)"
        >
          <LucideRotateCw className="w-5 h-5" />
        </button>
      </div>

      {/* 4. BOTTOM CENTER: Free Fire Authentic Dual Bar (EP + HP + Armor/Helmet) */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pointer-events-auto">
        <div className="bg-slate-950/90 backdrop-blur-md p-2.5 rounded-2xl border-2 border-amber-500/40 shadow-2xl flex flex-col gap-1.5">
          
          {/* Armor & Helmet Badges + Character Name */}
          <div className="flex items-center justify-between text-[10px] font-bold">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 font-black">{selectedFighter.name}</span>
              <span className="text-white/40">•</span>
              <span className="text-cyan-300 font-mono">درع {armorLevel}</span>
              <span className="text-yellow-300 font-mono">خوذة {helmetLevel}</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-emerald-400 font-black">
              <span>{Math.round(playerHealth)}</span>
              <span className="text-white/40">/</span>
              <span>{playerMaxHealth}</span>
            </div>
          </div>

          {/* Free Fire Yellow EP Bar (Energy Points) */}
          <div className="relative w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-amber-500/20">
            <div 
              className="h-full bg-gradient-to-r from-yellow-500 to-amber-400 transition-all duration-300 rounded-full"
              style={{ width: `${epPercent}%` }}
            />
          </div>

          {/* Free Fire Green HP Bar (Health Points) */}
          <div className="relative w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-emerald-500/30 p-0.5">
            <div 
              className="h-full bg-gradient-to-r from-emerald-600 via-green-500 to-teal-400 transition-all duration-200 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Bottom Indicators */}
          <div className="flex items-center justify-between text-[9px] text-white/50 font-mono">
            <span>EP: {Math.round(ep)} / {maxEp}</span>
            <span className="text-amber-400 font-bold tracking-widest uppercase">FF MAX ROYALE</span>
            <span>HP: {Math.round(playerHealth)} / {playerMaxHealth}</span>
          </div>

        </div>
      </div>

      {/* 5. BACKPACK BUTTON (Bottom Left - Matching Screenshot) */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <button
          type="button"
          onClick={onOpenBackpack}
          className="w-14 h-14 rounded-2xl bg-slate-900/80 border-2 border-amber-500/40 flex flex-col items-center justify-center text-amber-300 shadow-xl active:scale-90 transition-all cursor-pointer"
        >
          <span className="text-2xl">🎒</span>
          <span className="text-[8px] font-black uppercase mt-0.5">الحقيبة</span>
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
            {backpackCount}
          </span>
        </button>
      </div>

      {/* 6. INTERACTION BUTTONS (Far Left Center - Matching Screenshot) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 pointer-events-auto">
        {/* Loot/Box interaction */}
        <button className="w-12 h-12 rounded-full bg-black/60 border border-white/20 flex items-center justify-center text-white/80 active:scale-95">
          <LucidePackage className="w-6 h-6" />
        </button>
        {/* Healing/Medkit quick access */}
        <button 
          onClick={onUseMedkit}
          className="w-12 h-12 rounded-full bg-emerald-600/40 border border-emerald-400/60 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <LucidePlus className="w-6 h-6" />
          <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white text-[8px] font-black px-1 rounded-full">{medkitCount}</span>
        </button>
      </div>

    </div>
  );
};
