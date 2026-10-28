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
}

export const WeaponSelector: React.FC<WeaponSelectorProps> = ({
  currentWeapon,
  unlockedWeapons,
  activeUpgrades,
  onSelectWeapon,
  currentAmmo,
  maxAmmo
}) => {
  return (
    <div className="fixed bottom-36 right-6 sm:bottom-40 sm:right-10 z-40 select-none flex flex-col items-end gap-2 pointer-events-auto">
      
      {/* Active Upgrades Strip */}
      {activeUpgrades.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap justify-end max-w-[240px]">
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

      {/* Main Weapon Display & Ammo Card */}
      <div className="bg-slate-950/85 backdrop-blur-md border border-amber-500/40 rounded-2xl p-2.5 shadow-2xl flex items-center gap-3">
        {/* Current Ammo Indicator */}
        <div className="text-left font-mono">
          <div className="text-sm sm:text-base font-black text-amber-400 tabular-nums">
            {currentAmmo} <span className="text-white/40 text-xs font-normal">/ {maxAmmo}</span>
          </div>
          <div className="text-[9px] text-white/50 font-sans font-bold">
            {currentWeapon.name}
          </div>
        </div>

        {/* Current Weapon Big Icon */}
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-inner border border-white/10"
          style={{ backgroundColor: `${currentWeapon.color}25` }}
        >
          {currentWeapon.icon}
        </div>
      </div>

      {/* Quick Weapon Slots (Selector Bar) */}
      <div className="flex items-center gap-1.5 bg-black/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md">
        {Object.values(WEAPONS).map((w) => {
          const isSelected = currentWeapon.id === w.id;
          const isUnlocked = unlockedWeapons.includes(w.id);

          return (
            <button
              key={w.id}
              onClick={() => {
                if (isUnlocked) {
                  sounds.playWeaponSwitch();
                  onSelectWeapon(w);
                }
              }}
              disabled={!isUnlocked}
              className={`relative px-2.5 py-1.5 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer active:scale-95 ${
                isSelected
                  ? 'bg-amber-500/30 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                  : isUnlocked
                  ? 'bg-white/5 border-white/10 hover:bg-white/15 opacity-90'
                  : 'bg-black/30 border-white/5 opacity-40 cursor-not-allowed'
              }`}
              title={isUnlocked ? `${w.name} - ضرر: ${w.damage}` : 'سلاح مقفل: احصل عليه من الإسقاط الجوي'}
            >
              <span className="text-base leading-none mb-0.5">{w.icon}</span>
              <span className="text-[8px] font-bold text-white/80 whitespace-nowrap">
                {w.category === 'assault' ? 'كلاشينكوف' : w.category === 'sniper' ? 'قناص' : w.category === 'shotgun' ? 'شوزن' : 'قاذف'}
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
