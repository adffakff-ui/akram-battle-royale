import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { World } from './components/Environment/World';
import { Player } from './components/Player/Player';
import { Joystick } from './components/UI/Joystick';
import { ShootButton } from './components/Combat/ShootButton';
import { CameraTouchZone } from './components/Camera/CameraTouchZone';
import { HealthBar } from './components/UI/HealthBar';
import { PWAInstallButton } from './components/UI/PWAInstallButton';
import { YemenMapRadar } from './components/UI/YemenMapRadar';
import { LootType } from './components/Inventory/LootItem';
import { YEMEN_GOVERNORATES, Governorate } from './data/yemenGovernorates';
import { sounds } from './utils/soundEffects';
import { 
  LucideRefreshCcw, 
  LucideBox, 
  LucidePackage,
  LucideXCircle,
  LucideHeartPulse,
  LucideBackpack,
  LucideZap,
  LucideMapPin,
  LucideTarget,
  LucideChevronDown,
  LucideChevronUp,
  LucideX
} from 'lucide-react';
import * as THREE from 'three';

const MAX_CAPACITY = 5;

export default function App() {
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [targetResetKey, setTargetResetKey] = useState(0);
  const [isDamageFlash, setIsDamageFlash] = useState(false);
  const [showMissionCard, setShowMissionCard] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  
  // Player Position & Yemen Governorate Tracker
  const [playerCoords, setPlayerCoords] = useState({ x: 0, z: 0 });
  const [currentGov, setCurrentGov] = useState<Governorate>(YEMEN_GOVERNORATES[0]);
  const [exploredGovs, setExploredGovs] = useState<Set<string>>(new Set(['sanaa_capital']));

  // Inventory state
  const [inventory, setInventory] = useState<Array<{ name: string; type: LootType; value: number; id: string }>>([]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

  // Player ref for distance-based systems
  const playerRef = useRef<THREE.Group>(null);
  
  // Camera rotation state (Degrees)
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 15 });

  const handleJoystickMove = useCallback((data: { x: number; y: number }) => {
    setJoystickInput(data);
  }, []);

  const handleShootStateChange = useCallback((shooting: boolean) => {
    setIsShooting(shooting);
  }, []);

  const handleCameraRotate = useCallback((deltaX: number, deltaY: number) => {
    setCameraRotation((prev) => {
      const sensitivity = 0.4;
      const newX = prev.x + deltaX * sensitivity;
      let newY = prev.y - deltaY * sensitivity;
      newY = Math.max(-10, Math.min(50, newY));
      return { x: newX, y: newY };
    });
  }, []);

  // Update Player Position and Detect Nearest Yemen Governorate
  const handlePositionChange = useCallback((x: number, z: number) => {
    setPlayerCoords({ x, z });

    // Calculate closest governorate
    let nearest = YEMEN_GOVERNORATES[0];
    let minDist = Infinity;
    for (const gov of YEMEN_GOVERNORATES) {
      const dx = gov.x - x;
      const dz = gov.z - z;
      const dist = Math.sqrt(dx * dx + dz * dz);
      if (dist < minDist) {
        minDist = dist;
        nearest = gov;
      }
    }

    setCurrentGov((prev) => {
      if (prev.id !== nearest.id) {
        setExploredGovs((exp) => {
          const next = new Set(exp);
          if (!next.has(nearest.id)) {
            next.add(nearest.id);
            setNotification({
              message: `📍 تم استكشاف: محافظة ${nearest.name} (${nearest.landmark})`,
              type: 'info'
            });
            setTimeout(() => setNotification(null), 3500);
          }
          return next;
        });
        return nearest;
      }
      return prev;
    });
  }, []);

  // Teleport to any governorate via Yemen Map
  const handleTeleportToGov = useCallback((gov: Governorate) => {
    if (playerRef.current) {
      sounds.playTeleport();
      playerRef.current.position.set(gov.x, 2, gov.z + 4);
      setPlayerCoords({ x: gov.x, z: gov.z + 4 });
      setCurrentGov(gov);
      setExploredGovs((exp) => new Set(exp).add(gov.id));
      setNotification({
        message: `⚡ مرحباً بك في ${gov.name}: ${gov.mission}`,
        type: 'success'
      });
      setTimeout(() => setNotification(null), 4000);
    }
  }, []);

  const handleHitEnemy = useCallback((enemyName: string, damage: number) => {
    setNotification({
      message: `🎯 إصابة مؤكدة! -${damage} ضرر على [${enemyName}]`,
      type: 'warning'
    });
    setTimeout(() => setNotification(null), 1200);
  }, []);

  const handleTakeDamage = useCallback((amount: number = 10, isZone: boolean = false) => {
    setIsDamageFlash(true);
    setTimeout(() => setIsDamageFlash(false), 200);

    setPlayerHealth(prev => {
      const next = Math.max(0, prev - amount);
      if (next <= 0) {
        setNotification({ message: 'لقد سقطت في المعركة!', type: 'error' });
      } else if (isZone) {
        setNotification({ message: '⚠️ تحذير: أنت خارج المنطقة الآمنة في اليمن!', type: 'warning' });
        setTimeout(() => setNotification(null), 1000);
      }
      return next;
    });
  }, []);

  const handleResetTargets = useCallback(() => {
    setTargetResetKey(prev => prev + 1);
    setPlayerHealth(100);
    if (playerRef.current) {
      playerRef.current.position.set(0, 2, 0);
      setPlayerCoords({ x: 0, z: 0 });
    }
    setNotification({ message: 'تمت إعادة تعيين المعركة في باب اليمن!', type: 'success' });
    setTimeout(() => setNotification(null), 2500);
  }, []);

  const handlePickup = useCallback((item: { name: string; type: LootType; value: number }) => {
    setInventory(prev => {
      if (prev.length >= MAX_CAPACITY) {
        setNotification({ message: 'الحقيبة ممتلئة (5/5)! استخدم عنصراً أولاً', type: 'error' });
        setTimeout(() => setNotification(null), 2000);
        return prev;
      }
      
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      setNotification({ message: `🎁 تم التقاط: ${item.name}`, type: 'success' });
      setTimeout(() => setNotification(null), 2000);
      return [...prev, newItem];
    });
  }, []);

  const handleUseItem = useCallback((id: string) => {
    setInventory(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;

      if (item.type === LootType.HealthKit) {
        setPlayerHealth(h => Math.min(100, h + item.value));
        setNotification({ message: `💉 تم استخدام ${item.name} وزيادة الصحة!`, type: 'success' });
        setTimeout(() => setNotification(null), 2000);
      }

      return prev.filter(i => i.id !== id);
    });
  }, []);

  return (
    <div className="w-full h-screen bg-slate-900 overflow-hidden font-sans relative select-none touch-none">
      
      {/* وميض الضرر الأحمر عند التعرض للضرب (Damage Flash Vignette) */}
      {isDamageFlash && (
        <div className="absolute inset-0 z-30 pointer-events-none bg-rose-600/25 ring-8 ring-inset ring-rose-500 animate-pulse" />
      )}

      {/* مؤشر التصويب في منتصف الشاشة (Crosshair Reticle) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-md shadow-amber-400/80" />
          <div className="absolute w-5 h-[1.5px] bg-white/60 -left-6" />
          <div className="absolute w-5 h-[1.5px] bg-white/60 -right-6" />
          <div className="absolute h-5 w-[1.5px] bg-white/60 -top-6" />
          <div className="absolute h-5 w-[1.5px] bg-white/60 -bottom-6" />
        </div>
      </div>

      {/* 3D Viewport (Three.js WebGL Engine) */}
      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <World 
          key={targetResetKey} 
          playerRef={playerRef} 
          onPickup={handlePickup} 
          onAttackPlayer={(amt) => handleTakeDamage(amt)}
          onZoneDamage={(amt) => handleTakeDamage(amt, true)}
        />
        <Player 
          ref={playerRef}
          joystickInput={joystickInput} 
          isShooting={isShooting} 
          cameraRotation={cameraRotation}
          onPositionChange={handlePositionChange}
          onHitEnemy={handleHitEnemy}
        />
      </Canvas>

      {/* Input Listeners (Camera Orbit Drag) */}
      <CameraTouchZone onRotate={handleCameraRotate} />

      {/* رادار وخريطة محافظات اليمن التفاعلية */}
      <YemenMapRadar
        playerX={playerCoords.x}
        playerZ={playerCoords.z}
        currentGov={currentGov}
        exploredGovs={exploredGovs}
        onTeleportToGov={handleTeleportToGov}
      />

      {/* Mobile-Optimized Top HUD Layer */}
      <div className="absolute top-0 left-0 w-full p-3 sm:p-5 pointer-events-none z-10 flex flex-col gap-3">
        <header className="flex justify-between items-center gap-2">
          {/* Brand & Gov title */}
          <div className="bg-slate-950/80 backdrop-blur-md border border-amber-500/30 px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg">
            <span className="text-lg">🇾🇪</span>
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-xs tracking-tight">باتل رويال اليمن</span>
              <span className="text-amber-400 text-[9px] font-bold">22 محافظة</span>
            </div>
          </div>

          {/* Top Actions: Mission toggle, Inventory modal button, Reset, PWA */}
          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={() => setShowMissionCard(!showMissionCard)}
              className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 p-2 rounded-xl flex items-center gap-1 text-xs font-bold transition-all active:scale-95"
              title="مهمة المحافظة الحالية"
            >
              <LucideTarget className="w-4 h-4" />
            </button>

            <button
              onClick={() => setShowInventoryModal(true)}
              className="bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-all active:scale-95 relative"
              title="حقيبة الغنائم"
            >
              <LucideBackpack className="w-4 h-4" />
              <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                {inventory.length}/5
              </span>
            </button>

            <PWAInstallButton />

            <button 
              onClick={handleResetTargets}
              className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 p-2 rounded-xl flex items-center justify-center transition-all active:scale-95 text-white"
              title="إعادة المعركة"
            >
              <LucideRefreshCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* Compact Health Bar */}
        <div className="flex items-center justify-between max-w-xs">
          <HealthBar current={playerHealth} max={100} label="الصحة" />
        </div>
      </div>

      {/* Mission Card Drawer (Collapsible) */}
      {showMissionCard && (
        <div className="fixed top-20 right-3 left-3 sm:left-auto sm:right-5 z-40 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-950/90 backdrop-blur-md border border-amber-500/40 p-4 rounded-2xl max-w-sm shadow-2xl text-right">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => setShowMissionCard(false)}
                className="text-white/50 hover:text-white p-1"
              >
                <LucideX className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-amber-400 font-extrabold text-xs">مهمة {currentGov.name}</span>
                <LucideTarget className="w-4 h-4 text-amber-400" />
              </div>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-white font-medium leading-relaxed">
                {currentGov.mission}
              </p>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-white/60">
                <span>المعلم: {currentGov.landmark}</span>
                <span className="text-emerald-400 font-bold">نشطة ⚔️</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Inventory Modal / Drawer for Mobile & Desktop */}
      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl text-right flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <button
                onClick={() => setShowInventoryModal(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white"
              >
                <LucideX className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-2">
                <span className="text-white text-xs font-bold uppercase tracking-widest">حقيبة الغنائم</span>
                <LucideBackpack className="w-4 h-4 text-amber-400" />
                <span className="text-amber-400 font-mono text-xs">({inventory.length}/5)</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
              {inventory.length === 0 ? (
                <div className="py-12 text-center space-y-2">
                  <LucideBox className="w-10 h-10 text-white/10 mx-auto" />
                  <p className="text-white/40 text-xs font-bold">لا توجد عناصر في الحقيبة حالياً</p>
                  <p className="text-white/30 text-[10px]">اقترب من الصناديق في الخريطة لالتقاطها</p>
                </div>
              ) : (
                inventory.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                  >
                    <button
                      onClick={() => {
                        handleUseItem(item.id);
                        if (inventory.length <= 1) setShowInventoryModal(false);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow"
                    >
                      استخدام
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white text-xs font-bold">{item.name}</p>
                        <p className="text-white/50 text-[10px]">{item.type} • +{item.value} HP</p>
                      </div>
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                        item.type === LootType.HealthKit ? 'bg-emerald-500/20 text-emerald-400' : 
                        item.type === LootType.Ammo ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'
                      }`}>
                        {item.type === LootType.HealthKit ? <LucideHeartPulse className="w-4 h-4" /> : <LucideBox className="w-4 h-4" />}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowInventoryModal(false)}
              className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
            >
              إغلاق الحقيبة
            </button>
          </div>
        </div>
      )}

      {/* Notifications Toast */}
      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
          <div className={`
            px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur-md border text-xs sm:text-sm
            ${notification.type === 'error' 
              ? 'bg-rose-500/90 border-rose-400/50 shadow-rose-500/20 text-white' 
              : notification.type === 'warning'
              ? 'bg-amber-500/90 border-amber-400/50 shadow-amber-500/20 text-slate-950 font-bold'
              : notification.type === 'info'
              ? 'bg-slate-900/95 border-amber-500/50 shadow-amber-500/20 text-amber-300'
              : 'bg-emerald-500/90 border-emerald-400/50 shadow-emerald-500/20 text-white'
            }
          `}>
            {notification.type === 'error' ? <LucideXCircle className="w-4 h-4" /> : 
             notification.type === 'warning' ? <LucideZap className="w-4 h-4 animate-pulse" /> :
             notification.type === 'info' ? <LucideMapPin className="text-amber-400 w-4 h-4" /> :
             <LucidePackage className="w-4 h-4" />}
            <span className="font-bold tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}

      {/* On-screen Controls Overlay (Touch Joystick & Primary Fire Button) */}
      <Joystick onMove={handleJoystickMove} />
      <ShootButton onShootStateChange={handleShootStateChange} />

      {/* Background Stylization */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/30 via-transparent to-transparent z-0" />
    </div>
  );
}
