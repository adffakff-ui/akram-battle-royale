import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LucideFlame, LucideLock, LucideUnlock } from 'lucide-react';

interface JoystickProps {
  onMove: (data: { x: number; y: number }) => void;
  onSprintToggle?: (isSprinting: boolean) => void;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove, onSprintToggle }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [handlePos, setHandlePos] = useState({ x: 0, y: 0 });
  const [isSprintLocked, setIsSprintLocked] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const activeTouchId = useRef<number | null>(null);

  // Update movement callback
  const emitMove = useCallback((x: number, y: number) => {
    onMove({ x, y });
  }, [onMove]);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    // If sprint is locked and user touches joystick, release sprint lock
    if (isSprintLocked) {
      setIsSprintLocked(false);
      onSprintToggle?.(false);
    }

    if ('targetTouches' in e) {
      const touch = e.targetTouches[0];
      activeTouchId.current = touch.identifier;
    }
    setIsDragging(true);
  };

  const handleMove = useCallback((e: TouchEvent | MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      let touch: Touch | undefined;
      if (activeTouchId.current !== null) {
        for (let i = 0; i < e.touches.length; i++) {
          if (e.touches[i].identifier === activeTouchId.current) {
            touch = e.touches[i];
            break;
          }
        }
      }
      if (!touch && e.touches.length > 0) {
        touch = e.touches[0];
      }
      if (!touch) return;
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxRadius = rect.width / 2;

    const normalizedDistance = Math.min(distance, maxRadius);
    const angle = Math.atan2(deltaY, deltaX);

    const x = Math.cos(angle) * normalizedDistance;
    const y = Math.sin(angle) * normalizedDistance;

    const normX = x / maxRadius;
    const normY = -(y / maxRadius); // Inverted so up is positive

    // Check if pushed far up into Free Fire Sprint Zone
    if (normY > 0.88 && Math.abs(normX) < 0.4) {
      setIsSprintLocked(true);
      onSprintToggle?.(true);
    }

    setHandlePos({ x, y });
    emitMove(normX, normY);
  }, [isDragging, emitMove, onSprintToggle]);

  const handleEnd = useCallback(() => {
    setIsDragging(false);
    activeTouchId.current = null;

    if (isSprintLocked) {
      // If locked, maintain forward run
      setHandlePos({ x: 0, y: -45 });
      emitMove(0, 1);
    } else {
      setHandlePos({ x: 0, y: 0 });
      emitMove(0, 0);
    }
  }, [isSprintLocked, emitMove]);

  const toggleSprintLock = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isSprintLocked) {
      setIsSprintLocked(false);
      setHandlePos({ x: 0, y: 0 });
      emitMove(0, 0);
      onSprintToggle?.(false);
    } else {
      setIsSprintLocked(true);
      setHandlePos({ x: 0, y: -45 });
      emitMove(0, 1);
      onSprintToggle?.(true);
    }
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
      window.addEventListener('touchcancel', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
      window.removeEventListener('touchcancel', handleEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  return (
    <div 
      id="freefire-joystick-root" 
      className="fixed bottom-6 left-6 sm:bottom-10 sm:left-10 z-40 select-none touch-none pointer-events-auto"
    >
      {/* 1. Free Fire Sprint Lock Zone (سحب للأعلى للركض التلقائي) */}
      <div className="flex flex-col items-center mb-1.5">
        <button
          type="button"
          onClick={toggleSprintLock}
          className={`px-3 py-1 rounded-full text-[10px] font-black flex items-center gap-1.5 transition-all shadow-lg cursor-pointer border ${
            isSprintLocked 
              ? 'bg-gradient-to-r from-amber-600 to-orange-500 border-yellow-300 text-white shadow-[0_0_20px_rgba(245,158,11,0.6)] animate-pulse'
              : 'bg-black/60 hover:bg-black/80 border-amber-500/40 text-amber-300/80 backdrop-blur-md'
          }`}
          title="قفل الركض التلقائي (Sprint Lock)"
        >
          {isSprintLocked ? (
            <>
              <LucideLock className="w-3 h-3 text-yellow-200" />
              <span>ركض تلقائي 🏃</span>
            </>
          ) : (
            <>
              <LucideUnlock className="w-3 h-3 text-amber-400/60" />
              <span>سحب للركض ↑</span>
            </>
          )}
        </button>
      </div>

      {/* 2. Authentic Free Fire Circular Joystick Base */}
      <div
        ref={containerRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className={`w-32 h-32 sm:w-36 sm:h-36 rounded-full flex items-center justify-center relative transition-colors shadow-2xl backdrop-blur-md border-2 ${
          isSprintLocked
            ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.4)]'
            : isDragging
            ? 'bg-black/60 border-amber-500/80'
            : 'bg-black/40 border-amber-500/40'
        }`}
      >
        {/* Free Fire Inner Radar Ring & Dashed Ticks */}
        <div className="absolute inset-2.5 rounded-full border border-dashed border-amber-400/25 pointer-events-none" />
        <div className="absolute inset-6 rounded-full border border-amber-500/20 pointer-events-none" />

        {/* Directional Chevrons (▲, ▼, ◄, ►) */}
        <div className="absolute top-1 text-amber-400/60 text-[9px] font-black pointer-events-none">▲</div>
        <div className="absolute bottom-1 text-amber-400/60 text-[9px] font-black pointer-events-none">▼</div>
        <div className="absolute left-1.5 text-amber-400/60 text-[9px] font-black pointer-events-none">◀</div>
        <div className="absolute right-1.5 text-amber-400/60 text-[9px] font-black pointer-events-none">▶</div>

        {/* Center Cross Guide Line */}
        <div className="absolute w-full h-[1px] bg-amber-500/10 pointer-events-none" />
        <div className="absolute h-full w-[1px] bg-amber-500/10 pointer-events-none" />

        {/* 3. Free Fire Metallic Golden Thumbstick Handle */}
        <div
          id="joystick-handle"
          className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center transition-transform duration-75 relative cursor-grab active:cursor-grabbing border-2 shadow-2xl ${
            isSprintLocked
              ? 'bg-gradient-to-tr from-amber-600 via-orange-500 to-yellow-400 border-yellow-200 shadow-[0_0_25px_rgba(245,158,11,0.8)] scale-105'
              : isDragging
              ? 'bg-gradient-to-tr from-slate-900 via-neutral-900 to-amber-950 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)] scale-100'
              : 'bg-gradient-to-tr from-slate-950 via-zinc-900 to-neutral-900 border-amber-500/60 shadow-lg'
          }`}
          style={{
            transform: `translate(${handlePos.x}px, ${handlePos.y}px)`,
          }}
        >
          {/* Inner Golden Ring */}
          <div className={`w-8 h-8 rounded-full border flex items-center justify-center ${
            isSprintLocked 
              ? 'border-yellow-200 bg-red-600/40' 
              : 'border-amber-400/50 bg-amber-500/20'
          }`}>
            <LucideFlame className={`w-4 h-4 ${isSprintLocked ? 'text-yellow-100 animate-bounce' : 'text-amber-400'}`} />
          </div>
        </div>
      </div>
    </div>
  );
};
