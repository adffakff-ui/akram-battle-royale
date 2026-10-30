import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { World } from './components/Environment/World';
import { Player } from './components/Player/Player';
import { Joystick } from './components/UI/Joystick';
import { ShootButton } from './components/Combat/ShootButton';
import { CameraTouchZone } from './components/Camera/CameraTouchZone';
import { PWAInstallButton } from './components/UI/PWAInstallButton';
import { YemenMapRadar } from './components/UI/YemenMapRadar';
import { Compass } from './components/UI/Compass';
import { FighterSelectModal, FIGHTERS, COMBAT_LEVELS } from './components/UI/FighterSelectModal';
import { AbilityButton } from './components/UI/AbilityButton';
import { PanoramaModal } from './components/UI/PanoramaModal';
import { ImpactParticles } from './components/Effects/Particles';
import { LootType } from './components/Inventory/LootItem';
import { YEMEN_GOVERNORATES, Governorate } from './data/yemenGovernorates';
import { Weapon, WEAPONS, TacticalUpgrade, UPGRADES } from './data/weapons';
import { WeaponSelector } from './components/Combat/WeaponSelector';
import { FreeFireHUD } from './components/UI/FreeFireHUD';
import { FreeFireSplash } from './components/UI/FreeFireSplash';
import { BooyahScreen } from './components/UI/BooyahScreen';
import { DefeatScreen } from './components/UI/DefeatScreen';
import { GlooWallData } from './components/Combat/GlooWall';
import { sounds } from './utils/soundEffects';
import { 
  LucidePackage,
  LucideUser,
  LucideEye
} from 'lucide-react';
import * as THREE from 'three';
import { useFirebase } from './context/FirebaseContext';
import { useForex } from './context/ForexContext';
import { AuthSection } from './components/UI/AuthSection';
import { LeaderboardModal } from './components/UI/LeaderboardModal';
import { ForexDashboard } from './components/Forex/ForexDashboard';
import { TabNavigation } from './components/Layout/TabNavigation';
import { doc, setDoc } from 'firebase/firestore';
import { db } from './lib/firebase';
import { handleFirestoreError, OperationType } from './utils/firebaseErrors';
import { LobbyWorld } from './components/Lobby/LobbyWorld';
import { CameraFollow } from './components/Camera/CameraFollow';

const MAX_CAPACITY = 5;

