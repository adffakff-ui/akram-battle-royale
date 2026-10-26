import React from 'react';

interface HealthBarProps {
  current: number;
  max: number;
  label: string;
}

export const HealthBar: React.FC<HealthBarProps> = ({ current, max, label }) => {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div id="health-bar-container" className="bg-slate-950/75 backdrop-blur-md border border-white/10 p-4 rounded-2xl w-64 pointer-events-auto shadow-2xl">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{label}</span>
        <span className="text-white font-mono text-xs font-bold">{Math.round(current)} / {max}</span>
      </div>
      <div className="h-2.5 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
        <div 
          className={`h-full transition-all duration-300 ease-out ${
            percentage > 50 ? 'bg-emerald-500' : percentage > 25 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
