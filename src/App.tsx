import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { World } from './components/Environment/World';
import { Player } from './components/Player/Player';
import { Joystick } from './components/UI/Joystick';
import { ShootButton } from './components/Combat/ShootButton';
import { CameraTouchZone } from './components/Camera/CameraTouchZone';
import { HealthBar } from './components/UI/HealthBar';
import { PWAInstallButton } from './components/UI/PWAInstallButton';
import { YemenMapRadar } from './components/UI/YemenMapRadar';
import { FighterSelectModal, FIGHTERS, COMBAT_LEVELS } from './components/UI/FighterSelectModal';
import { ImpactParticles } from './components/Effects/Particles';
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
  LucideSword,
  LucideTrophy,
  LucideX,
  LucideLoader2
} from 'lucide-react';
import * as THREE from 'three';

const MAX_CAPACITY = 5;

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [targetResetKey, setTargetResetKey] = useState(0);
  const [isDamageFlash, setIsDamageFlash] = useState(false);
  const [showMissionCard, setShowMissionCard] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showFighterModal, setShowFighterModal] = useState(true);
  
  // Kill Feed / Event Logs
  const [logs, setLogs] = useState<Array<{ id: string, msg: string, type: 'kill' | 'loot' | 'info' }>>([]);
  
  // Combat progression
  const [defeatedCount, setDefeatedCount] = useState(0);
  const [isVictory, setIsVictory] = useState(false);

  // Particles state
  const [particles, setParticles] = useState<Array<{ id: string, pos: [number, number, number], color: string }>>([]);

  const spawnParticles = useCallback((pos: [number, number, number], color: string = "#fbbf24") => {
    const id = Math.random().toString(36).substr(2, 9);
    setParticles(prev => [...prev, { id, pos, color }]);
  }, []);

  const removeParticles = useCallback((id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  // Selected Fighter & Level State
  const [selectedFighter, setSelectedFighter] = useState(FIGHTERS[0]);
  const [selectedLevel, setSelectedLevel] = useState(COMBAT_LEVELS[1]);
  
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

  useEffect(() => {
    // Simulate world loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const addLog = useCallback((msg: string, type: 'kill' | 'loot' | 'info' = 'info') => {
    const id = Math.random().toString(36).substr(2, 5);
    setLogs(prev => [{ id, msg, type }, ...prev].slice(0, 5));
    setTimeout(() => {
      setLogs(prev => prev.filter(l => l.id !== id));
    }, 4000);
  }, []);

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
            addLog(`🗺️ استكشاف: ${nearest.name}`, 'info');
          }
          return next;
        });
        return nearest;
      }
      return prev;
    });
  }, [addLog]);

  // Teleport to any governorate via Yemen Map
  const handleTeleportToGov = useCallback((gov: Governorate) => {
    if (playerRef.current) {
      sounds.playTeleport();
      playerRef.current.position.set(gov.x, 2, gov.z + 4);
      setPlayerCoords({ x: gov.x, z: gov.z + 4 });
      setCurrentGov(gov);
      setExploredGovs((exp) => new Set(exp).add(gov.id));
      addLog(`⚡ انتقلت إلى: ${gov.name}`, 'info');
    }
  }, [addLog]);

  const handleStartGame = useCallback((fighter: typeof FIGHTERS[0], level: typeof COMBAT_LEVELS[0]) => {
    setSelectedFighter(fighter);
    setSelectedLevel(level);
    setShowFighterModal(false);
    setPlayerHealth(fighter.hp);
    setDefeatedCount(0);
    setIsVictory(false);
    setTargetResetKey(prev => prev + 1);
    addLog(`⚔️ بدأت المعركة بنجاح!`, 'info');
  }, [addLog]);

  const handleHitEnemy = useCallback((enemyName: string, damage: number, hitPos?: [number, number, number]) => {
    if (hitPos) {
      spawnParticles(hitPos, "#ef4444"); // Red for impact
    }
  }, [spawnParticles]);

  const handleEnemyDie = useCallback((name: string) => {
    setDefeatedCount(prev => {
      const next = prev + 1;
      addLog(`💀 قضيت على [${name}]`, 'kill');
      if (next >= selectedLevel.enemyCount) {
        setIsVictory(true);
        sounds.playPickup();
      }
      return next;
    });
  }, [selectedLevel, addLog]);

  const handleTakeDamage = useCallback((amount: number = 10, isZone: boolean = false) => {
    setIsDamageFlash(true);
    setTimeout(() => setIsDamageFlash(false), 200);

    setPlayerHealth(prev => {
      const next = Math.max(0, prev - amount);
      if (next <= 0) {
        addLog('☠️ لقد سقطت في المعركة!', 'info');
      } else if (isZone) {
        setNotification({ message: '⚠️ أنت خارج المنطقة الآمنة!', type: 'warning' });
        setTimeout(() => setNotification(null), 1000);
      }
      return next;
    });
  }, [addLog]);

  const handleResetTargets = useCallback(() => {
    setTargetResetKey(prev => prev + 1);
    setPlayerHealth(selectedFighter.hp);
    setDefeatedCount(0);
    setIsVictory(false);
    if (playerRef.current) {
      playerRef.current.position.set(0, 2, 0);
      setPlayerCoords({ x: 0, z: 0 });
    }
    addLog('🔄 تمت إعادة تعيين المعركة', 'info');
  }, [selectedFighter.hp, addLog]);

  const handlePickup = useCallback((item: { name: string; type: LootType; value: number }) => {
    setInventory(prev => {
      if (prev.length >= MAX_CAPACITY) return prev;
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      addLog(`🎁 حصلت على: ${item.name}`, 'loot');
      return [...prev, newItem];
    });
  }, [addLog]);

  const handleUseItem = useCallback((id: string) => {
    setInventory(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      if (item.type === LootType.HealthKit) {
        setPlayerHealth(h => Math.min(selectedFighter.hp, h + item.value));
        addLog(`💉 استهلكت ${item.name}`, 'loot');
      }
      return prev.filter(i => i.id !== id);
    });
  }, [selectedFighter.hp, addLog]);

  return (
    <div className="w-full h-screen bg-slate-900 overflow-hidden font-sans relative select-none touch-none">
      
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center space-y-6">
          <div className="relative w-24 h-24">
            <LucideLoader2 className="w-24 h-24 text-amber-500 animate-spin" />
            <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-white">🇾🇪</span>
          </div>
          <div className="text-center">
            <h2 className="text-white text-xl font-black tracking-widest uppercase">Battle Royale Yemen</h2>
            <p className="text-amber-500/60 text-xs font-bold mt-1">تجهيز الـ 22 محافظة والجنود...</p>
          </div>
        </div>
      )}

      {/* Fighter Selection Modal */}
      {!isLoading && <FighterSelectModal isOpen={showFighterModal} onStartGame={handleStartGame} />}

      {isDamageFlash && (
        <div className="absolute inset-0 z-30 pointer-events-none bg-rose-600/25 ring-8 ring-inset ring-rose-500 animate-pulse" />
      )}

      {/* Victory Overlay */}
      {isVictory && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-in fade-in duration-500 pointer-events-auto">
          <div className="bg-slate-900 border-2 border-amber-500 p-10 rounded-[3rem] text-center shadow-2xl shadow-amber-500/20">
            <LucideTrophy className="w-20 h-20 text-amber-400 mx-auto mb-6 animate-bounce" />
            <h2 className="text-white text-3xl font-black mb-4">🏆 نصر يماني مؤزر!</h2>
            <p className="text-amber-400 font-bold mb-8 text-lg">لقد قمت بتطهير المنطقة من الغزاة</p>
            <button onClick={handleResetTargets} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl active:scale-95">العودة للمعركة</button>
          </div>
        </div>
      )}

      {/* Kill Feed / Event Logs */}
      <div className="absolute top-24 right-5 z-40 space-y-2 w-64 pointer-events-none">
        {logs.map(log => (
          <div key={log.id} className={`px-4 py-2 rounded-xl text-[10px] font-bold text-right border-r-4 shadow-lg animate-in slide-in-from-right duration-300 backdrop-blur-md ${
            log.type === 'kill' ? 'bg-rose-500/20 border-rose-500 text-rose-300' :
            log.type === 'loot' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300' :
            'bg-slate-950/60 border-amber-500 text-white'
          }`}>
            {log.msg}
          </div>
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-md shadow-amber-400/80" />
          <div className="absolute w-5 h-[1.5px] bg-white/60 -left-6" />
          <div className="absolute w-5 h-[1.5px] bg-white/60 -right-6" />
          <div className="absolute h-5 w-[1.5px] bg-white/60 -top-6" />
          <div className="absolute h-5 w-[1.5px] bg-white/60 -bottom-6" />
        </div>
      </div>

      <Canvas shadows camera={{ position: [0, 5, 10], fov: 50 }}>
        <World 
          key={targetResetKey} 
          playerRef={playerRef} 
          onPickup={handlePickup} 
          onAttackPlayer={(amt) => handleTakeDamage(amt)}
          onZoneDamage={(amt) => handleTakeDamage(amt, true)}
          enemyCount={selectedLevel.enemyCount}
          onEnemyDie={handleEnemyDie}
        />
        <Player 
          ref={playerRef}
          joystickInput={joystickInput} 
          isShooting={isShooting} 
          cameraRotation={cameraRotation}
          onPositionChange={handlePositionChange}
          onHitEnemy={handleHitEnemy}
          onSpawnParticles={spawnParticles}
        />
        {particles.map((p) => (
          <ImpactParticles key={p.id} position={p.pos} color={p.color} onFinish={() => removeParticles(p.id)} />
        ))}
      </Canvas>

      <CameraTouchZone onRotate={handleCameraRotate} />
      <YemenMapRadar
        playerX={playerCoords.x}
        playerZ={playerCoords.z}
        currentGov={currentGov}
        exploredGovs={exploredGovs}
        onTeleportToGov={handleTeleportToGov}
      />

      <div className="absolute top-0 left-0 w-full p-3 sm:p-5 pointer-events-none z-10 flex flex-col gap-3">
        <header className="flex justify-between items-center gap-2">
          <div className="bg-slate-950/80 backdrop-blur-md border border-amber-500/30 px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg">
            <span className="text-lg">🇾🇪</span>
            <div className="flex flex-col">
              <span className="text-white font-extrabold text-xs tracking-tight">{selectedFighter.name}</span>
              <span className="text-amber-400 text-[9px] font-bold">{selectedLevel.name}</span>
            </div>
          </div>

          <div className="bg-rose-500/20 backdrop-blur-md border border-rose-500/40 px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg">
            <LucideSword className="w-3.5 h-3.5 text-rose-400" />
            <div className="flex flex-col items-end">
              <span className="text-rose-400 font-black text-xs">{selectedLevel.enemyCount - defeatedCount}</span>
              <span className="text-white/40 text-[8px] font-bold uppercase">الجنود المتبقين</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button onClick={() => setShowFighterModal(true)} className="bg-amber-600/30 hover:bg-amber-600/40 text-amber-300 border border-amber-500/40 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-all active:scale-95"><LucideSword className="w-3.5 h-3.5" /><span className="hidden sm:inline">المقاتلين</span></button>
            <button onClick={() => setShowMissionCard(!showMissionCard)} className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 p-2 rounded-xl flex items-center gap-1 text-xs font-bold transition-all active:scale-95"><LucideTarget className="w-4 h-4" /></button>
            <button onClick={() => setShowInventoryModal(true)} className="bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 px-2.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-bold transition-all active:scale-95 relative"><LucideBackpack className="w-4 h-4" /><span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">{inventory.length}/5</span></button>
            <PWAInstallButton />
            <button onClick={handleResetTargets} className="bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 p-2 rounded-xl flex items-center justify-center transition-all active:scale-95 text-white"><LucideRefreshCcw className="w-3.5 h-3.5" /></button>
          </div>
        </header>
        <div className="flex items-center justify-between max-w-xs">
          <HealthBar current={playerHealth} max={selectedFighter.hp} label="الصحة" />
        </div>
      </div>

      {showMissionCard && (
        <div className="fixed top-20 right-3 left-3 sm:left-auto sm:right-5 z-40 pointer-events-auto animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-slate-950/90 backdrop-blur-md border border-amber-500/40 p-4 rounded-2xl max-w-sm shadow-2xl text-right">
            <div className="flex justify-between items-center mb-2">
              <button onClick={() => setShowMissionCard(false)} className="text-white/50 hover:text-white p-1"><LucideX className="w-4 h-4" /></button>
              <div className="flex items-center gap-2"><span className="text-amber-400 font-extrabold text-xs">مهمة {currentGov.name}</span><LucideTarget className="w-4 h-4 text-amber-400" /></div>
            </div>
            <div className="space-y-2 text-xs">
              <p className="text-white font-medium leading-relaxed">{currentGov.mission}</p>
              <div className="pt-2 border-t border-white/10 flex justify-between items-center text-[11px] text-white/60"><span>المعلم: {currentGov.landmark}</span><span className="text-emerald-400 font-bold">نشطة ⚔️</span></div>
            </div>
          </div>
        </div>
      )}

      {showInventoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200 pointer-events-auto">
          <div className="w-full max-w-sm bg-slate-900 border border-white/10 rounded-3xl p-5 shadow-2xl text-right flex flex-col max-h-[80vh]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
              <button onClick={() => setShowInventoryModal(false)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white"><LucideX className="w-4 h-4" /></button>
              <div className="flex items-center gap-2"><span className="text-white text-xs font-bold uppercase tracking-widest">حقيبة الغنائم</span><LucideBackpack className="w-4 h-4 text-amber-400" /><span className="text-amber-400 font-mono text-xs">({inventory.length}/5)</span></div>
            </div>
            <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
              {inventory.length === 0 ? (
                <div className="py-12 text-center space-y-2"><LucideBox className="w-10 h-10 text-white/10 mx-auto" /><p className="text-white/40 text-xs font-bold">لا توجد عناصر في الحقيبة</p></div>
              ) : (
                inventory.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                    <button onClick={() => { handleUseItem(item.id); if (inventory.length <= 1) setShowInventoryModal(false); }} className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors shadow">استخدام</button>
                    <div className="flex items-center gap-3"><div className="text-right"><p className="text-white text-xs font-bold">{item.name}</p><p className="text-white/50 text-[10px]">{item.type} • +{item.value} HP</p></div><div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.type === LootType.HealthKit ? 'bg-emerald-500/20 text-emerald-400' : item.type === LootType.Ammo ? 'bg-amber-500/20 text-amber-400' : 'bg-indigo-500/20 text-indigo-400'}`}>{item.type === LootType.HealthKit ? <LucideHeartPulse className="w-4 h-4" /> : <LucideBox className="w-4 h-4" />}</div></div>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowInventoryModal(false)} className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors">إغلاق الحقيبة</button>
          </div>
        </div>
      )}

      {notification && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
          <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur-md border text-xs sm:text-sm ${notification.type === 'error' ? 'bg-rose-500/90 border-rose-400/50 text-white' : notification.type === 'warning' ? 'bg-amber-500/90 border-amber-400/50 text-slate-950 font-bold' : notification.type === 'info' ? 'bg-slate-900/95 border-amber-500/50 shadow-amber-500/20 text-amber-300' : 'bg-emerald-500/90 border-emerald-400/50 text-white'}`}>
            {notification.type === 'error' ? <LucideXCircle className="w-4 h-4" /> : notification.type === 'warning' ? <LucideZap className="w-4 h-4 animate-pulse" /> : notification.type === 'info' ? <LucideMapPin className="text-amber-400 w-4 h-4" /> : <LucidePackage className="w-4 h-4" />}
            <span className="font-bold tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}

      <Joystick onMove={handleJoystickMove} />
      <ShootButton onShootStateChange={handleShootStateChange} />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/30 via-transparent to-transparent z-0" />
    </div>
  );
}
