import React from 'react';
import { Gamepad2, LineChart, Trophy, Settings, Users } from 'lucide-react';
import { useForex } from '../../context/ForexContext';

interface TabNavigationProps {
  activeTab: 'GAME' | 'FOREX';
  onTabChange: (tab: 'GAME' | 'FOREX') => void;
  onOpenLeaderboard: () => void;
  onOpenSettings?: () => void;
  onOpenProfile?: () => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ 
  activeTab, 
  onTabChange, 
  onOpenLeaderboard,
  onOpenSettings,
  onOpenProfile
}) => {
  const { floatingPnL, trades } = useForex();
  const openCount = trades.filter(t => t.status === 'OPEN').length;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[60] bg-slate-900/90 backdrop-blur-lg border-t border-white/5 px-6 py-3 flex items-center justify-around">
      <button 
        onClick={() => onTabChange('GAME')}
        className={`flex flex-col items-center gap-1 transition-all cursor-pointer ${activeTab === 'GAME' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <Gamepad2 className={`w-6 h-6 ${activeTab === 'GAME' ? 'animate-pulse' : ''}`} />
        <span className="text-[10px] font-black uppercase tracking-widest">اللعبة</span>
      </button>

      <button 
        onClick={() => onTabChange('FOREX')}
        className={`flex flex-col items-center gap-1 transition-all cursor-pointer relative ${activeTab === 'FOREX' ? 'text-amber-500' : 'text-slate-500 hover:text-slate-300'}`}
      >
        <div className="relative">
          <LineChart className={`w-6 h-6 ${activeTab === 'FOREX' ? 'animate-pulse' : ''}`} />
          {openCount > 0 && (
            <span className={`absolute -top-1.5 -right-3 px-1 py-0.2 rounded-full text-[8px] font-black font-jakarta tabular-nums shadow-md ${
              floatingPnL >= 0 ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}>
              {floatingPnL >= 0 ? '+' : ''}${Math.round(floatingPnL)}
            </span>
          )}
        </div>
        <span className="text-[10px] font-black uppercase tracking-widest">فوركس</span>
      </button>

      <button 
        onClick={onOpenProfile}
        className="w-12 h-12 bg-amber-500 rounded-full -mt-10 border-4 border-slate-900 flex items-center justify-center shadow-xl shadow-amber-500/20 active:scale-95 transition-all"
      >
        <Users className="w-6 h-6 text-slate-950" />
      </button>

      <button 
        onClick={onOpenLeaderboard}
        className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-all"
      >
        <Trophy className="w-6 h-6" />
        <span className="text-[10px] font-black uppercase tracking-widest">الترتيب</span>
      </button>

      <button 
        onClick={onOpenSettings}
        className="flex flex-col items-center gap-1 text-slate-500 hover:text-slate-300 transition-all"
      >
        <Settings className="w-6 h-6" />
        <span className="text-[10px] font-black uppercase tracking-widest">إعدادات</span>
      </button>
    </div>
  );
};
