import React, { useState, useMemo } from 'react';
import { YEMEN_GOVERNORATES, Governorate } from '../../data/yemenGovernorates';
import { 
  LucideMap, 
  LucideCompass, 
  LucideMapPin, 
  LucideX, 
  LucideLocateFixed,
  LucideTarget,
  LucideMaximize2,
  LucideMinimize2
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
  const [viewMode, setViewMode] = useState<'radar' | 'fullscreen'>('radar');
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
    return { left: `${Math.max(0, Math.min(100, left))}%`, top: `${Math.max(0, Math.min(100, top))}%` };
  };

  const playerDot = toMapPercent(playerX, playerZ);

  // Radar specific: zoom in on player position
  const radarScale = 3; // Zoom factor for radar
  const radarPlayerPos = { left: '50%', top: '50%' };
  
  // Calculate offset for map inside radar to keep player centered
  const radarMapOffset = useMemo(() => {
    const pX = ((playerX - minX) / (maxX - minX)) * 100;
    const pZ = ((playerZ - minZ) / (maxZ - minZ)) * 100;
    return {
      left: `${50 - pX * radarScale}%`,
      top: `${50 - pZ * radarScale}%`,
      width: `${100 * radarScale}%`,
      height: `${100 * radarScale}%`
    };
  }, [playerX, playerZ, radarScale]);

  return (
    <>
      {/* 1. Small Circular Radar (Persistent in top-right) */}
      <div className={`fixed top-2 right-2 z-40 transition-all duration-300 ${viewMode === 'fullscreen' ? 'opacity-0 pointer-events-none scale-90' : 'opacity-100 scale-100'}`}>
        <button
          onClick={() => setViewMode('fullscreen')}
          className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 border-slate-900/80 bg-slate-950/90 shadow-2xl overflow-hidden group pointer-events-auto"
        >
          {/* Map background inside radar */}
          <div 
            className="absolute transition-all duration-100 ease-linear pointer-events-none"
            style={radarMapOffset}
          >
            {/* Radar Grid */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_14px]" />
            
            {/* All Governorate Dots on Radar */}
            {YEMEN_GOVERNORATES.map((gov) => {
              const pos = toMapPercent(gov.x, gov.z);
              return (
                <div
                  key={gov.id}
                  className="absolute w-1 h-1 rounded-full border border-white/20"
                  style={{ left: pos.left, top: pos.top, backgroundColor: gov.color }}
                />
              );
            })}
          </div>

          {/* Fixed Player Marker in center of radar */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="relative">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 animate-ping absolute -translate-x-1/2 -translate-y-1/2" />
              <div className="w-2 h-2 rounded-full bg-emerald-400 border border-white shadow-lg -translate-x-1/2 -translate-y-1/2" />
              <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[3px] border-l-transparent border-r-[3px] border-r-transparent border-b-[5px] border-b-emerald-400" />
            </div>
          </div>

          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/5 to-transparent animate-pulse pointer-events-none" />
          
          {/* Label Overlay on Hover */}
          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
            <LucideMaximize2 className="w-4 h-4 text-white" />
          </div>
        </button>
        
        {/* Radar Label (Very small) */}
        <div className="mt-1 text-right">
          <span className="text-[7px] font-black text-white/40 uppercase tracking-widest bg-slate-900/60 px-1 py-0.2 rounded backdrop-blur-sm">
            {currentGov.name}
          </span>
        </div>
      </div>

      {/* 2. Top-Center Status Badge - Refined to be less intrusive */}
      <div className={`fixed top-2 left-1/2 -translate-x-1/2 z-30 pointer-events-auto transition-all duration-300 ${viewMode === 'fullscreen' ? 'opacity-0 scale-90' : 'opacity-100 scale-100'}`}>
        <button
          onClick={() => setViewMode('fullscreen')}
          className="bg-slate-900/60 backdrop-blur-sm border border-white/5 px-3 py-1 rounded-full flex items-center gap-2 shadow-lg transition-all active:scale-95 group"
        >
          <div className="w-5 h-5 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
            <LucideMapPin className="w-3 h-3 text-amber-400" />
          </div>
          <span className="text-amber-400 font-bold text-[10px] truncate max-w-[80px]">{currentGov.name}</span>
          <span className="bg-amber-500/80 text-slate-950 font-black text-[7px] px-1.5 py-0.2 rounded-sm">YEMEN 🇾🇪</span>
        </button>
      </div>


      {/* 3. Fullscreen Interactive Map Modal */}
      {viewMode === 'fullscreen' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[90vh] max-h-[800px] bg-slate-900/95 border border-white/10 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-right">
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center bg-slate-950/50">
              <button
                onClick={() => setViewMode('radar')}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white transition-colors"
              >
                <LucideMinimize2 className="w-6 h-6" />
              </button>
              <div className="flex items-center gap-3">
                <div>
                  <h2 className="text-white font-extrabold text-base flex items-center gap-2 justify-end">
                    <span>خريطة الجمهورية اليمنية الكاملة</span>
                    <span className="text-lg">🇾🇪</span>
                  </h2>
                  <p className="text-white/50 text-xs">
                    استكشاف: {exploredGovs.size} من 22 • اختر وجهتك للانتقال السريع
                  </p>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <LucideMap className="w-5 h-5 text-amber-400" />
                </div>
              </div>
            </div>

            {/* Quick Navigation Chips */}
            <div className="px-6 py-2.5 bg-slate-950/80 border-b border-white/5 flex items-center justify-end gap-2 overflow-x-auto">
              {featuredIds.map((id) => {
                const gov = YEMEN_GOVERNORATES.find(g => g.id === id);
                if (!gov) return null;
                return (
                  <button
                    key={gov.id}
                    onClick={() => {
                      onTeleportToGov(gov);
                      setViewMode('radar');
                    }}
                    className="px-3 py-1.5 rounded-full text-[11px] font-bold transition-all shrink-0 flex items-center gap-1.5 active:scale-95"
                    style={{
                      backgroundColor: currentGov.id === gov.id ? '#f59e0b' : 'rgba(255,255,255,0.06)',
                      color: currentGov.id === gov.id ? '#0f172a' : '#ffffff'
                    }}
                  >
                    <span>{gov.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Map Canvas Body */}
            <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
              
              {/* Detail Side Panel */}
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
                      <h3 className="text-white font-black text-lg">{selectedGov.name}</h3>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 space-y-1.5">
                      <p className="text-amber-400 text-xs font-bold">{selectedGov.title}</p>
                      <p className="text-white/80 text-xs leading-relaxed">{selectedGov.description}</p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-1">
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center justify-end gap-1">
                        <span>المهمة الميدانية ⚔️</span>
                        <LucideTarget className="w-3.5 h-3.5" />
                      </span>
                      <p className="text-white font-medium text-xs leading-relaxed">{selectedGov.mission}</p>
                    </div>

                    <button
                      onClick={() => {
                        onTeleportToGov(selectedGov);
                        setViewMode('radar');
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all active:scale-95"
                    >
                      <LucideLocateFixed className="w-4 h-4" />
                      <span>انتقال فوري إلى {selectedGov.name}</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center py-10 space-y-3 my-auto">
                    <div className="w-12 h-12 rounded-full bg-white/5 mx-auto flex items-center justify-center text-white/30">
                      <LucideCompass className="w-6 h-6" />
                    </div>
                    <p className="text-white/60 text-xs leading-relaxed">اضغط على أي محافظة لاستعراض تفاصيلها والبدء بمهمتها</p>
                  </div>
                )}

                {/* Progress Bar */}
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

              {/* Fullscreen Map Canvas */}
              <div className="flex-1 p-6 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-hidden order-1 md:order-2 flex items-center justify-center">
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] pointer-events-none" />

                <div className="relative w-full h-full max-w-[700px] max-h-[600px]">
                  {/* Player Live Marker on Full Map */}
                  <div
                    className="absolute z-30 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-none"
                    style={{ left: playerDot.left, top: playerDot.top }}
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/30 animate-ping absolute" />
                    <div className="w-4 h-4 rounded-full bg-emerald-400 border-2 border-white shadow-lg flex items-center justify-center text-[8px] font-black text-black">P</div>
                  </div>

                  {/* Governorate Map Nodes */}
                  {YEMEN_GOVERNORATES.map((gov) => {
                    const pos = toMapPercent(gov.x, gov.z);
                    const isCurrent = currentGov.id === gov.id;
                    const isSelected = selectedGov?.id === gov.id;

                    return (
                      <button
                        key={gov.id}
                        onClick={() => setSelectedGov(gov)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 group transition-all duration-200 z-20 ${isSelected ? 'scale-125 z-40' : 'hover:scale-110'}`}
                        style={{ left: pos.left, top: pos.top }}
                      >
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`w-3.5 h-3.5 rounded-full border-2 transition-all shadow-md ${isCurrent ? 'bg-amber-400 border-white ring-4 ring-amber-400/30' : isSelected ? 'bg-white border-amber-400' : 'bg-slate-700 border-white/30'}`}
                            style={{ backgroundColor: isSelected ? '#ffffff' : gov.color }}
                          />
                          <span className={`mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded transition-all whitespace-nowrap shadow-md ${isCurrent ? 'bg-amber-500 text-slate-950 font-black' : isSelected ? 'bg-white text-slate-950 font-black' : 'bg-slate-900/90 text-white/80 group-hover:text-white'}`}>
                            {gov.name}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
