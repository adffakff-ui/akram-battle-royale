import React, { useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  joystickInput: { x: number; y: number };
  isShooting: boolean;
  cameraRotation: { x: number; y: number };
  viewMode: 'FPS' | 'TPS';
  onPositionChange?: (x: number, z: number) => void;
  onHitEnemy?: (enemyName: string, damage: number, hitPos?: [number, number, number]) => void;
  onSpawnParticles?: (pos: [number, number, number], color: string) => void;
}

export const Player = forwardRef<THREE.Group, PlayerProps>(({ 
  joystickInput, 
  isShooting, 
  cameraRotation, 
  viewMode,
  onPositionChange,
  onHitEnemy,
  onSpawnParticles
}, ref) => {
  const meshRef = useRef<THREE.Group>(null);
  const playerBodyRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.Mesh>(null);
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const isGrounded = useRef(true);
  const lastFireTime = useRef(0);
  const lastPosReportTime = useRef(0);

  // Keyboard controls state
  const keysRef = useRef({ forward: false, backward: false, left: false, right: false, shoot: false });

  // Expose the internal meshRef to the forwarded ref
  useImperativeHandle(ref, () => meshRef.current!);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysRef.current.forward = true;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.backward = true;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.left = true;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.right = true;
      if (e.code === 'Space') keysRef.current.shoot = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyW' || e.code === 'ArrowUp') keysRef.current.forward = false;
      if (e.code === 'KeyS' || e.code === 'ArrowDown') keysRef.current.backward = false;
      if (e.code === 'KeyA' || e.code === 'ArrowLeft') keysRef.current.left = false;
      if (e.code === 'KeyD' || e.code === 'ArrowRight') keysRef.current.right = false;
      if (e.code === 'Space') keysRef.current.shoot = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Constants
  const playerSpeed = 8.0;
  const gravityValue = -18.0;
  const rotationSmoothing = 0.15;
  const fireRate = 0.15;
  const range = 100;

  // Camera Settings
  const cameraOffsetTPS = useMemo(() => new THREE.Vector3(0, 2.5, 8), []);
  const cameraOffsetFPS = useMemo(() => new THREE.Vector3(0, 0.6, 0.2), []); // Slightly forward from center
  const cameraSmoothSpeed = 10;
  const cameraLookAtOffsetTPS = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);

  // Reusable vectors for optimization
  const _moveDir = useMemo(() => new THREE.Vector3(), []);
  const _targetRotation = useMemo(() => new THREE.Quaternion(), []);
  const _raycaster = useMemo(() => new THREE.Raycaster(), []);
  const _shootOrigin = useMemo(() => new THREE.Vector3(), []);
  const _shootDir = useMemo(() => new THREE.Vector3(), []);
  const _muzzlePos = useMemo(() => new THREE.Vector3(), []);
  
  // Camera math helpers
  const _camEuler = useMemo(() => new THREE.Euler(), []);
  const _camQuat = useMemo(() => new THREE.Quaternion(), []);
  const _camPos = useMemo(() => new THREE.Vector3(), []);
  const _lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Toggle body visibility based on view mode
    if (playerBodyRef.current) {
      playerBodyRef.current.visible = viewMode === 'TPS';
    }

    // 1. Movement logic (Combines Touch Joystick + Keyboard WASD)
    let moveX = joystickInput.x;
    let moveZ = -joystickInput.y;

    if (keysRef.current.left) moveX -= 1;
    if (keysRef.current.right) moveX += 1;
    if (keysRef.current.forward) moveZ -= 1;
    if (keysRef.current.backward) moveZ += 1;

    _moveDir.set(moveX, 0, moveZ);

    if (_moveDir.length() > 0.01) {
      if (_moveDir.length() > 1) _moveDir.normalize();
      meshRef.current.position.add(_moveDir.clone().multiplyScalar(playerSpeed * delta));
      
      if (viewMode === 'TPS') {
        const targetAngle = Math.atan2(_moveDir.x, _moveDir.z);
        _targetRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);
        meshRef.current.quaternion.slerp(_targetRotation, rotationSmoothing);
      }
    }

    // In FPS mode, player mesh always faces the camera's horizontal direction
    if (viewMode === 'FPS') {
      const radX = THREE.MathUtils.degToRad(cameraRotation.x);
      _targetRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), radX);
      meshRef.current.quaternion.slerp(_targetRotation, 1.0); // Snap rotation in FPS
    }

    // Report position every 100ms
    if (onPositionChange) {
      const now = state.clock.getElapsedTime();
      if (now - lastPosReportTime.current > 0.1) {
        lastPosReportTime.current = now;
        onPositionChange(meshRef.current.position.x, meshRef.current.position.z);
      }
    }

    // 2. Gravity logic
    if (meshRef.current.position.y <= 1.0) {
      isGrounded.current = true;
      playerVelocity.current.y = 0;
      meshRef.current.position.y = 1.0;
    } else {
      isGrounded.current = false;
    }
    if (!isGrounded.current) playerVelocity.current.y += gravityValue * delta;
    meshRef.current.position.y += playerVelocity.current.y * delta;

    // 3. Shooting logic (Touch Button OR Spacebar)
    const activeShooting = isShooting || keysRef.current.shoot;
    if (activeShooting) {
      const now = state.clock.getElapsedTime();
      if (now - lastFireTime.current >= fireRate) {
        lastFireTime.current = now;
        
        // Muzzle flash visual
        if (muzzleFlashRef.current) {
          muzzleFlashRef.current.visible = true;
          muzzleFlashRef.current.getWorldPosition(_muzzlePos);
          onSpawnParticles?.([_muzzlePos.x, _muzzlePos.y, _muzzlePos.z], "#fbbf24");
          setTimeout(() => {
            if (muzzleFlashRef.current) muzzleFlashRef.current.visible = false;
          }, 50);
        }

        const damageAmount = 25;

        // Origin and direction from Camera
        state.camera.getWorldPosition(_shootOrigin);
        state.camera.getWorldDirection(_shootDir);

        _raycaster.set(_shootOrigin, _shootDir);
        _raycaster.far = range;
        
        const intersects = _raycaster.intersectObjects(state.scene.children, true);
        
        for (const hit of intersects) {
          let isSelf = false;
          let current: THREE.Object3D | null = hit.object;
          while (current) {
            if (current === meshRef.current) {
              isSelf = true;
              break;
            }
            current = current.parent;
          }
          if (isSelf) continue;

          let targetObj: THREE.Object3D | null = hit.object;
          while (targetObj) {
            if (targetObj.userData && targetObj.userData.takeDamage) {
              targetObj.userData.takeDamage(damageAmount);
              onHitEnemy?.(targetObj.name || 'عدو', damageAmount, [hit.point.x, hit.point.y, hit.point.z]);
              return;
            }
            targetObj = targetObj.parent;
          }
          break; 
        }
      }
    }

    // 4. Smart Camera Follow
    const radX = THREE.MathUtils.degToRad(cameraRotation.x);
    const radY = THREE.MathUtils.degToRad(cameraRotation.y);
    
    if (viewMode === 'TPS') {
      _camEuler.set(radY, radX, 0, 'YXZ');
      _camQuat.setFromEuler(_camEuler);
      _camPos.copy(cameraOffsetTPS).applyQuaternion(_camQuat).add(meshRef.current.position);
      state.camera.position.lerp(_camPos, cameraSmoothSpeed * delta);
      _lookTarget.copy(meshRef.current.position).add(cameraLookAtOffsetTPS);
      state.camera.lookAt(_lookTarget);
    } else {
      // FPS Mode
      _camEuler.set(radY, radX, 0, 'YXZ');
      _camQuat.setFromEuler(_camEuler);
      
      // Position camera at head level
      _camPos.copy(cameraOffsetFPS).applyQuaternion(_camQuat).add(meshRef.current.position);
      state.camera.position.copy(_camPos); // In FPS, no lerp for responsiveness
      
      // Look forward from the camera's rotation
      _lookTarget.set(0, 0, -1).applyQuaternion(_camQuat).add(_camPos);
      state.camera.lookAt(_lookTarget);
    }
  });

  return (
    <group ref={meshRef} position={[0, 1, 0]}>
      <group ref={playerBodyRef}>
        {/* جسم المحارب اليمني (Player Avatar with Arabian Belt & Armor) */}
        <mesh castShadow receiveShadow>
          <capsuleGeometry args={[0.5, 1, 4, 16]} />
          <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.2} />
        </mesh>

        {/* حزام الجنبية التراثي اليمني (Traditional Yemeni Jambiya Belt) */}
        <mesh position={[0, 0, 0.45]}>
          <boxGeometry args={[0.5, 0.25, 0.2]} />
          <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* خوذة / قناع الرؤية (Visor) */}
        <mesh castShadow position={[0, 0.4, 0.4]}>
          <boxGeometry args={[0.6, 0.2, 0.2]} />
          <meshStandardMaterial color="#1e1b4b" roughness={0.1} metalness={0.8} />
        </mesh>

        {/* حقيبة الغنائم واللوت التكتيكية (Tactical Backpack) */}
        <mesh castShadow position={[0, 0.1, -0.4]}>
          <boxGeometry args={[0.6, 0.8, 0.3]} />
          <meshStandardMaterial color="#3730a3" roughness={0.5} />
        </mesh>
      </group>

      {/* وميض فوهة السلاح عند الإطلاق (Muzzle Flash) - Separate from body so it can be seen in FPS */}
      <mesh ref={muzzleFlashRef} position={[0, 0.3, 1.4]} visible={false}>
        <sphereGeometry args={[0.3, 8, 8]} />
        <meshBasicMaterial color="#fbbf24" />
        <pointLight color="#fbbf24" intensity={3} distance={5} />
      </mesh>
    </group>
  );
});
