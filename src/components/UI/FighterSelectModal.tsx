import React, { useState } from 'react';
import { 
  LucideShield, 
  LucideSword, 
  LucideZap, 
  LucideCheck, 
  LucideFlame, 
  LucidePlay, 
  LucideX, 
  LucideCrown, 
  LucideSparkles,
  LucideTrendingUp,
  LucideUsers,
  LucideCoins,
  LucideTarget,
  LucideHeart
} from 'lucide-react';
import { sounds } from '../../utils/soundEffects';
import { useForex } from '../../context/ForexContext';

export interface Ability {
  name: string;
  type: 'speed' | 'shield' | 'accuracy' | 'heal';
  description: string;
}

export interface Fighter {
  id: string;
  name: string;
  englishName: string;
  role: string;
  hp: number;
  speed: number;
  color: string;
  icon: string;
  avatarImg?: string;
  ability: Ability;
}

export interface CombatLevel {
  id: string;
  name: string;
  englishName: string;
  difficulty: string;
  enemyCount: number;
  govId: string;
  spawn: [number, number, number];
  desc: string;
  badge: string;
}

// Authentic Free Fire iconic characters
export const FIGHTERS: Fighter[] = [
  { 
    id: 'alok', 
    name: 'دي جي ألوك (DJ Alok)', 
    englishName: 'DJ ALOK',
    role: 'هالة الشفاء والسرعة الخارقة', 
    hp: 200, 
    speed: 8.8, 
    color: '#06b6d4', 
    icon: '🎧', 
    ability: { name: 'Drop The Beat', type: 'heal', description: 'يطلق هالة صوتية تعيد 50 HP وتزيد سرعة الركض 15%' } 
  },
  { 
    id: 'chrono', 
    name: 'كرونو (Chrono)', 
    englishName: 'CHRONO',
    role: 'سيد الحقل الكهرومغناطيسي', 
    hp: 200, 
    speed: 8.2, 
    color: '#3b82f6', 
    icon: '🛡️', 
    ability: { name: 'Time Turner', type: 'shield', description: 'ينشئ درع قبة فضائية يصد 600 ضرر من طلقات الأعداء' } 
  },
  { 
    id: 'kelly', 
    name: 'كيلي (Kelly The Swift)', 
    englishName: 'KELLY',
    role: 'العدو السريع الخارق', 
    hp: 190, 
    speed: 10.2, 
    color: '#eab308', 
    icon: '⚡', 
    ability: { name: 'Dash Sprint', type: 'speed', description: 'تزيد سرعة الانطلاق بنسبة 25% لإرباك الخصوم واللوت' } 
  },
  { 
    id: 'hayato', 
    name: 'هاياتو (Hayato Bushido)', 
    englishName: 'HAYATO',
    role: 'ساموراي بوشيدو الخارق', 
    hp: 210, 
    speed: 8.4, 
    color: '#ef4444', 
    icon: '⚔️', 
    ability: { name: 'Bushido', type: 'accuracy', description: 'يزيد اختراق دروع الأعداء بنسبة 35% لضربات قاتلة' } 
  },
  { 
    id: 'yemen_warrior', 
    name: 'صقر اليمن (Yemen Falcon)', 
    englishName: 'YEMEN FALCON',
    role: 'جنبية الصمود ومضاعفة أرباح الفوركس', 
    hp: 220, 
    speed: 8.5, 
    color: '#f59e0b', 
    icon: '🇾🇪', 
    ability: { name: 'جنبية الصمود', type: 'shield', description: 'درع حماية مضاعف ومكافأة +50% على أرباح تداول الفوركس' } 
  },
];