export default function App() {
  const { user, loading: authLoading } = useFirebase();
  const { account: forexAccount, floatingPnL, combatBonusActive, combatBonusPercent, addCombatSpoils } = useForex();
  const [activeTab, setActiveTab] = useState<'GAME' | 'FOREX'>('GAME');
  
  // Splash and Lobby Screen States
  const [showSplash, setShowSplash] = useState(true);
  const [showFighterModal, setShowFighterModal] = useState(false);
  const [inGame, setInGame] = useState(false);
  
  // Controls & Player State
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);
  const [jumpTrigger, setJumpTrigger] = useState(0);
  const [isCrouching, setIsCrouching] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(200);
  const [ep, setEp] = useState(200); // Free Fire Energy Points
  const [maxEp] = useState(200);
  const [armorLevel, setArmorLevel] = useState(3);
  const [helmetLevel, setHelmetLevel] = useState(3);
  
  // Free Fire Tactical Items
  const [glooWalls, setGlooWalls] = useState<GlooWallData[]>([]);
  const [glooWallCount, setGlooWallCount] = useState(3);
  const [medkitCount, setMedkitCount] = useState(2);
  const [backpackCount, setBackpackCount] = useState(6); // As seen in screenshot
  const [isScoped, setIsScoped] = useState(false);

  // Match State & Reset
  const [targetResetKey, setTargetResetKey] = useState(0);
  const [isDamageFlash, setIsDamageFlash] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [defeatedCount, setDefeatedCount] = useState(0);
  const [totalDamageDealt, setTotalDamageDealt] = useState(0);
  const [isVictory, setIsVictory] = useState(false);
  const [isDefeated, setIsDefeated] = useState(false);
  const [matchSaved, setMatchSaved] = useState(false);

  // Modifiers
  const [speedModifier, setSpeedModifier] = useState(1);
  const [damageModifier, setDamageModifier] = useState(1);
  const [isShieldActive, setIsShieldActive] = useState(false);
  const [panorama, setPanorama] = useState<{isOpen: boolean, image: string, title: string}>({isOpen: false, image: '', title: ''});

  // Weapon Arsenal & Tactical Upgrades State
  const [currentWeapon, setCurrentWeapon] = useState<Weapon>(WEAPONS.assault);
  const [unlockedWeapons, setUnlockedWeapons] = useState<string[]>(['fist', 'assault', 'mp40', 'sniper', 'shotgun', 'scar']);
  const [activeUpgrades, setActiveUpgrades] = useState<TacticalUpgrade[]>([]);
  const [ammo, setAmmo] = useState<number>(WEAPONS.assault.magazineSize);
  const isReloading = useRef(false);

  // Particles state
  const [particles, setParticles] = useState<Array<{ id: string, pos: [number, number, number], color: string }>>([]);

  // Free Fire Kill Feed & Logs
  const [killFeed, setKillFeed] = useState<Array<{ id: string; killer: string; victim: string; weapon: string; isHeadshot: boolean }>>([
    { id: '1', killer: 'DJ ALOK', victim: 'بوت الصحراء', weapon: 'AK47', isHeadshot: true },
    { id: '2', killer: 'KELLY', victim: 'قناص شبام', weapon: 'MP40', isHeadshot: false }
  ]);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning' | 'info'} | null>(null);

  // Selected Fighter & Level State
  const [selectedFighter, setSelectedFighter] = useState(FIGHTERS[0]);
  const [selectedLevel, setSelectedLevel] = useState(COMBAT_LEVELS[0]);
  
  // Player Position & Yemen Governorate Tracker
  const [playerCoords, setPlayerCoords] = useState({ x: 0, z: 0 });
  const [currentGov, setCurrentGov] = useState<Governorate>(YEMEN_GOVERNORATES[0]);
  const [exploredGovs, setExploredGovs] = useState<Set<string>>(new Set(['sanaa_capital']));

  // Player ref for distance-based systems
  const playerRef = useRef<THREE.Group>(null);
  
  // Camera rotation state (Degrees)
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 15 });
  const [viewMode, setViewMode] = useState<'FPS' | 'TPS'>('TPS');

  const spawnParticles = useCallback((pos: [number, number, number], color: string = "#fbbf24") => {
    const id = Math.random().toString(36).substr(2, 9);
    setParticles(prev => [...prev, { id, pos, color }]);
  }, []);

  const removeParticles = useCallback((id: string) => {
    setParticles(prev => prev.filter(p => p.id !== id));
  }, []);

  const addLog = useCallback((msg: string, type: 'kill' | 'loot' | 'info' = 'info') => {
    setNotification({ message: msg, type: type === 'kill' ? 'error' : type === 'loot' ? 'success' : 'info' });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleJoystickMove = useCallback((data: { x: number; y: number }) => {
    setJoystickInput(data);
  }, []);

  const handleSprintToggle = useCallback((isSprinting: boolean) => {
    setSpeedModifier(isSprinting ? 1.35 : 1.0);
  }, []);

  const handleActivateAbility = () => {
    const { ability } = selectedFighter;
    if (ability.type === 'speed') {
      setSpeedModifier(1.35);
      sounds.playTeleport();
      addLog(`⚡ تم تفعيل مهارة ${ability.name} (+35% سرعة)!`, 'info');
      setTimeout(() => setSpeedModifier(1), 5000);
    } else if (ability.type === 'accuracy') {
      setDamageModifier(1.8);
      sounds.playHeadshot();
      addLog(`⚔️ تم تفعيل مهارة بوشيدو (+80% ضرر اختراق الدروع)!`, 'info');
      setTimeout(() => setDamageModifier(1), 5000);
    } else if (ability.type === 'shield') {
      setIsShieldActive(true);
      sounds.playGlooWall();
      addLog(`🛡️ تم نشر درع القبة الكهرومغناطيسية (كرونو)!`, 'info');
      setTimeout(() => setIsShieldActive(false), 6000);
    } else if (ability.type === 'heal') {
      sounds.playMedkit();
      setPlayerHealth(h => Math.min(selectedFighter.hp, h + 50));
      setEp(e => Math.min(maxEp, e + 50));
      addLog(`🎧 هالة الشفاء ألوك: استرجعت +50 HP و +50 EP!`, 'loot');
    }
  };

  const handleShootStateChange = useCallback((shooting: boolean) => {
    setIsShooting(shooting);
  }, []);

  const handleCameraRotate = useCallback((deltaX: number, deltaY: number) => {
    setCameraRotation((prev) => {
      const sensitivity = isScoped ? 0.2 : 0.4;
      const newX = prev.x + deltaX * sensitivity;
      let newY = prev.y - deltaY * sensitivity;
      newY = Math.max(-10, Math.min(50, newY));
      return { x: newX, y: newY };
    });
  }, [isScoped]);

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

    if (nearest.id !== currentGov.id) {
      setCurrentGov(nearest);
      setExploredGovs((exp) => new Set(exp).add(nearest.id));
    }
  }, [currentGov.id]);

  const handleTeleportToGov = useCallback((gov: Governorate) => {
    if (playerRef.current) {
      sounds.playTeleport();
      playerRef.current.position.set(gov.x, 2, gov.z + 4);
      setPlayerCoords({ x: gov.x, z: gov.z + 4 });
      setCurrentGov(gov);
      setExploredGovs((exp) => new Set(exp).add(gov.id));
      addLog(`⚡ هبوط تكتيكي إلى: ${gov.name}`, 'info');
    }
  }, [addLog]);

  const handleStartGame = useCallback((fighter: typeof FIGHTERS[0], level: typeof COMBAT_LEVELS[0]) => {
    setSelectedFighter(fighter);
    setSelectedLevel(level);
    setShowFighterModal(false);
    setPlayerHealth(fighter.hp);
    setEp(200);
    setDefeatedCount(0);
    setTotalDamageDealt(0);
    setIsVictory(false);
    setIsDefeated(false);
    setMatchSaved(false);
    setGlooWallCount(3);
    setMedkitCount(2);
    setGlooWalls([]);
    setTargetResetKey(prev => prev + 1);
    setInGame(true);

    const targetGov = YEMEN_GOVERNORATES.find(g => g.id === level.govId) || YEMEN_GOVERNORATES[0];
    const [spawnX, spawnY, spawnZ] = level.spawn || [targetGov.x, 2, targetGov.z + 4];
    
    if (playerRef.current) {
      playerRef.current.position.set(spawnX, spawnY, spawnZ);
    }
    setPlayerCoords({ x: spawnX, z: spawnZ });
    setCurrentGov(targetGov);
    setExploredGovs((exp) => new Set(exp).add(targetGov.id));

    addLog(`🪂 هبطت في ${level.name}! ابدأ اللوت واجمع الغنائم`, 'info');
  }, [addLog]);

  const isExtendedDrum = activeUpgrades.some(u => u.id === 'extended_drum');
  const maxAmmo = isExtendedDrum ? currentWeapon.magazineSize * 2 : currentWeapon.magazineSize;

  const handleConsumeAmmo = useCallback(() => {
    if (isReloading.current) return false;

    if (ammo <= 1) {
      setAmmo(0);
      isReloading.current = true;
      sounds.playReload();
      setNotification({ message: '⚠️ نفدت الذخيرة! جاري إعادة التلقيم...', type: 'warning' });
      setTimeout(() => {
        setAmmo(maxAmmo);
        isReloading.current = false;
        sounds.playWeaponSwitch();
        setNotification({ message: '✅ تم تلقيم السلاح بنجاح!', type: 'info' });
        setTimeout(() => setNotification(null), 1200);
      }, 1400);
      return false;
    }

    setAmmo(prev => prev - 1);
    return true;
  }, [ammo, maxAmmo]);

  const handleReload = useCallback(() => {
    if (isReloading.current || ammo >= maxAmmo) return;
    isReloading.current = true;
    sounds.playReload();
    setNotification({ message: '🔄 جاري التلقيم السريع...', type: 'info' });
    setTimeout(() => {
      setAmmo(maxAmmo);
      isReloading.current = false;
      sounds.playWeaponSwitch();
      setNotification({ message: '✅ السلاح جاهز للإطلاق!', type: 'success' });
      setTimeout(() => setNotification(null), 1200);
    }, 1100);
  }, [ammo, maxAmmo]);

  const handleSelectWeapon = useCallback((weapon: Weapon) => {
    setCurrentWeapon(weapon);
    const capacity = isExtendedDrum ? weapon.magazineSize * 2 : weapon.magazineSize;
    setAmmo(capacity);
    sounds.playWeaponSwitch();
    addLog(`🔫 جهزت: ${weapon.name}`, 'info');
  }, [isExtendedDrum, addLog]);

  // Deploy Free Fire Gloo Wall (جدار الغلو)
  const handleDeployGlooWall = useCallback(() => {
    if (glooWallCount <= 0) {
      addLog('⚠️ لا تمتلك جدران غلو! ابحث في الصناديق', 'info');
      return;
    }
    const rad = THREE.MathUtils.degToRad(cameraRotation.x);
    const forwardX = -Math.sin(rad);
    const forwardZ = -Math.cos(rad);
    const wallPos: [number, number, number] = [
      playerCoords.x + forwardX * 3.5,
      0,
      playerCoords.z + forwardZ * 3.5
    ];
    const newWall: GlooWallData = {
      id: Math.random().toString(36).substring(2, 9),
      position: wallPos,
      rotationY: rad,
      hp: 150,
      maxHp: 150,
      createdAt: Date.now()
    };
    setGlooWalls(prev => [...prev, newWall]);
    setGlooWallCount(prev => Math.max(0, prev - 1));
    sounds.playGlooWall();
    spawnParticles(wallPos, '#38bdf8');
    addLog('🧊 نشرت جدار غلو تكتيكي!', 'info');
  }, [glooWallCount, cameraRotation.x, playerCoords, addLog, spawnParticles]);

  const handleExpireGlooWall = useCallback((id: string) => {
    setGlooWalls(prev => prev.filter(w => w.id !== id));
  }, []);

  const handleDestroyGlooWall = useCallback((id: string, pos: [number, number, number]) => {
    setGlooWalls(prev => prev.filter(w => w.id !== id));
    spawnParticles(pos, '#38bdf8');
    sounds.playHit();
  }, [spawnParticles]);

  // Use Free Fire Medkit
  const handleUseMedkit = useCallback(() => {
    if (medkitCount <= 0 || playerHealth >= selectedFighter.hp) return;
    setMedkitCount(prev => Math.max(0, prev - 1));
    sounds.playMedkit();
    setPlayerHealth(prev => Math.min(selectedFighter.hp, prev + 75));
    setEp(prev => Math.min(maxEp, prev + 35));
    if (playerRef.current) {
      spawnParticles([playerCoords.x, 1, playerCoords.z], '#10b981');
    }
    addLog('💉 تم استخدام الإسعافات: +75 HP و +35 EP', 'loot');
  }, [medkitCount, playerHealth, selectedFighter.hp, maxEp, playerCoords, spawnParticles, addLog]);

  // Toggle Scope
  const handleToggleScope = useCallback(() => {
    setIsScoped(prev => {
      const next = !prev;
      sounds.playWeaponSwitch();
      return next;
    });
  }, []);

  const handleClaimAirdrop = useCallback((crateId: string, rewardType: 'weapon' | 'upgrade') => {
    sounds.playAirdrop();
    // Replenish Gloo Walls and Medkits on airdrop claim!
    setGlooWallCount(prev => Math.min(5, prev + 2));
    setMedkitCount(prev => Math.min(4, prev + 1));

    if (rewardType === 'weapon') {
      const locked = ['mp40', 'shotgun', 'sniper'].filter(w => !unlockedWeapons.includes(w));
      if (locked.length > 0) {
        const toUnlock = locked[0];
        setUnlockedWeapons(prev => [...prev, toUnlock]);
        const wObj = WEAPONS[toUnlock];
        setCurrentWeapon(wObj);
        setAmmo(wObj.magazineSize);
        addLog(`🎁 إسقاط جوي: تم فتح [${wObj.name}] + جدران غلو!`, 'loot');
        return;
      }
    }

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
        setArmorLevel(4);
      } else if (newUp.type === 'ammo') {
        setAmmo(prev => prev * 2);
      }

      addLog(`⚡ ترقية تكتيكية: ${newUp.name}!`, 'loot');
    } else {
      setAmmo(maxAmmo);
      setPlayerHealth(selectedFighter.hp);
      setEp(200);
      addLog(`✨ دروب أسطوري: تم ملء الصحة، طاقة EP، والذخيرة!`, 'loot');
    }
  }, [unlockedWeapons, activeUpgrades, maxAmmo, selectedFighter.hp, addLog]);

  // Safe Free Fire EP to HP regeneration (using refs to prevent nested setState / infinite update depth)
  const epRef = useRef(ep);
  epRef.current = ep;
  const hpRef = useRef(playerHealth);
  hpRef.current = playerHealth;
  const fighterHpRef = useRef(selectedFighter.hp);
  fighterHpRef.current = selectedFighter.hp;

  useEffect(() => {
    const epInterval = setInterval(() => {
      if (hpRef.current < fighterHpRef.current && epRef.current > 0) {
        setEp(prevEp => Math.max(0, prevEp - 2));
        setPlayerHealth(prevHp => Math.min(fighterHpRef.current, prevHp + 2));
      }
    }, 1500);
    return () => clearInterval(epInterval);
  }, []);

  // Global Keyboard listener using stable refs
  const deployGlooWallRef = useRef(handleDeployGlooWall);
  deployGlooWallRef.current = handleDeployGlooWall;
  const useMedkitRef = useRef(handleUseMedkit);
  useMedkitRef.current = handleUseMedkit;
  const reloadRef = useRef(handleReload);
  reloadRef.current = handleReload;
  const toggleScopeRef = useRef(handleToggleScope);
  toggleScopeRef.current = handleToggleScope;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.code === 'KeyG') {
        deployGlooWallRef.current();
      } else if (e.code === 'KeyH') {
        useMedkitRef.current();
      } else if (e.code === 'KeyR') {
        reloadRef.current();
      } else if (e.code === 'KeyF') {
        toggleScopeRef.current();
      } else if (e.code === 'Space') {
        setJumpTrigger(Date.now());
      } else if (e.code === 'KeyC') {
        setIsCrouching(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleHitEnemy = useCallback((enemyName: string, damage: number, hitPos?: [number, number, number], isHeadshot?: boolean) => {
    setTotalDamageDealt(prev => prev + damage);
    if (hitPos) {
      spawnParticles(hitPos, isHeadshot ? "#ef4444" : "#fbbf24");
    }
    if (isHeadshot) {
      addLog(`🎯 HEADSHOT! إصابة قاتلة في الرأس لـ [${enemyName}] (-${damage})`, 'info');
    }
  }, [spawnParticles, addLog]);

  const handleEnemyDie = useCallback((name: string) => {
    setDefeatedCount(prev => {
      const next = prev + 1;
      const isHead = Math.random() > 0.5;
      
      // Update Free Fire Kill Feed
      setKillFeed(kf => [
        ...kf, 
        { 
          id: Math.random().toString(), 
          killer: selectedFighter.englishName, 
          victim: name, 
          weapon: currentWeapon.name, 
          isHeadshot: isHead 
        }
      ].slice(-6));

      addLog(`💀 قضيت على [${name}] (+50$ كاش فوركس)`, 'kill');
      addCombatSpoils(50, `إسقاط ${name} في ${currentGov.name}`);

      // Check for BOOYAH Victory!
      if (next >= selectedLevel.enemyCount) {
        setIsVictory(true);
        addCombatSpoils(500, `BOOYAH! انتصار حاسم في ${selectedLevel.name}`);
        if (user && !matchSaved) {
          const matchId = `match_${Date.now()}`;
          setDoc(doc(db, 'matches', matchId), {
            matchId,
            userId: user.uid,
            kills: next,
            won: true,
            governorateId: currentGov.id,
            timestamp: new Date().toISOString()
          }).catch(err => handleFirestoreError(err, OperationType.CREATE, `matches/${matchId}`));
          setMatchSaved(true);
        }
      }
      return next;
    });
  }, [selectedLevel, addLog, user, matchSaved, currentGov.id, currentGov.name, addCombatSpoils, selectedFighter.englishName, currentWeapon.name]);

  const handleTakeDamage = useCallback((amount: number = 10, isZone: boolean = false) => {
    const marketShieldFactor = combatBonusActive ? 0.75 : 1.0;
    const effectiveDamage = isShieldActive ? amount * 0.4 : amount * marketShieldFactor;
    setIsDamageFlash(true);
    sounds.playHit();
    setTimeout(() => setIsDamageFlash(false), 180);

    setPlayerHealth(prev => {
      const next = Math.max(0, prev - effectiveDamage);
      if (next <= 0) {
        setIsDefeated(true);
        addLog('☠️ سقطت في النزال! حظاً أوفر', 'info');
        if (user && !matchSaved) {
          const matchId = `match_${Date.now()}`;
          setDoc(doc(db, 'matches', matchId), {
            matchId,
            userId: user.uid,
            kills: defeatedCount,
            won: false,
            governorateId: currentGov.id,
            timestamp: new Date().toISOString()
          }).catch(err => handleFirestoreError(err, OperationType.CREATE, `matches/${matchId}`));
          setMatchSaved(true);
        }
      } else if (isZone) {
        setNotification({ message: '⚠️ تحذير: المنطقة الآمنة تتقلص!', type: 'warning' });
        setTimeout(() => setNotification(null), 1000);
      }
      return next;
    });
  }, [addLog, user, matchSaved, defeatedCount, currentGov.id, isShieldActive, combatBonusActive]);

  const handleResetTargets = useCallback(() => {
    setTargetResetKey(prev => prev + 1);
    setPlayerHealth(selectedFighter.hp);
    setEp(200);
    setDefeatedCount(0);
    setTotalDamageDealt(0);
    setIsVictory(false);
    setIsDefeated(false);
    setMatchSaved(false);
    setGlooWallCount(3);
    setMedkitCount(2);
    setGlooWalls([]);
    if (playerRef.current) {
      playerRef.current.position.set(0, 2, 0);
      setPlayerCoords({ x: 0, z: 0 });
    }
    addLog('🔄 انطلقت معركة فري فاير جديدة!', 'info');
  }, [selectedFighter.hp, addLog]);

  const handlePickup = useCallback((item: { name: string; type: LootType; value: number }) => {
    sounds.playPickup();
    if (item.type === LootType.HealthKit) {
      setMedkitCount(prev => prev + 1);
      addLog(`🎁 لوت: حصلت على حقيبة إسعاف (Medkit)`, 'loot');
    } else if (item.type === LootType.Ammo) {
      setAmmo(prev => Math.min(maxAmmo, prev + item.value));
      addLog(`🎁 لوت: جمعت ذخيرة إضافية (+${item.value})`, 'loot');
    } else if (item.type === LootType.Armor) {
      setArmorLevel(3);
      setPlayerHealth(h => Math.min(selectedFighter.hp, h + 40));
      addLog(`🛡️ لوت: تم ارتداء درع ليفل 3 واقي!`, 'loot');
    }
  }, [maxAmmo, selectedFighter.hp, addLog]);

  if (authLoading) {
    return (
      <div className="w-full h-screen bg-slate-950 flex items-center justify-center">
        <LucideUser className="w-12 h-12 text-amber-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-slate-950 overflow-hidden font-sans relative select-none">
      
      {/* Free Fire Splash Screen */}
      {showSplash && (
        <FreeFireSplash onEnterLobby={() => {
          setShowSplash(false);
          setShowFighterModal(true);
        }} />
      )}

      {/* Main Game & Platform Switcher */}
      {!showSplash && (
        <div className="w-full h-full flex flex-col">
          {activeTab === 'GAME' ? (
            <>
              {/* 3D Canvas Viewport - Explicitly relative and flex to ensure visibility */}
              <div className="relative flex-1 bg-slate-900 overflow-hidden">
                <Canvas 
                  shadows 
                  camera={{ position: [0, 5, 10], fov: 50 }}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                  dpr={[1, 2]}
                >
                  {inGame ? (
                    <>
                      <World 
                        key={targetResetKey} 
                        playerRef={playerRef} 
                        onPickup={handlePickup} 
                        onAttackPlayer={(amt) => handleTakeDamage(amt)}
                        onZoneDamage={(amt) => handleTakeDamage(amt, true)}
                        enemyCount={selectedLevel.enemyCount}
                        onEnemyDie={handleEnemyDie}
                        onClaimAirdrop={handleClaimAirdrop}
                        glooWalls={glooWalls}
                        onExpireGlooWall={handleExpireGlooWall}
                        onDestroyGlooWall={handleDestroyGlooWall}
                      />
                      <Player 
                        ref={playerRef}
                        joystickInput={joystickInput} 
                        isShooting={isShooting} 
                        cameraRotation={cameraRotation}
                        viewMode={viewMode}
                        speedModifier={speedModifier * (combatBonusActive ? 1.15 : 1)}
                        damageModifier={damageModifier * (combatBonusActive ? 1.25 : 1)}
                        activeWeapon={currentWeapon}
                        onConsumeAmmo={handleConsumeAmmo}
                        onPositionChange={handlePositionChange}
                        onHitEnemy={handleHitEnemy}
                        onSpawnParticles={spawnParticles}
                        jumpTrigger={jumpTrigger}
                        isCrouching={isCrouching}
                      />
                      <CameraFollow 
                        target={playerRef} 
                        rotation={cameraRotation} 
                        viewMode={viewMode} 
                      />
                    </>
                  ) : (
                    <LobbyWorld selectedFighter={selectedFighter} />
                  )}
                  {particles.map((p) => (
                    <ImpactParticles key={p.id} position={p.pos} color={p.color} onFinish={() => removeParticles(p.id)} />
                  ))}
                </Canvas>
              </div>

              {/* Free Fire Combat Tactical HUD */}
              {inGame && !showFighterModal && !isVictory && !isDefeated && (
                <>
                  <CameraTouchZone onRotate={handleCameraRotate} />
                  <Compass rotationX={cameraRotation.x} />
                  
                  {/* Yemen Governorate Map & Free Fire Safe Zone Radar (Top Right) */}
                  <YemenMapRadar
                    playerX={playerCoords.x}
                    playerZ={playerCoords.z}
                    currentGov={currentGov}
                    exploredGovs={exploredGovs}
                    onTeleportToGov={handleTeleportToGov}
                  />

                  {/* Free Fire Tactical HUD (Bottom Center HP/EP) */}
                  <FreeFireHUD
                    playerHealth={playerHealth}
                    playerMaxHealth={selectedFighter.hp}
                    ep={ep}
                    maxEp={maxEp}
                    armorLevel={armorLevel}
                    helmetLevel={helmetLevel}
                    selectedFighter={selectedFighter}
                    currentWeapon={currentWeapon}
                    unlockedWeapons={unlockedWeapons}
                    activeUpgrades={activeUpgrades}
                    currentAmmo={ammo}
                    maxAmmo={maxAmmo}
                    glooWallCount={glooWallCount}
                    medkitCount={medkitCount}
                    backpackCount={backpackCount}
                    isScoped={isScoped}
                    onDeployGlooWall={handleDeployGlooWall}
                    onUseMedkit={handleUseMedkit}
                    onOpenBackpack={() => addLog('🎒 الحقيبة ممتلئة بنسبة 80%', 'info')}
                    onToggleScope={handleToggleScope}
                    onReload={handleReload}
                    onSelectWeapon={handleSelectWeapon}
                    defeatedCount={defeatedCount}
                    killFeed={killFeed}
                    forexEquity={forexAccount.equity}
                    floatingPnL={floatingPnL}
                    combatBonusActive={combatBonusActive}
                    onOpenForex={() => setActiveTab('FOREX')}
                    onOpenLobby={() => setShowFighterModal(true)}
                  />

                  {/* Weapon Selector Bar (Top Left) */}
                  <div className="fixed top-2 left-2 z-40 pointer-events-auto scale-90 origin-top-left">
                    <WeaponSelector 
                      currentWeapon={currentWeapon}
                      unlockedWeapons={unlockedWeapons}
                      activeUpgrades={activeUpgrades}
                      onSelectWeapon={handleSelectWeapon}
                      currentAmmo={ammo}
                      maxAmmo={maxAmmo}
                      onReload={handleReload}
                    />
                  </div>

                  {/* Authentic Free Fire Tactical Joystick (Bottom Left) */}
                  <Joystick onMove={handleJoystickMove} onSprintToggle={handleSprintToggle} />
                  
                   {/* Free Fire Fire, Jump & Crouch Controls (Bottom Right) */}
                  <ShootButton 
                    onShootStateChange={handleShootStateChange}
                    onJump={() => setJumpTrigger(Date.now())}
                    onCrouch={() => setIsCrouching(prev => !prev)}
                    onProne={() => addLog('🛌 وضعية البطح مفعلة (Prone Mode)', 'info')}
                  />

                  {/* Free Fire Hero Ability Button (Bottom Right, above shoot button) */}
                  <div className="fixed bottom-40 right-10 z-40 pointer-events-auto">
                    <AbilityButton 
                      ability={selectedFighter.ability} 
                      onActivate={handleActivateAbility} 
                      cooldown={15} 
                    />
                  </div>

                  {/* Top FPS/TPS and Auth controls (Top Center) - Refined and very small */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 pointer-events-auto scale-75">
                    <button 
                      onClick={() => setViewMode(prev => prev === 'FPS' ? 'TPS' : 'FPS')} 
                      className="bg-slate-900/60 backdrop-blur-sm px-2 py-1 rounded-lg text-white font-black text-[9px] flex items-center gap-1 border border-white/5 active:scale-95 transition-all"
                    >
                      {viewMode === 'FPS' ? <LucideUser className="w-3 h-3 text-amber-400" /> : <LucideEye className="w-3 h-3 text-amber-400" />}
                      <span>{viewMode}</span>
                    </button>
                    <div className="opacity-60 hover:opacity-100 transition-opacity">
                      <AuthSection user={user} />
                    </div>
                    <div className="opacity-60 hover:opacity-100 transition-opacity scale-90">
                      <PWAInstallButton />
                    </div>
                  </div>
                </>
              )}


              {/* Free Fire Lobby / Character & Map Select Modal */}
              <FighterSelectModal 
                isOpen={showFighterModal} 
                onStartGame={handleStartGame} 
                onClose={() => setShowFighterModal(false)}
                selectedFighter={selectedFighter}
                onFighterChange={setSelectedFighter}
                selectedLevel={selectedLevel}
                onLevelChange={setSelectedLevel}
              />
              
              <LeaderboardModal 
                isOpen={showLeaderboard} 
                onClose={() => setShowLeaderboard(false)} 
              />
              
              <PanoramaModal 
                isOpen={panorama.isOpen} 
                onClose={() => setPanorama({...panorama, isOpen: false})} 
                imageSrc={panorama.image} 
                title={panorama.title} 
              />
              
              {/* Legendary Free Fire BOOYAH! Screen */}
              {isVictory && (
                <BooyahScreen
                  kills={defeatedCount}
                  damageDealt={totalDamageDealt}
                  forexGain={500}
                  onPlayAgain={() => {
                    handleResetTargets();
                    setInGame(true);
                  }}
                  onReturnToLobby={() => {
                    handleResetTargets();
                    setInGame(false);
                    setShowFighterModal(true);
                  }}
                />
              )}

              {/* Free Fire Defeat Screen */}
              {isDefeated && !isVictory && (
                <DefeatScreen
                  kills={defeatedCount}
                  onPlayAgain={() => {
                    handleResetTargets();
                    setInGame(true);
                  }}
                  onReturnToLobby={() => {
                    handleResetTargets();
                    setInGame(false);
                    setShowFighterModal(true);
                  }}
                />
              )}
            </>
          ) : (
            <div className="flex-1 overflow-hidden">
              <ForexDashboard />
            </div>
          )}


          {/* Bottom Navigation - HIDDEN DURING GAMEPLAY TO ENABLE VISION */}
          {(!activeTab || activeTab === 'FOREX' || (activeTab === 'GAME' && showFighterModal)) && (
            <TabNavigation 
              activeTab={activeTab} 
              onTabChange={setActiveTab} 
              onOpenLeaderboard={() => setShowLeaderboard(true)}
              onOpenSettings={() => {
                setNotification({ message: '⚙️ تم ضبط إعدادات فري فاير التكتيكية', type: 'info' });
                setTimeout(() => setNotification(null), 2000);
              }}
              onOpenProfile={() => {
                if (user) {
                  setNotification({ message: `👑 مرحباً بك يا بطل: ${user.displayName || 'المحارب'}`, type: 'info' });
                } else {
                  setNotification({ message: '🚀 سجل دخولك لحفظ تصنيف الهيرويك والجوائز', type: 'warning' });
                }
                setTimeout(() => setNotification(null), 2000);
              }}
            />
          )}
        </div>
      )}


      {/* Global Notifications */}
      {notification && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
          <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-2xl backdrop-blur-md border text-xs sm:text-sm ${
            notification.type === 'error' 
              ? 'bg-rose-600/90 border-rose-400/50 text-white shadow-rose-900/50' 
              : 'bg-slate-900/95 border-amber-500/60 text-amber-300 shadow-amber-500/30'
          }`}>
            <LucidePackage className="w-4 h-4" />
            <span className="font-bold tracking-tight">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Damage Flash */}
      {isDamageFlash && (
        <div className="absolute inset-0 z-40 pointer-events-none bg-rose-600/25 ring-8 ring-inset ring-rose-500 animate-pulse" />
      )}
    </div>
  );
}
