import React, { useState } from 'react';
import { LucideShield, LucideSword, LucideZap, LucideCheck, LucideFlame, LucideSkull } from 'lucide-react';
import { sounds } from '../../utils/soundEffects';

interface FighterSelectModalProps {
  isOpen: boolean;
  onStartGame: (fighter: { name: string; color: string; speed: number; hp: number }, level: { name: string; difficulty: string; enemyCount: number }) => void;
}

export const FIGHTERS = [
  { id: 'bilqis', name: 'مقاتل بلقيس (حارس مأرب)', role: 'هجوم ثقيل ودفاع صلب', hp: 120, speed: 7.5, color: '#f59e0b', icon: '🛡️' },
  { id: 'hadramawt', name: 'صاعقة حضرموت (قناص الصحراء)', role: 'سرعة ودقة فائقة', hp: 90, speed: 9.2, color: '#eab308', icon: '⚡' },
  { id: 'aden', name: 'فارس صيرة (بطل عدن)', role: 'توازن بين السرعة والقوة', hp: 100, speed: 8.4, color: '#3b82f6', icon: '⚔️' },
];

export const COMBAT_LEVELS = [
  { id: 'lvl1', name: 'المستوى 1: معركة باب اليمن', difficulty: 'سهل (تدريب)', enemyCount: 6, desc: 'تطهير أزقة صنعاء القديمة من الحراس.' },
  { id: 'lvl2', name: 'المستوى 2: حصار عرش بلقيس', difficulty: 'متوسط', enemyCount: 12, desc: 'مواجهة جنود مأرب عند الأعمدة التاريخية.' },
  { id: 'lvl3', name: 'المستوى 3: معركة الأحقاف', difficulty: 'صعب (احترافي)', enemyCount: 18, desc: 'حرب شوارع في ناطحات شبام حضرموت.' },
  { id: 'lvl4', name: 'المستوى 4: باتل رويال اليمن الشامل', difficulty: 'أسطوري (كل المحافظات)', enemyCount: 25, desc: 'الملحمة الكبرى عبر الـ 22 محافظة وسقطرى.' },
];

export const FighterSelectModal: React.FC<FighterSelectModalProps> = ({ isOpen, onStartGame }) => {
  const [selectedFighter, setSelectedFighter] = useState(FIGHTERS[0]);
  const [selectedLevel, setSelectedLevel] = useState(COMBAT_LEVELS[1]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200 select-none">
      <div className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl text-right flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🇾🇪</span>
            <span className="text-amber-400 font-extrabold text-xs bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
              اختر مقاتلك ومستوى المعركة
            </span>
          </div>
          <h2 className="text-white font-black text-lg sm:text-xl flex items-center gap-2">
            <span>اختيار المقاتلين والمستويات</span>
            <LucideFlame className="w-6 h-6 text-amber-400 animate-pulse" />
          </h2>
        </div>

        {/* 1. اختيار المقاتل (Fighter Selection) */}
        <div className="mb-6 space-y-3">
          <label className="text-white/70 text-xs font-bold uppercase tracking-wider block">
            1. اختر بطل المعركة (Fighter Class):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FIGHTERS.map((f) => {
              const isSelected = selectedFighter.id === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => {
                    sounds.playPickup();
                    setSelectedFighter(f);
                  }}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between relative overflow-hidden ${
                    isSelected 
                      ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-xs font-bold">
                      ✓
                    </div>
                  )}
                  <div>
                    <span className="text-2xl mb-2 block">{f.icon}</span>
                    <h3 className="text-white font-bold text-sm mb-1">{f.name}</h3>
                    <p className="text-white/50 text-[11px]">{f.role}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/10 flex justify-between text-[10px] text-amber-300 font-mono">
                    <span>⚡ سرعة: {f.speed}</span>
                    <span>🛡️ صحة: {f.hp}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. اختيار مستوى القتال (Combat Level Selection) */}
        <div className="mb-6 space-y-3">
          <label className="text-white/70 text-xs font-bold uppercase tracking-wider block">
            2. اختر مستوى القتال والمهمة (Combat Level):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {COMBAT_LEVELS.map((lvl) => {
              const isSelected = selectedLevel.id === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => {
                    sounds.playPickup();
                    setSelectedLevel(lvl);
                  }}
                  className={`p-4 rounded-2xl border text-right transition-all flex flex-col justify-between ${
                    isSelected 
                      ? 'bg-indigo-600/30 border-indigo-400 ring-2 ring-indigo-400/50 shadow-lg' 
                      : 'bg-white/5 border-white/10 hover:bg-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/10 text-indigo-300">
                      {lvl.difficulty}
                    </span>
                    <h3 className="text-white font-bold text-sm">{lvl.name}</h3>
                  </div>
                  <p className="text-white/60 text-xs mb-3">{lvl.desc}</p>
                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-amber-400 font-bold">
                    <span>⚔️ عدد الجنود الأعداء: {lvl.enemyCount} جندي</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={() => {
            sounds.playTeleport();
            onStartGame(selectedFighter, selectedLevel);
          }}
          className="w-full py-4 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-2xl text-base flex items-center justify-center gap-3 shadow-xl shadow-amber-500/20 transition-all active:scale-95"
        >
          <LucideSword className="w-5 h-5" />
          <span>بدء المعركة الآن مع {selectedFighter.name}</span>
        </button>

      </div>
    </div>
  );
};
