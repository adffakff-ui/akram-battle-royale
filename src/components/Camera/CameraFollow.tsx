import React, { useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraFollowProps {
  /** The player or object group to follow */
  target: React.RefObject<THREE.Group | null>;
  /** External rotation state (degrees) from joystick/mouse */
  rotation: { x: number; y: number };
  /** 'FPS' for first-person, 'TPS' for third-person */
  viewMode: 'FPS' | 'TPS';
  /** How smoothly the camera tracks (lerp speed) */
  smoothSpeed?: number;
  /** Distance and height offset from player in TPS mode */
  offsetTPS?: [number, number, number];
  /** Where the camera points relative to player in TPS */
  lookAtOffsetTPS?: [number, number, number];
  /** Eye-level offset from player center in FPS */
  offsetFPS?: [number, number, number];
}

/**
 * CameraFollow Component
 * Smoothly tracks a target's position and orientation based on rotation inputs.
 * Supports hot-swapping between FPS and TPS perspectives.
 */
export const CameraFollow: React.FC<CameraFollowProps> = ({
  target,
  rotation,
  viewMode,
  smoothSpeed = 10,
  offsetTPS = [0, 2.5, 8],
  lookAtOffsetTPS = [0, 1.5, 0],
  offsetFPS = [0, 0.6, 0.2]
}) => {
  const { camera } = useThree();
  
  // Memoize vectors for internal math
  const _offsetTPS = useMemo(() => new THREE.Vector3(...offsetTPS), [offsetTPS]);
  const _lookAtOffsetTPS = useMemo(() => new THREE.Vector3(...lookAtOffsetTPS), [lookAtOffsetTPS]);
  const _offsetFPS = useMemo(() => new THREE.Vector3(...offsetFPS), [offsetFPS]);
  
  // Reusable math objects to avoid garbage collection pressure
  const _camEuler = useMemo(() => new THREE.Euler(), []);
  const _camQuat = useMemo(() => new THREE.Quaternion(), []);
  const _camPos = useMemo(() => new THREE.Vector3(), []);
  const _lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((_, delta) => {
    if (!target.current) return;

    // Convert rotation state (degrees) to radians
    const radX = THREE.MathUtils.degToRad(rotation.x);
    const radY = THREE.MathUtils.degToRad(rotation.y);
    
    // Construct rotation quaternion
    _camEuler.set(radY, radX, 0, 'YXZ');
    _camQuat.setFromEuler(_camEuler);

    if (viewMode === 'TPS') {
      // Calculate target position based on player and offset
      _camPos.copy(_offsetTPS).applyQuaternion(_camQuat).add(target.current.position);
      
      // Smoothly move camera
      camera.position.lerp(_camPos, smoothSpeed * delta);
      
      // Point at the player with an offset (e.g. chest/head level)
      _lookTarget.copy(target.current.position).add(_lookAtOffsetTPS);
      camera.lookAt(_lookTarget);
    } else {
      // FPS Mode: Snap to player position at eye level for high responsiveness
      _camPos.copy(_offsetFPS).applyQuaternion(_camQuat).add(target.current.position);
      camera.position.copy(_camPos);
      
      // Point forward relative to camera's orientation
      _lookTarget.set(0, 0, -1).applyQuaternion(_camQuat).add(_camPos);
      camera.lookAt(_lookTarget);
    }
  });

  return null; // This component logic only manipulates the Three.js camera
};
