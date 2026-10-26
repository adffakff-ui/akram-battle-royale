import React, { useState } from 'react';
import { usePWAInstall } from './usePWAInstall';
import { LucideDownload, LucideSmartphone, LucideX } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5">
        {/* Direct APK Download Button */}
        <a
          href="/BattleRoyale.apk"
          download="BattleRoyale.apk"
          className="bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/40 px-3.5 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-bold transition-all active:scale-95 shadow-lg shadow-emerald-950/40"
          title="تحميل ملف APK المباشر للأندرويد"
        >
          <LucideDownload className="w-3.5 h-3.5 animate-bounce" />
          <span>تحميل APK (أندرويد)</span>
        </a>

        {/* Quick Install Option */}
        <button
          onClick={() => setShowModal(true)}
          className="bg-white/10 hover:bg-white/15 text-white/80 border border-white/15 px-3 py-1.5 rounded-full flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95"
          title="خيارات التثبيت على الهاتف"
        >
          <LucideSmartphone className="w-3.5 h-3.5 text-indigo-400" />
          <span className="hidden sm:inline">خيارات الهاتف</span>
        </button>
      </div>

      {/* Modal with instructions */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-slate-900 border border-white/10 p-6 shadow-2xl text-right">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setShowModal(false)}
                className="text-white/60 hover:text-white p-1"
              >
                <LucideX className="w-5 h-5" />
              </button>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>تثبيت اللعبة على هاتفك</span>
                <LucideSmartphone className="w-4 h-4 text-emerald-400" />
              </h3>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30">
                <p className="font-bold text-emerald-400 text-sm mb-1">الخيار 1: تحميل ملف APK وتثبيته</p>
                <p className="text-slate-300">
                  تم إنشاء ملف APK رسمي موقّع وجاهز للتثبيت. اضغط على زر التحميل أدناه:
                </p>
                <a
                  href="/BattleRoyale.apk"
                  download="BattleRoyale.apk"
                  className="mt-2.5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg transition-colors text-xs"
                >
                  <LucideDownload className="w-3.5 h-3.5" />
                  <span>تحميل ملف BattleRoyale.apk (502 KB)</span>
                </a>
              </div>

              <div className="p-3.5 rounded-xl bg-white/5 border border-white/10">
                <p className="font-bold text-indigo-400 text-sm mb-1">الخيار 2: التثبيت الفوري (PWA / Web)</p>
                <p className="text-slate-300">
                  {isIOS ? (
                    <>على iPhone/iPad: اضغط على زر <strong>المشاركة (Share)</strong> ثم <strong>إضافة للشاشة الرئيسية</strong>.</>
                  ) : (
                    <>على متصفح Chrome: اضغط على النقاط الثلاث (⋮) ثم اختر <strong>تثبيت التطبيق (Install App)</strong>.</>
                  )}
                </p>
                {isInstallable && (
                  <button
                    onClick={() => {
                      install();
                      setShowModal(false);
                    }}
                    className="mt-2.5 inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-xs"
                  >
                    <LucideDownload className="w-3.5 h-3.5" />
                    <span>تثبيت الآن في المتصفح</span>
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowModal(false)}
              className="mt-4 w-full rounded-xl bg-slate-800 py-2.5 text-xs font-bold text-white hover:bg-slate-700 transition-colors"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </>
  );
};
