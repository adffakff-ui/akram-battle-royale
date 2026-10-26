import React, { useState, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { World } from './components/Environment/World';
import { Player } from './components/Player/Player';
import { Joystick } from './components/UI/Joystick';
import { ShootButton } from './components/Combat/ShootButton';
import { CameraTouchZone } from './components/Camera/CameraTouchZone';
import { HealthBar } from './components/UI/HealthBar';
import { LootType } from './components/Inventory/LootItem';
import { 
  LucideGamepad2, 
  LucideMove, 
  LucideTarget, 
  LucideVideo, 
  LucideRefreshCcw, 
  LucideBox, 
  LucidePackage,
  LucideXCircle,
  LucideHeartPulse,
  LucideBackpack,
  LucideShieldAlert,
  LucideZap
} from 'lucide-react';
import * as THREE from 'three';

const MAX_CAPACITY = 5;

export default function App() {
  const [joystickInput, setJoystickInput] = useState({ x: 0, y: 0 });
  const [isShooting, setIsShooting] = useState(false);
  const [playerHealth, setPlayerHealth] = useState(100);
  const [targetResetKey, setTargetResetKey] = useState(0);
  
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

  const handleTakeDamage = useCallback((amount: number = 10, isZone: boolean = false) => {
    setPlayerHealth(prev => {
      const next = Math.max(0, prev - amount);
      if (next <= 0) {
        setNotification({ message: 'YOU HAVE FALLEN!', type: 'error' });
      } else if (isZone) {
        setNotification({ message: 'OUTSIDE SAFE ZONE!', type: 'warning' });
        setTimeout(() => setNotification(null), 1000);
      }
      return next;
    });
  }, []);

  const handleResetTargets = useCallback(() => {
    setTargetResetKey(prev => prev + 1);
    setPlayerHealth(100);
    setNotification({ message: 'BATTLEFIELD RESET', type: 'success' });
    setTimeout(() => setNotification(null), 2000);
  }, []);

  const handlePickup = useCallback((item: { name: string; type: LootType; value: number }) => {
    setInventory(prev => {
      if (prev.length >= MAX_CAPACITY) {
        setNotification({ message: 'INVENTORY FULL!', type: 'error' });
        setTimeout(() => setNotification(null), 2000);
        return prev;
      }
      
      const newItem = { ...item, id: Math.random().toString(36).substr(2, 9) };
      setNotification({ message: `PICKED UP ${item.name}`, type: 'success' });
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
        setNotification({ message: 'HEALTH RESTORED', type: 'success' });
        setTimeout(() => setNotification(null), 2000);
      }

      return prev.filter(i => i.id !== id);
    });
  }, []);

  return (
    <div className="w-full h-screen bg-slate-900 overflow-hidden font-sans relative">
      {/* 3D Viewport */}
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
        />
      </Canvas>

      {/* Input Listeners */}
      <CameraTouchZone onRotate={handleCameraRotate} />

      {/* HUD Layer */}
      <div className="absolute top-0 left-0 w-full p-8 pointer-events-none z-10 flex flex-col gap-6">
        <header className="flex justify-between items-start">
          <div className="bg-black/40 backdrop-blur-md border border-white/10 p-4 rounded-2xl flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
              <LucideGamepad2 className="text-indigo-400 w-5 h-5" />
            </div>
            <div>
              <h1 className="text-white font-bold text-sm tracking-tight leading-none">
                3D Mobile Controller
              </h1>
              <p className="text-white/40 text-[10px] uppercase font-bold tracking-wider mt-1">
                Battle Royale • React Three Fiber
              </p>
            </div>
          </div>

          <div className="flex gap-2 pointer-events-auto">
            <button 
              onClick={handleResetTargets}
              className="bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 px-4 py-2 rounded-full flex items-center gap-2 transition-all active:scale-95 group"
            >
              <LucideRefreshCcw className="w-3.5 h-3.5 text-white/60 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-white/80 text-[11px] font-bold tracking-tight">RESET BATTLE</span>
            </button>
          </div>
        </header>

        {/* Player Stats & Inventory */}
        <div className="flex flex-col gap-4">
          <HealthBar current={playerHealth} max={100} label="Player Health" />
          
          {/* Inventory Panel */}
          <div className="bg-black/40 backdrop-blur-md border border-white/10 p-5 rounded-3xl w-72 pointer-events-auto shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <LucideBackpack className="w-4 h-4 text-indigo-400" />
                <span className="text-white text-xs font-bold uppercase tracking-widest">Backpack</span>
              </div>
              <span className="text-white/40 font-mono text-[10px]">{inventory.length} / {MAX_CAPACITY}</span>
            </div>

            {inventory.length === 0 ? (
              <div className="py-8 text-center">
                <LucideBox className="w-8 h-8 text-white/5 mx-auto mb-2" />
                <p className="text-white/20 text-[10px] uppercase font-bold tracking-widest">No Items</p>
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {inventory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleUseItem(item.id)}
                    className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === LootType.HealthKit ? 'bg-emerald-500/20 text-emerald-400' : 
                        item.type === LootType.Ammo ? 'bg-indigo-500/20 text-indigo-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {item.type === LootType.HealthKit ? <LucideHeartPulse className="w-4 h-4" /> : <LucideBox className="w-4 h-4" />}
                      </div>
                      <div>
                        <p className="text-white text-[11px] font-bold tracking-tight">{item.name}</p>
                        <p className="text-white/40 text-[9px] uppercase tracking-wide">{item.type}</p>
                      </div>
                    </div>
                    <span className="text-indigo-400 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity uppercase">Use</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notifications */}
      {notification && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 z-50 animate-bounce pointer-events-none">
          <div className={`
            px-6 py-3 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-md border 
            ${notification.type === 'error' 
              ? 'bg-rose-500/90 border-rose-400/50 shadow-rose-500/20' 
              : notification.type === 'warning'
              ? 'bg-amber-500/90 border-amber-400/50 shadow-amber-500/20'
              : notification.type === 'info'
              ? 'bg-indigo-500/90 border-indigo-400/50 shadow-indigo-500/20'
              : 'bg-emerald-500/90 border-emerald-400/50 shadow-emerald-500/20'
            }
          `}>
            {notification.type === 'error' ? <LucideXCircle className="text-white w-5 h-5" /> : 
             notification.type === 'warning' ? <LucideZap className="text-white w-5 h-5 animate-pulse" /> :
             notification.type === 'info' ? <LucideBox className="text-white w-5 h-5" /> :
             <LucidePackage className="text-white w-5 h-5" />}
            <span className="text-white font-bold text-sm tracking-tight capitalize">{notification.message}</span>
          </div>
        </div>
      )}

      {/* On-screen Controls Overlay */}
      <Joystick onMove={handleJoystickMove} />
      <ShootButton onShootStateChange={handleShootStateChange} />

      {/* Control Tips Dock */}
      <div className="fixed top-32 right-8 z-50">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 p-6 rounded-3xl max-w-[240px] shadow-2xl text-left pointer-events-none">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
            <LucideZap className="w-4 h-4 text-amber-400" />
            Battle Royale
          </h3>
          <ul className="space-y-4">
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center border border-amber-500/30 shrink-0">
                <LucideZap className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-white/60 text-[11px] leading-relaxed">
                <strong className="text-white/90">The Zone:</strong> Stay inside the blue circle. Being outside will deal constant damage!
              </p>
            </li>
            <li className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30 shrink-0">
                <LucideBox className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-white/60 text-[11px] leading-relaxed">
                <strong className="text-white/90">Looting:</strong> Find and store medkits to survive the zone late-game.
              </p>
            </li>
          </ul>
        </div>
      </div>

      {/* Background Stylization */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/20 via-transparent to-transparent z-0" />
    </div>
  );
}
