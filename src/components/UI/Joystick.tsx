import React, { useState, useEffect, useRef } from 'react';

interface JoystickProps {
  onMove: (data: { x: number; y: number }) => void;
}

export const Joystick: React.FC<JoystickProps> = ({ onMove }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [handlePos, setHandlePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
  };

  const handleMove = (e: TouchEvent | MouseEvent) => {
    if (!isDragging || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
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

    setHandlePos({ x, y });
    onMove({
      x: x / maxRadius,
      y: -(y / maxRadius),
    });
  };

  const handleEnd = () => {
    setIsDragging(false);
    setHandlePos({ x: 0, y: 0 });
    onMove({ x: 0, y: 0 });
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    } else {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging]);

  return (
    <div id="movement-joystick" className="fixed bottom-12 left-12 z-50 select-none touch-none">
      <div
        ref={containerRef}
        onMouseDown={handleStart}
        onTouchStart={handleStart}
        className="w-32 h-32 rounded-full bg-black/20 backdrop-blur-md border border-white/20 flex items-center justify-center relative shadow-2xl"
      >
        {/* Background visual detail */}
        <div className="absolute inset-4 rounded-full border border-white/5 pointer-events-none" />
        
        {/* Joystick Handle */}
        <div
          id="joystick-handle"
          className="w-14 h-14 rounded-full bg-white/90 shadow-xl border border-white flex items-center justify-center transition-transform duration-75 active:scale-95 cursor-grab active:cursor-grabbing"
          style={{
            transform: `translate(${handlePos.x}px, ${handlePos.y}px)`,
          }}
        >
          <div className="w-6 h-6 rounded-full border-2 border-black/10 bg-amber-500/20" />
        </div>
      </div>
      
      {/* Visual Indicator */}
      <div className="mt-4 text-center">
        <span className="text-[10px] font-bold text-white/50 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full border border-white/10">
          Movement Controller
        </span>
      </div>
    </div>
  );
};