// Authentic Free Fire Maps & Modes
export const COMBAT_LEVELS: CombatLevel[] = [
  { 
    id: 'bermuda', 
    name: 'برمودا (Bermuda)', 
    englishName: 'BERMUDA ROYALE',
    difficulty: 'باتل رويال الكلاسيكي', 
    enemyCount: 16, 
    govId: 'sanaa_capital',
    spawn: [0, 2, 4],
    desc: 'خريطة فري فاير الأيقونية، معارك طاحنة في برج المراقبة والمصنع وأزقة باب اليمن.',
    badge: '🏝️'
  },
  { 
    id: 'kalahari', 
    name: 'كالاهاري (Kalahari Desert)', 
    englishName: 'KALAHARI',
    difficulty: 'صحراء الاشتباك المتوسط', 
    enemyCount: 12, 
    govId: 'marib',
    spawn: [25, 2, -6],
    desc: 'معارك قنص صحراوية سريعة بين تضاريس مأرب الرملية وعرش بلقيس.',
    badge: '🏜️'
  },
  { 
    id: 'purgatory', 
    name: 'المطهر (Purgatory City)', 
    englishName: 'PURGATORY',
    difficulty: 'حرب شوارع احترافية', 
    enemyCount: 18, 
    govId: 'hadramawt',
    spawn: [55, 2, -10],
    desc: 'اشتباكات عمودية حامية بين ناطحات السحاب الطينية في شبام حضرموت والجسور المعلقة.',
    badge: '🌋'
  },
  { 
    id: 'yemen_grand', 
    name: 'ملحمة اليمن الشاملة (22 محافظة)', 
    englishName: 'GRAND YEMEN ROYALE',
    difficulty: 'هيرويك أسطوري', 
    enemyCount: 24, 
    govId: 'aden',
    spawn: [12, 2, 58],
    desc: 'معركة البقاء للأقوى على امتداد قلعة صيرة وبحر العرب وجميع المعالم اليمنية.',
    badge: '👑'
  },
];

interface FighterSelectModalProps {
  isOpen: boolean;
  onStartGame: (fighter: Fighter, level: CombatLevel) => void;
  onClose?: () => void;
  selectedFighter: Fighter;
  onFighterChange: (fighter: Fighter) => void;
  selectedLevel: CombatLevel;
  onLevelChange: (level: CombatLevel) => void;
}

