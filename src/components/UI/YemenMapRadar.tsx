import React, { useState } from 'react';
import { YEMEN_GOVERNORATES, Governorate } from '../../data/yemenGovernorates';
import { 
  LucideMap, 
  LucideCompass, 
  LucideMapPin, 
  LucideX, 
  LucideLocateFixed,
  LucideTarget,
  LucideSparkles
} from 'lucide-react';

interface YemenMapRadarProps {
  playerX: number;
  playerZ: number;
  currentGov: Governorate;
  exploredGovs: Set<string>;
  onTeleportToGov: (gov: Governorate) => void;
}

export const YemenMapRadar: React.FC<YemenMapRadarProps> = ({
  playerX,
  playerZ,
  currentGov,
  exploredGovs,
  onTeleportToGov,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGov, setSelectedGov] = useState<Governorate | null>(null);

  // Quick featured governorates
  const featuredIds = ['sanaa_capital', 'hadramawt', 'marib', 'socotra', 'aden'];

  // Map coordinates conversion to SVG viewBox 0-100%
  // Game world bounds: X from -65 to 100, Z from -85 to 80
  const minX = -65, maxX = 100;
  const minZ = -85, maxZ = 80;

  const toMapPercent = (x: number, z: number) => {
    const left = ((x - minX) / (maxX - minX)) * 100;
    const top = ((z - minZ) / (maxZ - minZ)) * 100;
    return { left: `${Math.max(5, Math.min(95, left))}%`, top: `${Math.max(5, Math.min(95, top))}%` };
  };

  const playerDot = toMapPercent(playerX, playerZ);

  return (
    <>
      {/* 1. رادار المحافظة الحالية والشارة العلوية (Current Governorate Badge) */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-40 pointer-events-auto">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-slate-900/85 hover:bg-slate-900 backdrop-blur-md border border-amber-500/40 hover:border-amber-400 px-5 py-2.5 rounded-full flex items-center gap-3 shadow-2xl transition-all active:scale-95 group text-right"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0">
            <LucideMapPin className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-extrabold text-sm tracking-wide">
                محافظة {currentGov.name}
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <span className="text-white/60 text-[10px] tracking-tight truncate max-w-[200px]">
              {currentGov.landmark}
            </span>
          </div>
          <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-md mr-1">
            خريطة اليمن 🇾🇪
          </span>
        </button>
      </div>

      {/* 2. النافذة الشاملة لخريطة اليمن بجميع محافظاتها (Yemen Interactive Map Modal) */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-4xl h-[90vh] max-h-[720px] bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-slate-950/50">
              <button
                onClick={() => setIsOpen(false)}
                className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <LucideX className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-white font-extrabold text-base flex items-center gap-2 justify-end">
                    <span>خريطة الجمهورية اليمنية - 22 محافظة</span>
                    <span className="text-lg">🇾🇪</span>
                  </h2>
                  <p className="text-white/50 text-xs">
                    استكشفت: {exploredGovs.size} من 22 محافظة • اضغط على أي منطقة للبدء بمهمتها
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <LucideMap className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>

            {/* أزرار الانتقال السريع للمحافظات الرئيسية (Quick Navigation Chips) */}
            <div className="px-6 py-2.5 bg-slate-950/80 border-b border-white/5 flex items-center justify-end gap-2 overflow-x-auto">
              <span className="text-white/40 text-[10px] font-bold shrink-0 ml-1">وجهات رئيسية:</span>
              {featuredIds.map((id) => {
                const gov = YEMEN_GOVERNORATES.find(g => g.id === id);
                if (!gov) return null;
                return (
                  <button
                    key={gov.id}
                    onClick={() => {
                      onTeleportToGov(gov);
                      setIsOpen(false);
                    }}
                    className="px-3 py-1 rounded-full text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
                    style={{
                      backgroundColor: currentGov.id === gov.id ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                      color: currentGov.id === gov.id ? '#0f172a' : '#ffffff'
                    }}
                  >
                    <span>{gov.name}</span>
                    <span className="text-[10px] opacity-70">📍</span>
                  </button>
                );
              })}
            </div>

            {/* Map Canvas Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              
              {/* تفاصيل المحافظة المحددة والمهمة (Side Panel) */}
              <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-white/10 p-5 bg-slate-950/70 overflow-y-auto order-2 md:order-1 flex flex-col justify-between">
                {selectedGov ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider" style={{ backgroundColor: `${selectedGov.color}25`, color: selectedGov.color }}>
                        {selectedGov.region === 'north' ? 'شمال اليمن' :
                         selectedGov.region === 'south' ? 'جنوب اليمن' :
                         selectedGov.region === 'east' ? 'شرق اليمن' :
                         selectedGov.region === 'west' ? 'غرب اليمن' :
                         selectedGov.region === 'island' ? 'أرخبيل بحري' : 'وسط اليمن'}
                      </span>
                      <h3 className="text-white font-black text-lg">
                        {selectedGov.name}
                      </h3>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                      <p className="text-amber-400 text-xs font-bold">{selectedGov.title}</p>
                      <p className="text-white/80 text-xs leading-relaxed">{selectedGov.description}</p>
                    </div>

                    {/* المهمة الميدانية للمحافظة */}
                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center justify-end gap-1">
                        <span>مهمة المحافظة ⚔️</span>
                        <LucideTarget className="w-3.5 h-3.5" />
                      </span>
                      <p className="text-white font-medium text-xs leading-relaxed">
                        {selectedGov.mission}
                      </p>
                    </div>

                    <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-0.5">
                        أبرز المعالم الأثرية
                      </span>
                      <p className="text-white text-xs font-medium">🏛️ {selectedGov.landmark}</p>
                    </div>

                    <button
                      onClick={() => {
                        onTeleportToGov(selectedGov);
                        setIsOpen(false);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                    >
                      <LucideLocateFixed className="w-4 h-4" />
                      <span>بدء مهمة {selectedGov.name} الآن</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-3 my-auto">
                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/30">
                      <LucideCompass className="w-6 h-6" />
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed">
                      اضغط على أي محافظة في الخريطة لعرض معالمها ومهمتها الخاصة والانتقال إليها فورياً!
                    </p>
                  </div>
                )}

                {/* شريط الإنجاز */}
                <div className="pt-4 border-t border-white/10 mt-4">
                  <div className="flex justify-between text-[11px] font-bold text-white/70 mb-1.5">
                    <span>{Math.round((exploredGovs.size / YEMEN_GOVERNORATES.length) * 100)}%</span>
                    <span>نسبة استكشاف اليمن</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${(exploredGovs.size / YEMEN_GOVERNORATES.length) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* رقعة الخريطة الجغرافية (Interactive SVG Map Canvas) */}
              <div className="flex-1 p-6 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden order-1 md:order-2 flex items-center justify-center">
                
                {/* شبكة الإحداثيات وخلفية الخريطة */}
                <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

                {/* مساحة الخريطة النسبية */}
                <div className="relative w-full h-full max-w-[620px] max-h-[520px]">
                  
                  {/* موقع اللاعب المباشر (Player Live Marker) */}
                  <div
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none"
                    style={{ left: playerDot.left, top: playerDot.top }}
                  >
                    <div className="relative flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/30 animate-ping absolute" />
                      <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg flex items-center justify-center text-[8px] font-black text-black">
                        P
                      </div>
                    </div>
                  </div>

                  {/* نقاط محافظات اليمن الـ 22 (Governorate Map Nodes) */}
                  {YEMEN_GOVERNORATES.map((gov) => {
                    const pos = toMapPercent(gov.x, gov.z);
                    const isExplored = exploredGovs.has(gov.id);
                    const isCurrent = currentGov.id === gov.id;
                    const isSelected = selectedGov?.id === gov.id;

                    return (
                      <button
                        key={gov.id}
                        onClick={() => setSelectedGov(gov)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 z-20 ${
                          isSelected ? 'scale-125 z-40' : 'hover:scale-115'
                        }`}
                        style={{ left: pos.left, top: pos.top }}
                      >
                        <div className="relative flex flex-col items-center">
                          {/* النقطة الجغرافية */}
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all shadow-md flex items-center justify-center ${
                              isCurrent 
                                ? 'bg-amber-400 border-white ring-4 ring-amber-400/30 scale-125' 
                                : isSelected 
                                ? 'bg-white border-amber-400 ring-2 ring-white/50' 
                                : isExplored 
                                ? 'bg-emerald-500 border-white/60' 
                                : 'bg-slate-700 border-white/30'
                            }`}
                            style={{ backgroundColor: isSelected ? '#ffffff' : gov.color }}
                          />

                          {/* اسم المحافظة */}
                          <span
                            className={`mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded transition-all whitespace-nowrap shadow-md ${
                              isCurrent
                                ? 'bg-amber-500 text-slate-950 scale-110 font-black'
                                : isSelected
                                ? 'bg-white text-slate-950 font-black'
                                : 'bg-slate-900/90 text-white/80 border border-white/10 group-hover:text-white'
                            }`}
                          >
                            {gov.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}

                  {/* علامة البحر الأحمر وبحر العرب */}
                  <div className="absolute left-2 top-1/2 text-white/20 text-xs font-bold tracking-widest -rotate-90 pointer-events-none">
                    البحر الأحمر
                  </div>
                  <div className="absolute right-4 bottom-4 text-white/20 text-xs font-bold tracking-widest pointer-events-none">
                    بحر العرب وخليج عدن
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
