import React, { useState } from 'react';
import { LucideShield, LucideSword, LucideZap, LucideCheck, LucideFlame, LucideSkull, LucidePlay } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface FighterSelectModalProps {
  isOpen: boolean;
  onStartGame: (fighter: typeof FIGHTERS[0], level: typeof COMBAT_LEVELS[0]) => void;
}

export interface Ability {
  name: string;
  type: 'speed' | 'shield' | 'accuracy';
  description: string;
}

export interface Fighter {
  id: string;
  name: string;
  role: string;
  hp: number;
  speed: number;
  color: string;
  icon: string;
  ability: Ability;
}

export const FIGHTERS: Fighter[] = [
  { 
    id: 'bilqis', 
    name: 'مقاتل بلقيس (مأرب)', 
    role: 'هجوم ثقيل ودفاع صلب', 
    hp: 120, 
    speed: 7.5, 
    color: '#f59e0b', 
    icon: '🛡️', 
    ability: { name: 'درع صلب', type: 'shield', description: 'يقلل الضرر بنسبة 50% لمدة 5 ثواني' } 
  },
  { 
    id: 'hadramawt', 
    name: 'صاعقة حضرموت (شبام)', 
    role: 'سرعة ودقة فائقة', 
    hp: 90, 
    speed: 9.2, 
    color: '#eab308', 
    icon: '⚡', 
    ability: { name: 'تركيز القناص', type: 'accuracy', description: 'تزيد دقة الإصابة بنسبة 100% لمدة 5 ثواني' } 
  },
  { 
    id: 'aden', 
    name: 'فارس صيرة (عدن)', 
    role: 'توازن بين السرعة والقوة', 
    hp: 100, 
    speed: 8.4, 
    color: '#3b82f6', 
    icon: '⚔️', 
    ability: { name: 'انطلاقة البرق', type: 'speed', description: 'تزيد السرعة بمقدار 50% لمدة 5 ثواني' } 
  },
];

export const COMBAT_LEVELS = [
  { id: 'lvl1', name: 'المستوى 1: باب اليمن', difficulty: 'تدريب', enemyCount: 6, desc: 'أزقة صنعاء القديمة.' },
  { id: 'lvl2', name: 'المستوى 2: عرش بلقيس', difficulty: 'متوسط', enemyCount: 12, desc: 'أعمدة مأرب التاريخية.' },
  { id: 'lvl3', name: 'المستوى 3: شبام حضرموت', difficulty: 'احترافي', enemyCount: 18, desc: 'حرب شوارع ناطحات الطين.' },
  { id: 'lvl4', name: 'المستوى 4: باتل رويال اليمن', difficulty: 'أسطوري', enemyCount: 25, desc: 'الملحمة الكبرى عبر الـ 22 محافظة.' },
];

