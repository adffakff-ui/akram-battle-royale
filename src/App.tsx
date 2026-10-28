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
import { Compass } from './components/UI/Compass';
import { FighterSelectModal, FIGHTERS, COMBAT_LEVELS, Ability } from './components/UI/FighterSelectModal';
import { AbilityButton } from './components/UI/AbilityButton';
import { PanoramaModal } from './components/UI/PanoramaModal';
import { ImpactParticles } from './components/Effects/Particles';
import { LootType } from './components/Inventory/LootItem';
import { YEMEN_GOVERNORATES, Governorate } from './data/yemenGovernorates';
import { Weapon, WEAPONS, TacticalUpgrade, UPGRADES } from './data/weapons';
import { WeaponSelector } from './components/Combat/WeaponSelector';
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
  LucideLoader2,
  LucideEye,
  LucideUser
} from 'lucide-react';
import * as THREE from 'three';
import { auth, saveMatchResult } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { AuthSection } from './components/UI/AuthSection';
import { LeaderboardModal } from './components/UI/LeaderboardModal';

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
  
  // Firebase User
  const [user, setUser] = useState<User | null>(null);
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  // Combat progression
  const [defeatedCount, setDefeatedCount] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [matchSaved, setMatchSaved] = useState(false);
  const [speedModifier, setSpeedModifier] = useState(1);
  const [damageModifier, setDamageModifier] = useState(1);
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [panorama, setPanorama] = useState<{isOpen: boolean, image: string, title: string}>({isOpen: false, image: '', title: ''});

  // Weapon Arsenal & Tactical Upgrades State
  const [currentWeapon, setCurrentWeapon] = useState<Weapon>(WEAPONS.assault);
  const [unlockedWeapons, setUnlockedWeapons] = useState<string[]>(['assault', 'sniper']);
  const [activeUpgrades, setActiveUpgrades] = useState<TacticalUpgrade[]>([]);
  const [ammo, setAmmo] = useState<number>(WEAPONS.assault.magazineSize);
  const isReloading = useRef(false);

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
  const [viewMode, setViewMode] = useState<'FPS' | 'TPS'>('TPS');

  useEffect(() => {
    // Simulate world loading
    const timer = setTimeout(() => setIsLoading(false), 2000);
    
    // Auth Listener
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });

    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
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

  const handleActivateAbility = () => {
    const { ability } = selectedFighter;
    if (ability.type === 'speed') {
      setSpeedModifier(1.5);
      setTimeout(() => setSpeedModifier(1), 5000);
    } else if (ability.type === 'accuracy') {
      setDamageModifier(2);
      setTimeout(() => setDamageModifier(1), 5000);
    } else if (ability.type === 'shield') {
      setIsShieldActive(true);
      setTimeout(() => setIsShieldActive(false), 5000);
    }
  };

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
            // Trigger panorama if we have one for this governorate
            if (nearest.id === 'sanaa_capital') setPanorama({ isOpen: true, image: '/src/assets/images/panoramic_sanaa_1793222214153.jpg', title: nearest.name });
            if (nearest.id === 'hadramawt') setPanorama({ isOpen: true, image: '/src/assets/images/panoramic_hadramout_1793222224781.jpg', title: nearest.name });
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
    console.log('App: handleStartGame called', fighter.name, level.name);
    setSelectedFighter(fighter);
    setSelectedLevel(level);
    setShowFighterModal(false);
    setPlayerHealth(fighter.hp);
    setDefeatedCount(0);
    setIsVictory(false);
    setMatchSaved(false);
    setTargetResetKey(prev => prev + 1);
    addLog(`⚔️ بدأت المعركة بنجاح!`, 'info');
  }, [addLog]);

  // Calculate current weapon's maximum ammo considering extended magazine upgrade
  const isExtendedDrum = activeUpgrades.some(u => u.id === 'extended_drum');
  const maxAmmo = isExtendedDrum ? currentWeapon.magazineSize * 2 : currentWeapon.magazineSize;

  const handleConsumeAmmo = useCallback(() => {
    if (isReloading.current) return false;

    if (ammo <= 1) {
      setAmmo(0);
      isReloading.current = true;
      setNotification({ message: '⚠️ نفدت الذخيرة! جاري إعادة التلقيم...', type: 'warning' });
      setTimeout(() => {
        setAmmo(maxAmmo);
        isReloading.current = false;
        setNotification({ message: '✅ تم تلقيم السلاح بنجاح!', type: 'info' });
        setTimeout(() => setNotification(null), 1200);
      }, 1500);
      return false;
    }

    setAmmo(prev => prev - 1);
    return true;
  }, [ammo, maxAmmo]);

  const handleSelectWeapon = useCallback((weapon: Weapon) => {
    setCurrentWeapon(weapon);
    const capacity = isExtendedDrum ? weapon.magazineSize * 2 : weapon.magazineSize;
    setAmmo(capacity);
    addLog(`🔫 تم تجهيز: ${weapon.name}`, 'info');
  }, [isExtendedDrum, addLog]);

  const handleClaimAirdrop = useCallback((crateId: string, rewardType: 'weapon' | 'upgrade') => {
    if (rewardType === 'weapon') {
      const locked = ['shotgun', 'heavy'].filter(w => !unlockedWeapons.includes(w));
      if (locked.length > 0) {
        const toUnlock = locked[0];
        setUnlockedWeapons(prev => [...prev, toUnlock]);
        const wObj = WEAPONS[toUnlock];
        setCurrentWeapon(wObj);
        setAmmo(wObj.magazineSize);
        addLog(`🎁 إسقاط جوي: تم فتح [${wObj.name}]!`, 'loot');
        setNotification({ message: `🎁 سلاح جديد مفتوح: ${wObj.name}`, type: 'success' });
        setTimeout(() => setNotification(null), 2500);
        return;
      }
    }

    // Otherwise give a Tactical Upgrade
    const unacquired = UPGRADES.filter(u => !activeUpgrades.some(au => au.id === u.id));
    if (unacquired.length > 0) {
      const newUp = unacquired[Math.floor(Math.random() * unacquired.length)];
      setActiveUpgrades(prev => [...prev, newUp]);
      
      if (newUp.type === 'damage') {
        setDamageModifier(prev => prev * newUp.value);
      } else if (newUp.type === 'speed') {
        setSpeedModifier(prev => prev * newUp.value);
      } else if (newUp.type === 'shield') {
        setPlayerHealth(prev => Math.min(selectedFighter.hp + 50, prev + newUp.value));
      } else if (newUp.type === 'ammo') {
        setAmmo(prev => prev * 2);
      }

      addLog(`⚡ ترقية تكتيكية: ${newUp.name}!`, 'loot');
      setNotification({ message: `⚡ ترقية: ${newUp.name} (${newUp.description})`, type: 'success' });
      setTimeout(() => setNotification(null), 3000);
    } else {
      // Bonus Full Ammo & Health
      setAmmo(maxAmmo);
      setPlayerHealth(selectedFighter.hp);
      addLog(`✨ إسقاط جوي: تم ملء الصحة والذخيرة بالكامل!`, 'loot');
    }
  }, [unlockedWeapons, activeUpgrades, maxAmmo, selectedFighter.hp, addLog]);

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
        // Save Victory to Firebase
        if (user && !matchSaved) {
          saveMatchResult(next, true, currentGov.id);
          setMatchSaved(true);
        }
      }
      return next;
    });
  }, [selectedLevel, addLog, user, matchSaved, currentGov.id]);

  const handleTakeDamage = useCallback((amount: number = 10, isZone: boolean = false) => {
    const effectiveDamage = isShieldActive ? amount * 0.5 : amount;
    setIsDamageFlash(true);
    setTimeout(() => setIsDamageFlash(false), 200);

    setPlayerHealth(prev => {
      const next = Math.max(0, prev - effectiveDamage);
      if (next <= 0) {
        addLog('☠️ لقد سقطت في المعركة!', 'info');
        // Save Match Loss to Firebase
        if (user && !matchSaved) {
          saveMatchResult(defeatedCount, false, currentGov.id);
          setMatchSaved(true);
        }
      } else if (isZone) {
        setNotification({ message: '⚠️ أنت خارج المنطقة الآمنة!', type: 'warning' });
        setTimeout(() => setNotification(null), 1000);
      }
      return next;
    });
  }, [addLog, user, matchSaved, defeatedCount, currentGov.id, isShieldActive]);

  const handleResetTargets = useCallback(() => {
    setTargetResetKey(prev => prev + 1);
    setPlayerHealth(selectedFighter.hp);
    setDefeatedCount(0);
    setIsVictory(false);
    setMatchSaved(false);
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
        <div className="absolute inset-0 z-[100] bg-slate-950 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-700">
          <div className="relative group">
            <div className="absolute inset-0 bg-amber-500 rounded-full blur-3xl opacity-20 animate-pulse" />
            <div className="relative w-40 h-40 sm:w-56 sm:h-56 rounded-[3rem] overflow-hidden border-4 border-amber-500/50 shadow-2xl shadow-amber-500/20 transform hover:scale-105 transition-transform duration-500">
              <img 
                src="/icon.png" 
                alt="Yemen Warrior" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-amber-500 text-slate-950 px-4 py-1.5 rounded-xl font-black text-sm shadow-xl flex items-center gap-2">
              <span className="text-lg">🇾🇪</span>
              <span>2026</span>
            </div>
          </div>
          
          <div className="text-center space-y-4">
            <div className="space-y-1">
              <h2 className="text-white text-3xl sm:text-4xl font-black tracking-tighter uppercase">محارب اليمن</h2>
              <p className="text-amber-500 font-bold text-sm tracking-[0.2em] opacity-80 uppercase">22 محافظة يمنية 🇾🇪</p>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-48 h-1 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 animate-[loading_2s_ease-in-out_infinite]" />
              </div>
              <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest animate-pulse">تجهيز المعالم التاريخية والجنود...</p>
            </div>
          </div>
        </div>
      )}

      {/* Fighter Selection Modal */}
      {!isLoading && (
        <>
          <FighterSelectModal isOpen={showFighterModal} onStartGame={handleStartGame} />
          <LeaderboardModal isOpen={showLeaderboard} onClose={() => setShowLeaderboard(false)} />

          {isDamageFlash && (
            <div className="absolute inset-0 z-30 pointer-events-none bg-rose-600/25 ring-8 ring-inset ring-rose-500 animate-pulse" />
          )}

          {/* Game Over / Victory Modal */}
          {(isVictory || playerHealth <= 0) && (
            <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300 pointer-events-auto">
              <div className="glass-panel max-w-sm w-full p-8 rounded-[2.5rem] text-center flex flex-col gap-6 border-2 border-amber-500/40 shadow-2xl shadow-amber-500/10">
                <div className="flex justify-center">
                  {isVictory ? (
                    <LucideTrophy className="w-20 h-20 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)] animate-bounce" />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-rose-500/20 border-2 border-rose-500 flex items-center justify-center text-rose-500">
                      <LucideXCircle className="w-12 h-12" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <h2 className="text-3xl font-black text-amber-400">
                    {isVictory ? 'نصر يماني مؤزر!' : 'انتهت المعركة'}
                  </h2>
                  <p className="text-slate-300 text-sm font-bold">
                    {isVictory 
                      ? `لقد طهرت ${currentGov.name} من الغزاة بنجاح!` 
                      : `لقد قاتلت ببسالة في ${currentGov.name}، حاول مرة أخرى.`}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="py-3 bg-slate-900/60 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-black uppercase mb-1">النقاط المكتسبة</span>
                    <span className="text-xl font-black text-amber-400">{defeatedCount * 100}</span>
                  </div>
                  <div className="py-3 bg-slate-900/60 rounded-2xl border border-white/5">
                    <span className="text-[10px] text-slate-400 block font-black uppercase mb-1">الغنائم</span>
                    <span className="text-xl font-black text-emerald-400">{inventory.length} / 5</span>
                  </div>
                </div>

                <button 
                  onClick={handleResetTargets} 
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black rounded-2xl text-lg shadow-lg hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  <span>{isVictory ? 'معركة جديدة ⚔️' : 'إعادة المحاولة 🔄'}</span>
                </button>

                {!user && (
                  <p className="text-[10px] text-white/40 font-bold">سجل دخولك لحفظ نتائجك في لوحة المتصدرين</p>
                )}
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
              onClaimAirdrop={handleClaimAirdrop}
            />
            <Player 
              ref={playerRef}
              joystickInput={joystickInput} 
              isShooting={isShooting} 
              cameraRotation={cameraRotation}
              viewMode={viewMode}
              speedModifier={speedModifier}
              damageModifier={damageModifier}
              activeWeapon={currentWeapon}
              onConsumeAmmo={handleConsumeAmmo}
              onPositionChange={handlePositionChange}
              onHitEnemy={handleHitEnemy}
              onSpawnParticles={spawnParticles}
            />
            {particles.map((p) => (
              <ImpactParticles key={p.id} position={p.pos} color={p.color} onFinish={() => removeParticles(p.id)} />
            ))}
          </Canvas>
        </>
      )}

      {/* Gameplay HUD & Touch Controls - Only visible during active battle */}
      {!isLoading && !showFighterModal && (
        <>
          <CameraTouchZone onRotate={handleCameraRotate} />
          <Compass rotationX={cameraRotation.x} />
          <YemenMapRadar
            playerX={playerCoords.x}
            playerZ={playerCoords.z}
            currentGov={currentGov}
            exploredGovs={exploredGovs}
            onTeleportToGov={handleTeleportToGov}
          />

          {/* Top UI Overlay */}
          <div className="absolute top-0 left-0 right-0 z-40 p-3 sm:p-4 w-full max-w-md mx-auto flex flex-col gap-2.5 pointer-events-none">
            
            {/* Region Selector & Fighter Selector Header */}
            <div className="glass-panel rounded-2xl p-2.5 sm:p-3 flex items-center justify-between pointer-events-auto">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                  <LucideMapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 font-black block leading-none mb-1">خريطة اليمن 🇾🇪</span>
                  <select 
                    value={currentGov.id} 
                    onChange={(e) => {
                      const gov = YEMEN_GOVERNORATES.find(g => g.id === e.target.value);
                      if (gov) handleTeleportToGov(gov);
                    }}
                    className="bg-slate-800/80 text-white font-bold text-xs rounded-lg px-2 py-1 border border-slate-600 outline-none focus:border-amber-400 pointer-events-auto"
                  >
                    {YEMEN_GOVERNORATES.map(gov => (
                      <option key={gov.id} value={gov.id}>{gov.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fighter and Level Switcher */}
              <div className="flex items-center gap-2 text-right">
                <button
                  onClick={() => setShowFighterModal(true)}
                  className="px-2.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-[10px] font-black flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                  title="تغيير البطل والمستوى"
                >
                  <LucideSword className="w-3.5 h-3.5" />
                  <span>{selectedFighter.icon} تغيير</span>
                </button>
                <div>
                  <span className="text-[9px] text-slate-400 block font-bold leading-tight">النقاط</span>
                  <span id="scoreText" className="text-lg font-black text-amber-400 leading-tight">
                    {defeatedCount * 100}
                  </span>
                </div>
              </div>
            </div>

            {/* Health Bar */}
            <div className="glass-panel rounded-xl p-2.5 sm:p-3 pointer-events-auto">
              <div className="flex justify-between items-center mb-1 text-[11px] font-black">
                <span className="text-emerald-400 uppercase flex items-center gap-1">
                  <span>{selectedFighter.icon}</span>
                  <span>صحة {selectedFighter.name}</span>
                </span>
                <span id="healthText" className="text-white font-mono">{Math.round(playerHealth)} / {selectedFighter.hp}</span>
              </div>
              <div className="w-full bg-slate-950/50 rounded-full h-3 overflow-hidden p-0.5 border border-slate-700/50">
                <div 
                  className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.4)]" 
                  style={{ width: `${(playerHealth / selectedFighter.hp) * 100}%` }}
                />
              </div>
            </div>

            {/* Inventory Bar */}
            <div className="glass-panel rounded-xl p-2.5 sm:p-3 flex items-center justify-between pointer-events-auto cursor-pointer" onClick={() => setShowInventoryModal(true)}>
              <div className="flex items-center gap-2">
                <LucideBackpack className="w-4 h-4 text-amber-400" />
                <span className="text-[11px] font-black text-slate-200">حقيبة الغنائم</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-black text-amber-400">{inventory.length} / 5</span>
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map(i => (
                    <div 
                      key={i} 
                      className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                        i < inventory.length 
                          ? 'bg-amber-500 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]' 
                          : 'bg-slate-700/50 border-slate-600'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button 
                onClick={() => setViewMode(prev => prev === 'FPS' ? 'TPS' : 'FPS')} 
                className="flex-1 glass-panel py-2 rounded-xl text-white font-black text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all border-indigo-500/30"
              >
                {viewMode === 'FPS' ? <LucideUser className="w-3.5 h-3.5 text-indigo-400" /> : <LucideEye className="w-3.5 h-3.5 text-indigo-400" />}
                {viewMode === 'FPS' ? 'منظور الشخص الثالث' : 'منظور الشخص الأول'}
              </button>
              <button 
                onClick={() => setShowLeaderboard(true)} 
                className="glass-panel p-2 rounded-xl text-amber-400 active:scale-95 transition-all"
                title="لوحة المتصدرين"
              >
                <LucideTrophy className="w-4 h-4" />
              </button>
              <AuthSection user={user} />
              <PWAInstallButton />
            </div>
          </div>

          <Joystick onMove={handleJoystickMove} />
          <ShootButton onShootStateChange={handleShootStateChange} />
          {selectedFighter && (
            <AbilityButton 
              ability={selectedFighter.ability}
              onActivate={handleActivateAbility}
              cooldown={15}
            />
          )}
          <WeaponSelector 
            currentWeapon={currentWeapon}
            unlockedWeapons={unlockedWeapons}
            activeUpgrades={activeUpgrades}
            onSelectWeapon={handleSelectWeapon}
            currentAmmo={ammo}
            maxAmmo={maxAmmo}
          />
        </>
      )}


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
      {selectedFighter && (
        <AbilityButton 
          ability={selectedFighter.ability}
          onActivate={handleActivateAbility}
          cooldown={15}
        />
      )}
      <PanoramaModal 
        isOpen={panorama.isOpen} 
        onClose={() => setPanorama({...panorama, isOpen: false})}
        imageSrc={panorama.image}
        title={panorama.title}
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/30 via-transparent to-transparent z-0" />
    </div>
  );
}
