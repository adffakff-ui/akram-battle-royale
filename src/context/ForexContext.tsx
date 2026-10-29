import React, { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { 
  fetchLiveForexAndCryptoRates, 
  SUPPORTED_PAIRS, 
  PairInfo, 
  LiveRate, 
  buildLiveRate 
} from '../services/forexService';
import { useFirebase } from './FirebaseContext';
import { db } from '../lib/firebase';
import { 
  doc, 
  onSnapshot, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  addDoc, 
  serverTimestamp 
} from 'firebase/firestore';

export interface ForexAccount {
  userId?: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  leverage: number;
  currency: 'USD' | 'YER';
  totalCombatEarnings: number;
  updatedAt?: string;
}

export interface ForexTrade {
  id: string;
  tradeId: string;
  userId: string;
  pair: string;
  type: 'BUY' | 'SELL';
  lotSize: number;
  entryPrice: number;
  currentPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  profit: number;
  status: 'OPEN' | 'CLOSED';
  openTime: any;
  closeTime?: any;
}

interface ForexContextType {
  rates: Record<string, LiveRate>;
  marketPrices: Record<string, number>;
  supportedPairs: PairInfo[];
  selectedPair: PairInfo;
  setSelectedPair: (pair: PairInfo) => void;
  isLiveConnected: boolean;
  isLoadingRates: boolean;
  lastUpdated: number;
  account: ForexAccount;
  trades: ForexTrade[];
  floatingPnL: number;
  combatBonusActive: boolean;
  combatBonusPercent: number;
  openTrade: (type: 'BUY' | 'SELL', lots: number, sl?: number, tp?: number) => Promise<boolean>;
  closeTrade: (tradeId: string) => Promise<void>;
  addCombatSpoils: (amount: number, reason: string) => Promise<void>;
  refreshLiveRates: () => Promise<void>;
  notificationMsg: string | null;
  clearNotification: () => void;
}

const DEFAULT_ACCOUNT: ForexAccount = {
  balance: 10000,
  equity: 10000,
  margin: 0,
  freeMargin: 10000,
  leverage: 100,
  currency: 'USD',
  totalCombatEarnings: 0,
};

const LOCAL_STORAGE_KEY_ACCOUNT = 'yemen_warrior_forex_account_v2';
const LOCAL_STORAGE_KEY_TRADES = 'yemen_warrior_forex_trades_v2';

const ForexContext = createContext<ForexContextType | null>(null);

export const ForexProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useFirebase();

  // Selected trading pair
  const [selectedPair, setSelectedPair] = useState<PairInfo>(SUPPORTED_PAIRS[0]);

  // Market live state
  const [marketPrices, setMarketPrices] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    SUPPORTED_PAIRS.forEach(p => { init[p.id] = p.initialBasePrice; });
    return init;
  });

  // Rates derived directly from marketPrices via useMemo
  const rates = useMemo(() => {
    const newRates: Record<string, LiveRate> = {};
    SUPPORTED_PAIRS.forEach(p => {
      const price = marketPrices[p.id] || p.initialBasePrice;
      newRates[p.id] = buildLiveRate(p, price);
    });
    return newRates;
  }, [marketPrices]);

  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const [isLoadingRates, setIsLoadingRates] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  // Account and trades
  const [account, setAccount] = useState<ForexAccount>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_ACCOUNT);
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ACCOUNT;
  });

  const [trades, setTrades] = useState<ForexTrade[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TRADES);
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const clearNotification = useCallback(() => setNotificationMsg(null), []);

  const showNotification = useCallback((msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => {
      setNotificationMsg(prev => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // 1. Fetch real live rates from APIs
  const refreshLiveRates = useCallback(async () => {
    setIsLoadingRates(true);
    try {
      const liveData = await fetchLiveForexAndCryptoRates();
      setMarketPrices(prev => ({ ...prev, ...liveData }));
      setIsLiveConnected(true);
      setLastUpdated(Date.now());
      showNotification('✅ تم تحديث أسعار الفوركس الحية من البورصة العالمية مباشرة!');
    } catch (e) {
      console.warn('Could not refresh live rates', e);
    } finally {
      setIsLoadingRates(false);
    }
  }, [showNotification]);

  // Initial fetch on mount
  useEffect(() => {
    refreshLiveRates();
    const apiInterval = setInterval(() => {
      fetchLiveForexAndCryptoRates().then(liveData => {
        setMarketPrices(prev => ({ ...prev, ...liveData }));
        setIsLiveConnected(true);
        setLastUpdated(Date.now());
      }).catch(() => {});
    }, 45000);

    return () => clearInterval(apiInterval);
  }, [refreshLiveRates]);

  // 2. Micro-tick engine simulating interbank pip fluctuations around live real rates
  useEffect(() => {
    const tickInterval = setInterval(() => {
      setMarketPrices(prev => {
        const next = { ...prev };
        SUPPORTED_PAIRS.forEach(pair => {
          const current = next[pair.id] || pair.initialBasePrice;
          const deltaFactor = (Math.random() - 0.495) * (pair.id === 'BTCUSD' ? 0.0004 : 0.00015);
          const rawPrice = current * (1 + deltaFactor);
          next[pair.id] = parseFloat(rawPrice.toFixed(pair.decimals));
        });
        return next;
      });
      setLastUpdated(Date.now());
    }, 1500);

    return () => clearInterval(tickInterval);
  }, []);

  // 3. Dynamic Calculation: Calculate floating PnL and Equity in real time as market prices fluctuate
  const openTrades = useMemo(() => trades.filter(t => t.status === 'OPEN'), [trades]);

  const floatingPnL = useMemo(() => {
    return openTrades.reduce((sum: number, trade: ForexTrade) => {
      const pairInfo = SUPPORTED_PAIRS.find(p => p.id === trade.pair) || SUPPORTED_PAIRS[0];
      const rateObj = rates[trade.pair];
      if (!rateObj) return sum;

      // BUY exits at current Bid, SELL exits at current Ask
      const exitPrice = trade.type === 'BUY' ? rateObj.bid : rateObj.ask;
      const priceDiff = trade.type === 'BUY' ? exitPrice - trade.entryPrice : trade.entryPrice - exitPrice;
      
      let pnl = 0;
      if (trade.pair === 'USDJPY') {
        pnl = (priceDiff / exitPrice) * trade.lotSize * pairInfo.contractSize;
      } else {
        pnl = priceDiff * trade.lotSize * pairInfo.contractSize;
      }
      return sum + pnl;
    }, 0);
  }, [openTrades, rates]);

  // Dynamic live equity = Balance + Floating PnL
  const currentEquity = parseFloat((account.balance + floatingPnL).toFixed(2));
  
  const currentMargin = useMemo(() => {
    return openTrades.reduce((acc: number, t: ForexTrade) => {
      const pairInfo = SUPPORTED_PAIRS.find(p => p.id === t.pair) || SUPPORTED_PAIRS[0];
      const notional = t.lotSize * pairInfo.contractSize * (rates[t.pair]?.price || t.entryPrice);
      return acc + (notional / (account.leverage || 100));
    }, 0);
  }, [openTrades, rates, account.leverage]);

  const currentFreeMargin = parseFloat((currentEquity - currentMargin).toFixed(2));

  // Memoized live account object (no circular setState effect!)
  const liveAccount = useMemo<ForexAccount>(() => ({
    ...account,
    equity: currentEquity,
    margin: parseFloat(currentMargin.toFixed(2)),
    freeMargin: currentFreeMargin,
  }), [account, currentEquity, currentMargin, currentFreeMargin]);

  // Combat perk: If the player has positive trading profits (floatingPnL > 0), give them in-game perks!
  const combatBonusActive = floatingPnL > 10;
  const combatBonusPercent = combatBonusActive ? Math.min(50, Math.floor(floatingPnL / 10)) : 0;

  // 4. Firebase Sync (when user logs in)
  useEffect(() => {
    if (!user) return;

    // Sync account from Firestore
    const accountRef = doc(db, 'forexAccounts', user.uid);
    const unsubAccount = onSnapshot(accountRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as ForexAccount;
        setAccount(prev => ({
          ...prev,
          balance: data.balance ?? prev.balance,
          currency: data.currency ?? 'USD',
          leverage: data.leverage ?? 100,
        }));
      } else {
        // Initialize if not present
        setDoc(accountRef, {
          userId: user.uid,
          balance: 10000,
          equity: 10000,
          margin: 0,
          freeMargin: 10000,
          leverage: 100,
          currency: 'USD',
          totalCombatEarnings: 0,
          updatedAt: new Date().toISOString(),
        }).catch(err => console.warn('Initialize forexAccount error:', err));
      }
    }, (err) => {
      console.warn('Firestore onSnapshot account error:', err);
    });

    // Sync trades from Firestore
    const tradesQuery = query(collection(db, 'forexTrades'), where('userId', '==', user.uid));
    const unsubTrades = onSnapshot(tradesQuery, (snapshot) => {
      const cloudTrades: ForexTrade[] = snapshot.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          tradeId: data.tradeId || d.id,
          userId: data.userId,
          pair: data.pair,
          type: data.type,
          lotSize: data.lotSize,
          entryPrice: data.entryPrice,
          currentPrice: data.currentPrice || data.entryPrice,
          profit: data.profit || 0,
          status: data.status || 'OPEN',
          openTime: data.openTime,
          closeTime: data.closeTime,
        };
      });
      if (cloudTrades.length > 0) {
        setTrades(cloudTrades);
      }
    }, (err) => {
      console.warn('Firestore onSnapshot trades error:', err);
    });

    return () => {
      unsubAccount();
      unsubTrades();
    };
  }, [user]);

  // 5. Open Trade Action
  const openTrade = useCallback(async (
    type: 'BUY' | 'SELL', 
    lots: number, 
    sl?: number, 
    tp?: number
  ): Promise<boolean> => {
    const rateObj = rates[selectedPair.id];
    if (!rateObj) {
      showNotification('⚠️ تعذر جلب السعر المباشر للزوج حالياً');
      return false;
    }

    // Check margin requirements
    const notionalValue = lots * selectedPair.contractSize * rateObj.price;
    const requiredMargin = notionalValue / account.leverage;

    if (liveAccount.freeMargin < requiredMargin) {
      showNotification(`⚠️ الهامش المتاح غير كافٍ! يتطلب $${requiredMargin.toFixed(2)} متاح.`);
      return false;
    }

    // BUY enters at Ask, SELL enters at Bid
    const entryPrice = type === 'BUY' ? rateObj.ask : rateObj.bid;
    const tradeId = Math.random().toString(36).substring(2, 9);

    const newTrade: ForexTrade = {
      id: tradeId,
      tradeId,
      userId: user?.uid || 'guest_user',
      pair: selectedPair.id,
      type,
      lotSize: lots,
      entryPrice,
      currentPrice: entryPrice,
      profit: 0,
      status: 'OPEN',
      openTime: new Date().toISOString(),
      stopLoss: sl,
      takeProfit: tp,
    };

    // Update local state
    setTrades(prev => {
      const updated = [newTrade, ...prev];
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_TRADES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Cloud persistence
    if (user) {
      try {
        await addDoc(collection(db, 'forexTrades'), {
          tradeId,
          userId: user.uid,
          pair: selectedPair.id,
          type,
          lotSize: lots,
          entryPrice,
          currentPrice: entryPrice,
          profit: 0,
          status: 'OPEN',
          openTime: serverTimestamp(),
          stopLoss: sl || null,
          takeProfit: tp || null,
        });

        await updateDoc(doc(db, 'forexAccounts', user.uid), {
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firestore trade save error (offline mode used)', err);
      }
    }

    showNotification(`⚡ تم فتح صفقة ${type === 'BUY' ? 'شراء' : 'بيع'} على ${selectedPair.name} بحجم ${lots} لوت!`);
    return true;
  }, [rates, selectedPair, account, user, showNotification]);

  // 6. Close Trade Action
  const closeTrade = useCallback(async (tradeId: string) => {
    const trade = trades.find(t => t.id === tradeId || t.tradeId === tradeId);
    if (!trade || trade.status === 'CLOSED') return;

    const rateObj = rates[trade.pair];
    const pairInfo = SUPPORTED_PAIRS.find(p => p.id === trade.pair) || SUPPORTED_PAIRS[0];
    const exitPrice = rateObj ? (trade.type === 'BUY' ? rateObj.bid : rateObj.ask) : trade.entryPrice;
    
    const priceDiff = trade.type === 'BUY' ? exitPrice - trade.entryPrice : trade.entryPrice - exitPrice;
    let realizedProfit = 0;
    if (trade.pair === 'USDJPY') {
      realizedProfit = (priceDiff / exitPrice) * trade.lotSize * pairInfo.contractSize;
    } else {
      realizedProfit = priceDiff * trade.lotSize * pairInfo.contractSize;
    }
    realizedProfit = parseFloat(realizedProfit.toFixed(2));

    const updatedBalance = parseFloat((account.balance + realizedProfit).toFixed(2));

    // Update state
    setTrades(prev => {
      const updated = prev.map(t => {
        if (t.id === tradeId || t.tradeId === tradeId) {
          return {
            ...t,
            status: 'CLOSED' as const,
            currentPrice: exitPrice,
            profit: realizedProfit,
            closeTime: new Date().toISOString(),
          };
        }
        return t;
      });
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_TRADES, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setAccount(prev => {
      const nextAcc = {
        ...prev,
        balance: updatedBalance,
        equity: updatedBalance,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNT, JSON.stringify(nextAcc));
      } catch {}
      return nextAcc;
    });

    // Cloud update
    if (user) {
      try {
        await updateDoc(doc(db, 'forexAccounts', user.uid), {
          balance: updatedBalance,
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firestore close trade error', err);
      }
    }

    const profitBadge = realizedProfit >= 0 ? `ربح +$${realizedProfit}` : `خسارة -$${Math.abs(realizedProfit)}`;
    showNotification(`🏁 تم إغلاق الصفقة على ${trade.pair} بنتيجة (${profitBadge}). تم تحديث رصيدك.`);
  }, [trades, rates, account.balance, user, showNotification]);

  // 7. In-game Combat Spoils: Add battle earnings to virtual Forex balance
  const addCombatSpoils = useCallback(async (amount: number, reason: string) => {
    setAccount(prev => {
      const nextBalance = parseFloat((prev.balance + amount).toFixed(2));
      const nextCombat = (prev.totalCombatEarnings || 0) + amount;
      const updated = {
        ...prev,
        balance: nextBalance,
        equity: parseFloat((nextBalance + floatingPnL).toFixed(2)),
        totalCombatEarnings: nextCombat,
      };
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY_ACCOUNT, JSON.stringify(updated));
      } catch {}

      if (user) {
        updateDoc(doc(db, 'forexAccounts', user.uid), {
          balance: nextBalance,
          totalCombatEarnings: nextCombat,
          updatedAt: serverTimestamp(),
        }).catch(() => {});
      }

      return updated;
    });

    showNotification(`💰 غنيمة معركة يمانية! تم إيداع +$${amount} في رصيد التداول (${reason}).`);
  }, [floatingPnL, user, showNotification]);

  return (
    <ForexContext.Provider
      value={{
        rates,
        marketPrices,
        supportedPairs: SUPPORTED_PAIRS,
        selectedPair,
        setSelectedPair,
        isLiveConnected,
        isLoadingRates,
        lastUpdated,
        account: liveAccount,
        trades,
        floatingPnL,
        combatBonusActive,
        combatBonusPercent,
        openTrade,
        closeTrade,
        addCombatSpoils,
        refreshLiveRates,
        notificationMsg,
        clearNotification,
      }}
    >
      {children}
    </ForexContext.Provider>
  );
};

export const useForex = () => {
  const context = useContext(ForexContext);
  if (!context) {
    throw new Error('useForex must be used within a ForexProvider');
  }
  return context;
};