export const FighterSelectModal: React.FC<FighterSelectModalProps> = ({ isOpen, onStartGame }) => {
  const [selectedFighter, setSelectedFighter] = useState(FIGHTERS[0]);
  const [selectedLevel, setSelectedLevel] = useState(COMBAT_LEVELS[1]);

  if (!isOpen) return null;

  const handleStart = () => {
    sounds.playTeleport();
    onStartGame(selectedFighter, selectedLevel);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-lg p-2 sm:p-4 select-none touch-auto">
      <div className="w-full max-w-4xl bg-slate-900/95 border-2 border-amber-500/60 rounded-3xl shadow-2xl text-right flex flex-col max-h-[96vh] h-auto overflow-hidden">
        
        {/* Top Header */}
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 sm:py-4 border-b border-amber-500/20 bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇾🇪</span>
            <div>
              <h2 className="text-amber-400 font-black text-sm sm:text-lg flex items-center gap-1.5">
                <span>محارب اليمن: اختيار البطل والمستوى</span>
                <LucideFlame className="w-4 h-4 text-amber-400 animate-pulse hidden sm:inline" />
              </h2>
              <p className="text-white/60 text-[10px] hidden sm:block">
                اختر مقاتلك المفضل ومستوى التحدي ثم اضغط بدء المعركة
              </p>
            </div>
          </div>

          {/* Quick Start Button in Header for Instant Mobile Start */}
          <button
            onClick={handleStart}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/30 transition-transform cursor-pointer"
          >
            <LucidePlay className="w-4 h-4 fill-current" />
            <span>بدء فوري ⚔️</span>
          </button>
        </div>

        {/* Scrollable / Responsive Content: 2 Columns on Landscape/Desktop */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4 custom-scrollbar">
          
          {/* Column 1: Fighters Selection */}
          <div className="flex flex-col">
            <label className="text-amber-300 text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>1. اختر بطل المعركة (Fighter):</span>
            </label>
            <div className="space-y-2">
              {FIGHTERS.map((f) => {
                const isSelected = selectedFighter.id === f.id;
                return (
                  <div
                    key={f.id}
                    onClick={() => {
                      sounds.playPickup();
                      setSelectedFighter(f);
                    }}
                    role="button"
                    tabIndex={0}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between relative cursor-pointer active:scale-[0.98] ${
                      isSelected 
                        ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/60 shadow-lg shadow-amber-500/10' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-white/10 flex items-center justify-center text-2xl shrink-0">
                        {f.icon}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-black text-xs sm:text-sm">{f.name}</h3>
                          {isSelected && (
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                              مختار ✓
                            </span>
                          )}
                        </div>
                        <p className="text-white/60 text-[10px]">{f.role}</p>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-amber-300/90 font-mono">
                          <span>❤️ صحة: {f.hp}</span>
                          <span>⚡ سرعة: {f.speed}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-left shrink-0 max-w-[110px] sm:max-w-[130px] bg-slate-950/60 p-2 rounded-xl border border-white/5">
                      <span className="text-amber-400 text-[10px] font-bold block">{f.ability.name}</span>
                      <span className="text-white/50 text-[9px] block leading-tight">{f.ability.description}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Column 2: Combat Levels Selection */}
          <div className="flex flex-col">
            <label className="text-indigo-300 text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span>2. اختر مستوى المعركة (Combat Level):</span>
            </label>
            <div className="space-y-2">
              {COMBAT_LEVELS.map((lvl) => {
                const isSelected = selectedLevel.id === lvl.id;
                return (
                  <div
                    key={lvl.id}
                    onClick={() => {
                      sounds.playPickup();
                      setSelectedLevel(lvl);
                    }}
                    role="button"
                    tabIndex={0}
                    className={`p-3 rounded-2xl border text-right transition-all flex items-center justify-between relative cursor-pointer active:scale-[0.98] ${
                      isSelected 
                        ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400/60 shadow-lg shadow-indigo-500/10' 
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-indigo-300">
                          {lvl.difficulty}
                        </span>
                        <h4 className="text-white font-bold text-xs sm:text-sm">{lvl.name}</h4>
                        {isSelected && (
                          <span className="bg-indigo-400 text-slate-950 text-[10px] font-extrabold px-1.5 py-0.5 rounded-md">
                            مختار ✓
                          </span>
                        )}
                      </div>
                      <p className="text-white/60 text-[10px]">{lvl.desc}</p>
                    </div>

                    <div className="text-left shrink-0 bg-slate-950/60 px-2.5 py-1.5 rounded-xl border border-white/5">
                      <span className="text-amber-400 text-[11px] font-mono font-bold block">
                        ⚔️ {lvl.enemyCount} جندي
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Sticky Bottom Bar - Always Visible on Screen */}
        <div className="p-3 sm:p-4 bg-slate-950 border-t border-amber-500/20 shrink-0">
          <button
            onClick={handleStart}
            className="w-full py-3.5 sm:py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 active:scale-[0.98] text-slate-950 font-black rounded-2xl text-sm sm:text-base flex items-center justify-center gap-2 sm:gap-3 shadow-xl shadow-amber-500/25 transition-all cursor-pointer"
          >
            <LucideSword className="w-5 h-5" />
            <span>
              بدء المعركة الآن بـ ({selectedFighter.name}) - {selectedLevel.name} ⚔️
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
