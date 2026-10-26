import React, { useState, useEffect, useRef } from 'react';

interface CameraTouchZoneProps {
  onRotate: (deltaX: number, deltaY: number) => void;
}

export const CameraTouchZone: React.FC<CameraTouchZoneProps> = ({ onRotate }) => {
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const handleStart = (clientX: number, clientY: number) => {
    // Only handle if on the right half of the screen
    if (clientX > window.innerWidth / 2) {
      isDragging.current = true;
      lastPos.current = { x: clientX, y: clientY };
    }
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current) return;

    const deltaX = clientX - lastPos.current.x;
    const deltaY = clientY - lastPos.current.y;

    onRotate(deltaX, deltaY);
    lastPos.current = { x: clientX, y: clientY };
  };

  const handleEnd = () => {
    isDragging.current = false;
  };

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => handleStart(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchMove = (e: TouchEvent) => handleMove(e.touches[0].clientX, e.touches[0].clientY);
    const onTouchEnd = () => handleEnd();

    const onMouseDown = (e: MouseEvent) => handleStart(e.clientX, e.clientY);
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => handleEnd();

    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd);
    
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [onRotate]);

  return (
    // Transparent overlay for the right half to capture events specifically if needed, 
    // but the window listeners already filter by X position.
    // We'll keep it as a visual reminder/container in the DOM if we want, 
    // but for now the window listeners are more robust for drag-off-screen.
    null
  );
};
