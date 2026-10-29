import React, { useEffect, useState } from 'react';
import { getLeaderboard } from '../../lib/firebase';
import { LucideTrophy, LucideX, LucideMedal, LucideLoader2 } from 'lucide-react';

export function LeaderboardModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [leaders, setLeaders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getLeaderboard().then((data: any[]) => {
        setLeaders(data);
        setLoading(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border border-amber-500/30 rounded-3xl p-6 shadow-2xl text-right flex flex-col max-h-[80vh]">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-white/10">
          <button onClick={onClose} className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors">
            <LucideX className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-white font-black text-xl">قائمة المتصدرين</h2>
            <LucideTrophy className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <LucideLoader2 className="w-8 h-8 text-amber-500 animate-spin" />
              <p className="text-white/40 text-xs font-bold">جاري تحميل أبطال اليمن...</p>
            </div>
          ) : leaders.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-white/40 font-bold">لا يوجد بيانات حتى الآن. كن أول مقاتل!</p>
            </div>
          ) : (
            leaders.map((leader, index) => (
              <div key={leader.uid} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                index === 0 ? 'bg-amber-500/10 border-amber-500/50' : 
                index === 1 ? 'bg-slate-300/10 border-slate-300/50' :
                index === 2 ? 'bg-orange-800/10 border-orange-800/50' :
                'bg-white/5 border-white/5'
              }`}>
                <div className="flex items-center gap-3">
                   <div className="text-right">
                     <p className="text-white font-bold text-sm">{leader.displayName}</p>
                     <p className="text-white/50 text-[10px]">المستوى {leader.level || 1} • {leader.totalWins || 0} فوز</p>
                   </div>
                   <div className="relative">
                    {leader.photoURL ? (
                      <img src={leader.photoURL} className="w-10 h-10 rounded-full border-2 border-white/10" alt="P" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center text-white/50 text-xs">
                        {leader.displayName[0]}
                      </div>
                    )}
                    {index < 3 && (
                      <div className="absolute -top-2 -left-2">
                        <LucideMedal className={`w-5 h-5 ${
                          index === 0 ? 'text-amber-400' : index === 1 ? 'text-slate-300' : 'text-orange-600'
                        }`} />
                      </div>
                    )}
                   </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-amber-400 font-black text-lg">{leader.totalKills}</span>
                  <span className="text-white/40 text-[8px] font-bold uppercase">إجمالي القتلى</span>
                </div>
              </div>
            ))
          )}
        </div>

        <button onClick={onClose} className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl font-bold text-sm transition-colors">
          إغلاق
        </button>
      </div>
    </div>
  );
}
