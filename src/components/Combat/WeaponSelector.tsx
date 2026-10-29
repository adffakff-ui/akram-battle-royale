import React from 'react';
import { Weapon, WEAPONS, TacticalUpgrade } from '../../data/weapons';
import { sounds } from '../../utils/soundEffects';

interface WeaponSelectorProps {
  currentWeapon: Weapon;
  unlockedWeapons: string[];
  activeUpgrades: TacticalUpgrade[];
  onSelectWeapon: (weapon: Weapon) => void;
  currentAmmo: number;
  maxAmmo: number;
  onReload?: () => void;
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  currentWeapon,
  unlockedWeapons,
  activeUpgrades,
  onSelectWeapon,
  currentAmmo,
  maxAmmo,
  onReload
}) => {
  return (
    <div className="fixed top-16 left-3 sm:top-20 sm:left-6 z-40 select-none flex flex-col items-start gap-2 pointer-events-auto">
      
      {/* Active Free Fire Tactical Buffs */}
      {activeUpgrades.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap justify-start max-w-[240px]">
          {activeUpgrades.map((up) => (
            <div
              key={up.id}
              className="bg-amber-950/80 border border-amber-500/50 backdrop-blur-md px-2 py-0.5 rounded-lg text-[9px] text-amber-300 font-bold flex items-center gap-1 shadow-md animate-in fade-in"
              title={up.description}
            >
              <span>{up.icon}</span>
              <span className="truncate max-w-[90px]">{up.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main Active Weapon Card (Free Fire Style) */}
      <div className="bg-slate-950/90 backdrop-blur-md border-2 border-amber-500/60 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3">
        {/* Weapon Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-amber-400/30"
          style={{ backgroundColor: `${currentWeapon.color}25` }}
        >
          {currentWeapon.icon}
        </div>

        {/* Info & Ammo */}
        <div className="text-right">
          <div className="text-xs font-black text-white flex items-center gap-1.5">
            <span>{currentWeapon.name}</span>
            <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 rounded uppercase">
              {currentWeapon.category}
            </span>
          </div>
          <div className="text-sm font-black text-amber-400 font-mono tabular-nums mt-0.5 flex items-center gap-1">
            <span>{currentAmmo}</span>
            <span className="text-white/40 text-xs font-normal">/ {maxAmmo}</span>
            {currentAmmo <= 5 && (
              <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 rounded animate-pulse">
                إعادة التلقيم!
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Free Fire Quick Weapon Slots (Slots 1, 2, 3, 4) */}
      <div className="flex items-center gap-1.5 bg-black/75 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
        {Object.values(WEAPONS).map((w, index) => {
          const isSelected = currentWeapon.id === w.id;
          const isUnlocked = unlockedWeapons.includes(w.id);

          return (
            <button
              key={w.id}
              onClick={() => {
                if (isUnlocked) {
                  try { sounds.playWeaponSwitch(); } catch {}
                  onSelectWeapon(w);
                }
              }}
              disabled={!isUnlocked}
              className={`relative px-2.5 py-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-b from-amber-500/30 to-orange-600/40 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/20'
                  : isUnlocked
                  ? 'bg-slate-900/60 border-white/10 hover:bg-white/10 opacity-90'
                  : 'bg-black/40 border-white/5 opacity-40 cursor-not-allowed'
              }`}
              title={isUnlocked ? `${w.name} - ضرر: ${w.damage}` : 'سلاح مقفل: احصل عليه من صناديق الإسقاط (Airdrop)'}
            >
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-slate-800 text-amber-300 font-mono text-[8px] font-black flex items-center justify-center border border-white/10">
                {index + 1}
              </span>
              <span className="text-base leading-none mb-0.5">{w.icon}</span>
              <span className="text-[8px] font-black text-white/90 whitespace-nowrap">
                {w.id.toUpperCase()}
              </span>

              {!isUnlocked && (
                <div className="absolute inset-0 bg-black/70 rounded-xl flex items-center justify-center text-[10px]">
                  🔒
                </div>
              )}
            </button>
          );
        })}
      </div>

    </div>
  );
};
