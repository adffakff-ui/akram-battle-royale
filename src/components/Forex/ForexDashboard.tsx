import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  BarChart3, 
  DollarSign,
  AlertCircle,
  Zap,
  RefreshCw,
  ShieldCheck,
  Globe2,
  Coins,
  Swords,
  ChevronRight,
  Flame
} from 'lucide-react';
import { useForex } from '../../context/ForexContext';
import { PairInfo } from '../../services/forexService';

const NEWS_ITEMS = [
  "📈 البورصة العالمية: استقرار في مؤشر الدولار مع استيعاب الأسواق لبيانات التضخم الأخيرة.",
  "⚡ العملات المشفرة: بيتكوين تتداول قرب مستوياتها القياسية وسط تدفقات استثمارية قوية.",
  "🇾🇪 صنعاء وعدن: متابعة مستمرة لأسعار صرف الريال اليمني مقابل العملات الأجنبية في الأسواق المحلية.",
  "🥇 أسواق المعادن: الذهب يسجل ارتفاعات قياسية كملاذ آمن مفضل للمستثمرين.",
  "📊 بنك إنجلترا والبنك المركزي الأوروبي يراقبان وتيرة التعافي الاقتصادي ومستويات الفائدة.",
];

export const ForexDashboard: React.FC = () => {
  const {
    rates,
    marketPrices,
    supportedPairs,
    selectedPair,
    setSelectedPair,
    isLiveConnected,
    isLoadingRates,
    lastUpdated,
    account,
    trades,
    floatingPnL,
    combatBonusActive,
    combatBonusPercent,
    openTrade,
    closeTrade,
    refreshLiveRates,
    notificationMsg,
    clearNotification,
  } = useForex();

  const [lotSize, setLotSize] = useState<number>(0.1);
  const [activeTab, setActiveTab] = useState<'OPEN' | 'HISTORY'>('OPEN');
  const [priceHistoryMap, setPriceHistoryMap] = useState<Record<string, number[]>>({});

  // Current rate of selected pair
  const currentRate = rates[selectedPair.id] || {
    price: selectedPair.initialBasePrice,
    bid: selectedPair.initialBasePrice,
    ask: selectedPair.initialBasePrice,
    spreadPips: 1.2,
    change24h: 0.35,
    high24h: selectedPair.initialBasePrice * 1.01,
    low24h: selectedPair.initialBasePrice * 0.99,
  };

  // Keep a 30-point price history for charting
  useEffect(() => {
    const price = currentRate.price;
    setPriceHistoryMap(prev => {
      const existing = prev[selectedPair.id] || Array(25).fill(price);
      const updated = [...existing.slice(1), price];
      return { ...prev, [selectedPair.id]: updated };
    });
  }, [currentRate.price, selectedPair.id]);

  const activeHistory = priceHistoryMap[selectedPair.id] || Array(25).fill(currentRate.price);

  // Filter open vs closed positions
  const openTrades = useMemo(() => trades.filter(t => t.status === 'OPEN'), [trades]);
  const closedTrades = useMemo(() => trades.filter(t => t.status === 'CLOSED'), [trades]);

  // Margin calculation for preview
  const previewMargin = useMemo(() => {
    const notional = lotSize * selectedPair.contractSize * currentRate.price;
    return parseFloat((notional / account.leverage).toFixed(2));
  }, [lotSize, selectedPair, currentRate.price, account.leverage]);

  const handleExecute = async (type: 'BUY' | 'SELL') => {
    await openTrade(type, lotSize);
  };

  // SVG Area Line Chart Component
  const LivePriceChart = ({ data, color, decimals }: { data: number[], color: string, decimals: number }) => {
    if (!data || data.length < 2) return <div className="h-32" />;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = (max - min) || 0.0001;

    const points = data.map((val, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 90 - ((val - min) / range) * 75;
      return `${x},${y}`;
    }).join(' ');

    const isRising = data[data.length - 1] >= data[0];
    const chartColor = isRising ? '#10b981' : '#f43f5e';

    return (
      <div className="relative w-full h-36 flex flex-col justify-between">
        <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono tabular-nums px-1">
          <span>أعلى: {max.toFixed(decimals)}</span>
          <span className="text-amber-400 font-bold">● سعر حي: {data[data.length - 1]?.toFixed(decimals)}</span>
          <span>أدنى: {min.toFixed(decimals)}</span>
        </div>

        <svg viewBox="0 0 100 100" className="w-full h-24 overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`chart-grad-${selectedPair.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <polygon
            points={`0,100 ${points} 100,100`}
            fill={`url(#chart-grad-${selectedPair.id})`}
          />
          <polyline
            fill="none"
            stroke={chartColor}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
            className="transition-all duration-700"
          />
        </svg>

        <div className="flex justify-between items-center text-[9px] text-slate-500 font-sans px-1 border-t border-slate-800 pt-1">
          <span>دقيقة مضت</span>
          <span className="flex items-center gap-1 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
            تحديث فوري حي (Tick by Tick)
          </span>
          <span>الآن</span>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-200 overflow-y-auto pb-28 custom-scrollbar">
      
      {/* 1. Global News Ticker */}
      <div className="bg-amber-500 py-1.5 overflow-hidden whitespace-nowrap border-b border-amber-600 shadow-md">
        <div className="animate-[marquee_25s_linear_infinite] flex items-center gap-12 text-slate-950 font-black text-xs">
          {[...NEWS_ITEMS, ...NEWS_ITEMS].map((news, i) => (
            <span key={i} className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 fill-current" /> {news}
            </span>
          ))}
        </div>
      </div>

      {/* 2. Top Live Connection & Status Bar */}
      <div className="px-6 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-xl border border-emerald-500/20 font-bold text-[11px]">
            <Globe2 className="w-3.5 h-3.5" />
            <span>أسعار فوركس حية متصلة بالبورصة العالمية (Live Interbank)</span>
          </div>
          <span className="text-[10px] text-slate-400 hidden sm:inline">
            آخر مزامنة: {new Date(lastUpdated).toLocaleTimeString('ar-YE')}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {combatBonusActive && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 text-amber-300 px-3 py-1 rounded-xl border border-amber-500/30 font-black text-[11px] animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>مكافأة أرباح السوق: +{combatBonusPercent}% دروع للمقاتل في اللعبة!</span>
            </div>
          )}

          <button
            onClick={refreshLiveRates}
            disabled={isLoadingRates}
            className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[11px] border border-slate-700 active:scale-95 transition-all cursor-pointer"
            title="جلب أحدث أسعار العملات من خوادم السوق العالمية"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-amber-400 ${isLoadingRates ? 'animate-spin' : ''}`} />
            <span>{isLoadingRates ? 'جاري التحديث...' : 'تحديث فوري'}</span>
          </button>
        </div>
      </div>

      {/* 3. Real-Time Account Metrics (Affected by Market Fluctuations) */}
      <div className="p-6 bg-slate-900 border-b border-slate-800 grid grid-cols-2 md:grid-cols-5 gap-4 sticky top-0 z-20 backdrop-blur-md bg-opacity-95 shadow-xl">
        
        {/* Cash Balance */}
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
            <Wallet className="w-3 h-3 text-amber-500" /> الرصيد النقدي (Balance)
          </p>
          <h2 className="text-2xl font-black tracking-tight text-white tabular-nums font-jakarta">
            ${account.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <span className="text-[9px] text-slate-500">رصيد الصفقات المغلقة</span>
        </div>

        {/* Live Equity (Fluctuates dynamically with market prices!) */}
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
            <BarChart3 className="w-3 h-3 text-emerald-400" /> حقوق الملكية الحية (Equity)
          </p>
          <h2 className={`text-2xl font-black tracking-tight tabular-nums font-jakarta transition-colors duration-500 ${floatingPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            ${account.equity.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <span className="text-[9px] text-slate-400 font-bold flex items-center gap-1">
            {floatingPnL >= 0 ? '📈 يتأثر صعوداً بالسوق' : '📉 يتأثر هبوطاً بالسوق'}
          </span>
        </div>

        {/* Floating PnL */}
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
            <TrendingUp className="w-3 h-3 text-indigo-400" /> أرباح / خسائر السوق (PnL)
          </p>
          <h2 className={`text-2xl font-black tracking-tight tabular-nums font-jakarta ${floatingPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {floatingPnL >= 0 ? '+' : ''}${floatingPnL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <span className="text-[9px] text-slate-500 font-mono">
            {openTrades.length} صفقات مفتوحة حالياً
          </span>
        </div>

        {/* Free Margin */}
        <div className="space-y-1">
          <p className="text-[10px] text-slate-400 font-bold flex items-center gap-1 uppercase tracking-widest">
            <ShieldCheck className="w-3 h-3 text-cyan-400" /> الهامش الحر (Free Margin)
          </p>
          <h2 className="text-2xl font-black tracking-tight text-cyan-300 tabular-nums font-jakarta">
            ${account.freeMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h2>
          <span className="text-[9px] text-slate-500">الرافعة 1:{account.leverage}</span>
        </div>

        {/* Battle Earnings Linkage */}
        <div className="space-y-1 col-span-2 md:col-span-1 text-right bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/20">
          <p className="text-[10px] text-amber-400 font-bold flex items-center justify-end gap-1 uppercase tracking-widest">
            <Swords className="w-3 h-3 text-amber-400" /> غنائم معارك اليمن
          </p>
          <h2 className="text-xl font-black tracking-tight text-amber-400 tabular-nums font-jakarta">
            +${(account.totalCombatEarnings || 0).toLocaleString()}
          </h2>
          <span className="text-[9px] text-amber-300/80 font-bold block">مكتسبة من القتال 🇾🇪</span>
        </div>

      </div>

      {/* Main Grid Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">
        
        {/* Left 2 Columns: Order Execution & Market Action */}
        <div className="lg:col-span-2 space-y-6">

          {/* Pair Selector Tabs */}
          <div className="bg-slate-900 rounded-[2rem] p-5 border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                <Coins className="w-4 h-4 text-amber-500" /> اختر زوج التداول الحي:
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">
                ● أسعار بنكية فورية
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {supportedPairs.map(pair => {
                const isSelected = selectedPair.id === pair.id;
                const pairRate = rates[pair.id] || { price: pair.initialBasePrice };
                return (
                  <button
                    key={pair.id}
                    onClick={() => setSelectedPair(pair)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer active:scale-95 ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-lg shadow-amber-500/20 scale-105'
                        : 'bg-slate-800 text-slate-300 border-slate-700/60 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    <span>{pair.icon}</span>
                    <span>{pair.id}</span>
                    <span className="text-[10px] font-mono tabular-nums opacity-80">
                      {pairRate.price.toFixed(pair.decimals)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Instant Market Execution Card */}
          <div className="bg-slate-900 rounded-[2.5rem] p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

            {/* Pair Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{selectedPair.icon}</span>
                  <h3 className="text-2xl font-black tracking-tight text-white font-jakarta">
                    {selectedPair.name}
                  </h3>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    REAL-TIME LIVE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-bold mt-1">
                  السبريد الفعلي: {currentRate.spreadPips} Pips • العقد: {selectedPair.contractSize.toLocaleString()} {selectedPair.baseCurrency}
                </p>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-bold">التغير اليومي</span>
                  <span className="text-sm font-black text-emerald-400 font-jakarta">+0.48% 📈</span>
                </div>
                <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 block font-bold">الهامش المطلوب</span>
                  <span className="text-sm font-black text-amber-400 font-jakarta font-mono">${previewMargin}</span>
                </div>
              </div>
            </div>

            {/* Live Chart */}
            <div className="bg-slate-950/60 p-4 rounded-3xl border border-slate-800/80">
              <LivePriceChart data={activeHistory} color="#10b981" decimals={selectedPair.decimals} />
            </div>

            {/* Live Dual Bid / Ask Quotation Display */}
            <div className="grid grid-cols-2 gap-4">
              
              {/* SELL Box (Exits at Bid) */}
              <div className="p-5 rounded-2xl bg-rose-500/10 border-2 border-rose-500/30 text-center space-y-1 relative overflow-hidden group">
                <div className="flex items-center justify-center gap-1 text-[10px] font-black text-rose-400 uppercase tracking-widest">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>سعر البيع المباشر (BID)</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-rose-500 font-jakarta tabular-nums">
                  {currentRate.bid.toFixed(selectedPair.decimals)}
                </div>
                <p className="text-[9px] text-slate-400 font-medium">للرهان على هبوط السعر</p>
              </div>

              {/* BUY Box (Enters at Ask) */}
              <div className="p-5 rounded-2xl bg-emerald-500/10 border-2 border-emerald-500/30 text-center space-y-1 relative overflow-hidden group">
                <div className="flex items-center justify-center gap-1 text-[10px] font-black text-emerald-400 uppercase tracking-widest">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>سعر الشراء المباشر (ASK)</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-emerald-500 font-jakarta tabular-nums">
                  {currentRate.ask.toFixed(selectedPair.decimals)}
                </div>
                <p className="text-[9px] text-slate-400 font-medium">للرهان على صعود السعر</p>
              </div>

            </div>

            {/* Lot Size Selector */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-300">حجم العقد (Lot Size):</span>
                <span className="text-amber-400 font-black font-jakarta font-mono">{lotSize} Standard Lot</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[0.01, 0.05, 0.1, 0.5, 1.0, 2.0, 5.0].slice(0, 4).map(val => (
                  <button
                    key={val}
                    onClick={() => setLotSize(val)}
                    className={`py-2 rounded-xl text-xs font-black transition-all border cursor-pointer ${
                      lotSize === val
                        ? 'bg-white text-slate-950 border-white shadow-md'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'
                    }`}
                  >
                    {val} Lot
                  </button>
                ))}
              </div>
            </div>

            {/* Large Interactive Buy / Sell Execution Buttons */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <button
                onClick={() => handleExecute('SELL')}
                className="py-4 px-6 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-[0.98] text-white font-black rounded-2xl text-lg shadow-xl shadow-rose-900/30 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ArrowDownLeft className="w-5 h-5 stroke-[3]" />
                  <span>بيع (SELL)</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono font-normal">
                  @ {currentRate.bid.toFixed(selectedPair.decimals)}
                </span>
              </button>

              <button
                onClick={() => handleExecute('BUY')}
                className="py-4 px-6 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 active:scale-[0.98] text-white font-black rounded-2xl text-lg shadow-xl shadow-emerald-900/30 flex flex-col items-center justify-center gap-1 transition-all cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-5 h-5 stroke-[3]" />
                  <span>شراء (BUY)</span>
                </div>
                <span className="text-[10px] opacity-80 font-mono font-normal">
                  @ {currentRate.ask.toFixed(selectedPair.decimals)}
                </span>
              </button>
            </div>

            <p className="text-[10px] text-center text-slate-500">
              💡 كل صفقة تفتحها تؤثر تقلبات أسعارها الحقيقية مباشرة على حقوق ملكيتك (Equity) ورصيدك داخل اللعبة.
            </p>

          </div>

          {/* Active Positions & Trade History Tabs */}
          <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden border border-slate-800 shadow-2xl">
            <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('OPEN')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'OPEN' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الصفقات المفتوحة ({openTrades.length})
                </button>
                <button
                  onClick={() => setActiveTab('HISTORY')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === 'HISTORY' 
                      ? 'bg-amber-500 text-slate-950 shadow-md' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  سجل الأرباح والخسائر ({closedTrades.length})
                </button>
              </div>

              {activeTab === 'OPEN' && openTrades.length > 0 && (
                <span className={`text-xs font-black font-jakarta tabular-nums ${floatingPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  الإجمالي العائم: {floatingPnL >= 0 ? '+' : ''}${floatingPnL.toFixed(2)}
                </span>
              )}
            </div>

            <div className="divide-y divide-slate-800 max-h-96 overflow-y-auto custom-scrollbar">
              {activeTab === 'OPEN' ? (
                openTrades.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <AlertCircle className="w-8 h-8 mx-auto opacity-30 text-amber-500" />
                    <p className="text-sm font-bold">لا توجد صفقات مفتوحة حالياً</p>
                    <p className="text-xs text-slate-600">اختر زوجاً واضغط شراء أو بيع لبدء جني الأرباح</p>
                  </div>
                ) : (
                  openTrades.map(trade => {
                    const pairInfo = supportedPairs.find(p => p.id === trade.pair) || supportedPairs[0];
                    const rateObj = rates[trade.pair] || { price: trade.entryPrice, bid: trade.entryPrice, ask: trade.entryPrice };
                    const currentExit = trade.type === 'BUY' ? rateObj.bid : rateObj.ask;
                    const diff = trade.type === 'BUY' ? currentExit - trade.entryPrice : trade.entryPrice - currentExit;
                    
                    let liveProfit = 0;
                    if (trade.pair === 'USDJPY') {
                      liveProfit = (diff / currentExit) * trade.lotSize * pairInfo.contractSize;
                    } else {
                      liveProfit = diff * trade.lotSize * pairInfo.contractSize;
                    }
                    liveProfit = parseFloat(liveProfit.toFixed(2));

                    return (
                      <div key={trade.id} className="p-4 sm:p-5 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs ${
                            trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          }`}>
                            {trade.type}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-sm text-white">{trade.pair}</span>
                              <span className="text-[10px] text-slate-400 font-mono font-bold">{trade.lotSize} Lot</span>
                            </div>
                            <p className="text-[10px] text-slate-400 font-mono">
                              دخول: {trade.entryPrice.toFixed(pairInfo.decimals)} ➔ حالي: {currentExit.toFixed(pairInfo.decimals)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <div>
                            <span className="text-[9px] text-slate-500 block font-bold">الربح العائم</span>
                            <span className={`text-base font-black font-jakarta tabular-nums ${liveProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                              {liveProfit >= 0 ? '+' : ''}${liveProfit.toFixed(2)}
                            </span>
                          </div>

                          <button
                            onClick={() => closeTrade(trade.id)}
                            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-600 text-white font-bold text-xs border border-slate-700 hover:border-rose-500 active:scale-95 transition-all cursor-pointer"
                          >
                            إغلاق الصفقة
                          </button>
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                closedTrades.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 space-y-2">
                    <History className="w-8 h-8 mx-auto opacity-30 text-slate-600" />
                    <p className="text-sm font-bold">لا يوجد سجل صفقات مغلقة حتى الآن</p>
                  </div>
                ) : (
                  closedTrades.map(trade => (
                    <div key={trade.id} className="p-4 flex items-center justify-between hover:bg-slate-800/30 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                          {trade.type}
                        </span>
                        <span className="font-bold text-white">{trade.pair}</span>
                        <span className="text-slate-500 font-mono">({trade.lotSize} Lot)</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-black font-jakarta tabular-nums text-sm ${trade.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))
                )
              )}
            </div>
          </div>

        </div>

        {/* Right Sidebar: Game Integration & Market Education */}
        <div className="space-y-6">

          {/* Interactive In-Game Linkage Card */}
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-[2.5rem] p-6 text-slate-950 shadow-2xl relative overflow-hidden space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider bg-slate-950 text-amber-400 px-3 py-1 rounded-xl">
                تأثير الفوركس على اللعبة ⚔️
              </span>
              <Coins className="w-6 h-6 text-slate-950" />
            </div>

            <div className="space-y-2">
              <h4 className="text-xl font-black tracking-tight">اربط أرباح تداولك بالمعركة!</h4>
              <p className="text-xs font-bold leading-relaxed opacity-95">
                كل انتصار تحققه في محافظات اليمن الـ 22 يمنحك أموالاً حقيقية في رصيد الفوركس، وكل صفقة رابحة تمنح بطلك دروعاً وسرعة فائقة في ساحة القتال!
              </p>
            </div>

            <div className="bg-slate-950/20 p-3.5 rounded-2xl space-y-2 text-xs font-bold">
              <div className="flex justify-between items-center">
                <span>🎯 القضاء على عدو في المعركة:</span>
                <span className="font-black font-mono text-slate-950 bg-white/70 px-2 py-0.5 rounded-md">+$50 كاش</span>
              </div>
              <div className="flex justify-between items-center">
                <span>🏆 تحرير محافظة كاملة (فوز):</span>
                <span className="font-black font-mono text-slate-950 bg-white/70 px-2 py-0.5 rounded-md">+$500 كاش</span>
              </div>
              <div className="flex justify-between items-center">
                <span>🛡️ أرباح تداول إيجابية:</span>
                <span className="font-black text-slate-950 bg-white/70 px-2 py-0.5 rounded-md">+20% دروع وسرعة</span>
              </div>
            </div>

            <div className="pt-1">
              <span className="text-[10px] font-black block text-center opacity-80">
                🇾🇪 التداول الحقيقي يعزز اقتصاد المقاتل اليماني
              </span>
            </div>
          </div>

          {/* Smart AI Signals */}
          <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h4 className="font-black text-sm text-amber-400 flex items-center gap-1.5">
                <Zap className="w-4 h-4 fill-current" /> إشارات وتحليلات ذكية
              </h4>
              <span className="text-[9px] text-slate-400">تحليل فني آلي</span>
            </div>

            <div className="space-y-3">
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-white">EUR / USD</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400">
                    شراء مقترح (BUY)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  مؤشر القوة النسبية RSI يظهر تشبعاً بيعياً عند الدعم، فرصة ارتداد صعودي مواتية.
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>نسبة الثقة: 85%</span>
                  <button 
                    onClick={() => {
                      const pair = supportedPairs.find(p => p.id === 'EURUSD');
                      if (pair) setSelectedPair(pair);
                    }}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    تجهيز الصفقة ➔
                  </button>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-black text-xs text-white">BTC / USD</span>
                  <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-400">
                    جني أرباح (SELL)
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  مقاومة فنية شديدة عند مستويات القمة، توقع تصحيح سريع لجني الأرباح.
                </p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                  <span>نسبة الثقة: 78%</span>
                  <button 
                    onClick={() => {
                      const pair = supportedPairs.find(p => p.id === 'BTCUSD');
                      if (pair) setSelectedPair(pair);
                    }}
                    className="text-amber-400 font-bold hover:underline cursor-pointer"
                  >
                    تجهيز الصفقة ➔
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Educational Academy */}
          <div className="bg-slate-900 rounded-[2rem] p-6 border border-slate-800 shadow-xl space-y-3">
            <h4 className="font-black text-sm text-white flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-400" /> قواعد التداول الذهبية
            </h4>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside leading-relaxed">
              <li>لا تخاطر بأكثر من 2% من رأس مالك في الصفقة الواحدة.</li>
              <li>استخدم الرافعة المالية 1:100 بحكمة لتجنب الإغلاق الإجباري.</li>
              <li>راقب تقلبات السوق الحية واستفد من فروق الأسعار (Pips).</li>
            </ul>
          </div>

        </div>

      </div>

      {/* Floating Notification */}
      {notificationMsg && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-auto">
          <div className="px-5 py-3 rounded-2xl bg-slate-900/95 border-2 border-amber-500 text-amber-300 text-xs sm:text-sm font-bold shadow-2xl backdrop-blur-md flex items-center gap-2">
            <span>{notificationMsg}</span>
            <button onClick={clearNotification} className="text-slate-400 hover:text-white ml-2 text-xs">✕</button>
          </div>
        </div>
      )}

    </div>
  );
};