export const FighterSelectModal: React.FC<FighterSelectModalProps> = ({ 
  isOpen, 
  onStartGame,
  onClose,
  selectedFighter,
  onFighterChange,
  selectedLevel,
  onLevelChange
}) => {
  const { account: forexAccount } = useForex();
  const [teamMode, setTeamMode] = useState<'SOLO' | 'DUO' | 'SQUAD'>('SOLO');
  const [isMatchmaking, setIsMatchmaking] = useState(false);
  const [countdown, setCountdown] = useState(3);

  if (!isOpen) return null;

  const handleStart = () => {
    setIsMatchmaking(true);
    try {
      sounds.playFreeFireLogo();
    } catch {}

    let count = 3;
    setCountdown(count);
    const interval = setInterval(() => {
      count -= 1;
      setCountdown(count);
      if (count <= 0) {
        clearInterval(interval);
        setIsMatchmaking(false);
        try {
          sounds.playTeleport();
        } catch {}
        onStartGame(selectedFighter, selectedLevel);
      }
    }, 800);
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-2 sm:p-4 select-none"
      style={{ touchAction: 'pan-y' }}
    >
      {/* Free Fire Lobby Container */}
      <div className="w-full max-w-5xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-black/90 border-2 border-amber-500/60 rounded-2xl sm:rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.15)] text-right flex flex-col max-h-[96vh] h-auto overflow-hidden relative">
        
        {/* Glow Embers Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-yellow-400 to-orange-500" />

        {/* Free Fire Lobby Header */}
        <div className="flex items-center justify-between px-3 py-2 sm:px-6 sm:py-3 border-b border-amber-500/30 bg-slate-950/90 shrink-0">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl overflow-hidden border-2 border-amber-400 shadow-md shadow-amber-500/30 shrink-0 bg-black">
              <img src="/freefire_icon.png" alt="Free Fire" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded tracking-wider">
                  FREE FIRE MAX
                </span>
                <span className="text-amber-400 font-bold text-xs sm:text-sm">لوبي المعركة</span>
              </div>
              <p className="text-white/50 text-[10px] font-sans">v1.104.1 • باتل رويال وفوركس اليمن</p>
            </div>
          </div>

          {/* Currencies & Rank Bar */}
          <div className="flex items-center gap-2 sm:gap-3 text-xs">
            {/* Diamonds */}
            <div className="bg-slate-900/90 border border-cyan-500/40 px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="text-cyan-400 text-xs">💎</span>
              <span className="font-black text-cyan-300 font-mono text-xs">1,450</span>
            </div>

            {/* Gold */}
            <div className="bg-slate-900/90 border border-amber-500/40 px-2 sm:px-2.5 py-1 rounded-lg flex items-center gap-1.5">
              <span className="text-amber-400 text-xs">🪙</span>
              <span className="font-black text-amber-300 font-mono text-xs">28,400</span>
            </div>

            {/* Forex Equity Pill */}
            <div className="bg-emerald-950/60 border border-emerald-500/50 px-2 sm:px-2.5 py-1 rounded-lg hidden sm:flex items-center gap-1.5">
              <LucideTrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-black text-emerald-300 font-mono text-xs">
                ${forexAccount.equity.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            </div>

            {/* Heroic Rank Badge */}
            <div className="bg-gradient-to-r from-red-600 to-amber-600 text-white font-black text-[10px] sm:text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
              <LucideCrown className="w-3.5 h-3.5 text-yellow-300" />
              <span className="hidden sm:inline">هيرويك</span>
              <span className="text-yellow-300">★5</span>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors mr-1 cursor-pointer"
                title="إغلاق"
              >
                <LucideX className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Matchmaking Overlay if active */}
        {isMatchmaking && (
          <div className="absolute inset-0 z-50 bg-black/95 flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-4 border-amber-500/20 border-t-amber-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center font-black text-4xl text-amber-400">
                {countdown}
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-black text-amber-400 uppercase tracking-wider">MATCHMAKING...</h3>
              <p className="text-white/70 text-sm mt-1">جاري النزول بالمظلة إلى {selectedLevel.name} 🪂</p>
            </div>
          </div>
        )}

        {/* Main Lobby Body */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-4 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-4 custom-scrollbar">
          
          {/* Left Column: Heroes (5 cols) */}
          <div className="sm:col-span-6 lg:col-span-5 flex flex-col space-y-2.5">
            <div className="flex items-center justify-between text-amber-400 text-xs font-black">
              <span className="flex items-center gap-1">
                <LucideSparkles className="w-4 h-4 text-amber-400" />
                <span>اختر شخصية فري فاير (Characters):</span>
              </span>
              <span className="text-[10px] text-white/50">{selectedFighter.name}</span>
            </div>

            <div className="space-y-2 overflow-y-auto max-h-[50vh] sm:max-h-[58vh] pr-1 custom-scrollbar">
              {FIGHTERS.map((fighter) => {
                const isSelected = selectedFighter.id === fighter.id;
                return (
                  <div
                    key={fighter.id}
                    onClick={() => {
                      onFighterChange(fighter);
                      try { sounds.playWeaponSwitch(); } catch {}
                    }}
                    className={`p-3 rounded-2xl border-2 transition-all cursor-pointer relative ${
                      isSelected 
                        ? 'bg-gradient-to-l from-amber-500/20 via-slate-900 to-slate-900 border-amber-400 shadow-lg shadow-amber-500/20' 
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                          isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-slate-800 text-white'
                        }`}>
                          {fighter.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-black text-xs sm:text-sm">{fighter.name}</h4>
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                              {fighter.englishName}
                            </span>
                          </div>
                          <p className="text-white/60 text-[10px] leading-tight mt-0.5">{fighter.role}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0">
                          <LucideCheck className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </div>

                    {/* Skill Badge */}
                    <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <LucideZap className="w-3 h-3" />
                        <span>مهارة: {fighter.ability.name}</span>
                      </span>
                      <span className="text-white/70 text-[9px] line-clamp-1 max-w-[200px]">
                        {fighter.ability.description}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Maps & Match Settings (7 cols) */}
          <div className="sm:col-span-6 lg:col-span-7 flex flex-col space-y-3">
            
            {/* Team Mode Selector */}
            <div className="flex items-center justify-between bg-slate-950/80 p-2 rounded-xl border border-slate-800">
              <span className="text-white/70 text-xs font-bold flex items-center gap-1">
                <LucideUsers className="w-3.5 h-3.5 text-amber-400" />
                <span>نمط التشكيل:</span>
              </span>
              <div className="flex items-center gap-1">
                {(['SOLO', 'DUO', 'SQUAD'] as const).map(mode => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setTeamMode(mode)}
                    className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      teamMode === mode 
                        ? 'bg-amber-500 text-slate-950' 
                        : 'bg-slate-800 text-white/60 hover:text-white'
                    }`}
                  >
                    {mode === 'SOLO' ? 'فردي (Solo)' : mode === 'DUO' ? 'ثنائي (Duo)' : 'فرقة (Squad)'}
                  </button>
                ))}
              </div>
            </div>

            {/* Map Selection */}
            <div className="space-y-2">
              <span className="text-amber-400 text-xs font-black block">
                2. اختر خريطة المعركة (Battle Royale Map):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {COMBAT_LEVELS.map(level => {
                  const isSelected = selectedLevel.id === level.id;
                  return (
                    <div
                      key={level.id}
                      onClick={() => {
                        onLevelChange(level);
                        try { sounds.playWeaponSwitch(); } catch {}
                      }}
                      className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-amber-500/15 border-amber-400 shadow-md shadow-amber-500/20' 
                          : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-lg">{level.badge}</span>
                          <span className="text-[10px] font-black text-amber-400 font-mono px-2 py-0.5 rounded bg-amber-500/20">
                            {level.enemyCount} لاعب
                          </span>
                        </div>
                        <h4 className="text-white font-black text-xs sm:text-sm">{level.name}</h4>
                        <span className="text-[9px] text-amber-300 font-bold block">{level.difficulty}</span>
                        <p className="text-white/60 text-[10px] leading-relaxed mt-1 line-clamp-2">{level.desc}</p>
                      </div>

                      <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px]">
                        <span className="text-emerald-400 font-bold">✓ آمن للهبوط</span>
                        {isSelected && <span className="text-amber-400 font-black">محددة</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Summary Card */}
            <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/10 to-transparent p-3 rounded-xl border border-amber-500/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{selectedFighter.icon}</span>
                <div>
                  <span className="text-[10px] text-amber-300 block font-bold leading-none">تجهيز المعركة</span>
                  <span className="text-xs font-black text-white">{selectedFighter.name} • {selectedLevel.name}</span>
                </div>
              </div>
              <div className="text-left">
                <span className="text-[9px] text-white/50 block font-mono">طاقة الصحة القصوى</span>
                <span className="text-xs font-black text-emerald-400 font-mono">HP: {selectedFighter.hp} / EP: 200</span>
              </div>
            </div>

          </div>
        </div>

        {/* Free Fire Big Slanted Action Footer */}
        <div className="p-3 sm:px-6 sm:py-3.5 bg-slate-950 border-t border-amber-500/30 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-white/70 font-bold hidden sm:inline">
              اضغط على الزر الذهبي لبدء تجربة فري فاير فوراً
            </span>
            <span className="text-[10px] text-amber-400 font-black bg-amber-500/10 px-2 py-1 rounded">
              جاهز للهبوط 🪂
            </span>
          </div>

          {/* Authentic Free Fire Golden START Button */}
          <button
            type="button"
            onClick={handleStart}
            className="relative px-8 sm:px-12 py-3 sm:py-3.5 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black text-base sm:text-lg rounded-xl shadow-[0_0_25px_rgba(251,191,36,0.6)] transform active:scale-95 transition-all flex items-center gap-2 cursor-pointer border-2 border-yellow-200"
          >
            <LucidePlay className="w-5 h-5 fill-current" />
            <span className="tracking-wider">START / ابـــدأ ⚔️</span>
            <span className="absolute -top-2.5 -right-2 bg-red-600 text-white font-black text-[9px] px-2 py-0.5 rounded-full shadow animate-pulse">
              BOOYAH!
            </span>
          </button>
        </div>

      </div>
    </div>
  );
};
