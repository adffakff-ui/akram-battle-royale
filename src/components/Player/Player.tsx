import React, { useRef, useMemo, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Weapon, WEAPONS } from '../../data/weapons';

interface PlayerProps {
  joystickInput: { x: number; y: number };
  isShooting: boolean;
  cameraRotation: { x: number; y: number };
  viewMode: 'FPS' | 'TPS';
  speedModifier?: number;
  damageModifier?: number;
  activeWeapon?: Weapon;
  onPositionChange?: (x: number, z: number) => void;
  onHitEnemy?: (enemyName: string, damage: number, hitPos?: [number, number, number], isHeadshot?: boolean) => void;
  onSpawnParticles?: (pos: [number, number, number], color: string) => void;
  onConsumeAmmo?: () => boolean;
  jumpTrigger?: number;
  isCrouching?: boolean;
}

export const Player = forwardRef<THREE.Group, PlayerProps>(({ 
  joystickInput, 
  isShooting, 
  cameraRotation, 
  viewMode,
  speedModifier,
  damageModifier,
  activeWeapon = WEAPONS.assault,
  onPositionChange,
  onHitEnemy,
  onSpawnParticles,
  onConsumeAmmo,
  jumpTrigger,
  isCrouching
}, ref) => {
  const meshRef = useRef<THREE.Group>(null);
  const playerBodyRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.Mesh>(null);
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const isGrounded = useRef(true);
  const isJumping = useRef(false);
  const lastFireTime = useRef(0);
  const lastPosReportTime = useRef(0);
  const jumpScale = useRef(1.0); // For squash/stretch animation

  // Trigger jump when jumpTrigger prop changes
  useEffect(() => {
    if (jumpTrigger && isGrounded.current && !isJumping.current) {
      playerVelocity.current.y = 8.5; // Slightly stronger jump
      isGrounded.current = false;
      isJumping.current = true;
      jumpScale.current = 1.2; // Stretch on launch
      try { sounds.playTeleport(); } catch {}
    }
  }, [jumpTrigger]);

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
  const playerSpeed = 8.0 * (speedModifier || 1.0);
  const gravityValue = -18.0;
  const rotationSmoothing = 0.15;
  const fireRate = activeWeapon.fireRate;
  const range = activeWeapon.range;

  // Reusable vectors for optimization
  const _moveDir = useMemo(() => new THREE.Vector3(), []);
  const _targetRotation = useMemo(() => new THREE.Quaternion(), []);
  const _raycaster = useMemo(() => new THREE.Raycaster(), []);
  const _shootOrigin = useMemo(() => new THREE.Vector3(), []);
  const _shootDir = useMemo(() => new THREE.Vector3(), []);
  const _muzzlePos = useMemo(() => new THREE.Vector3(), []);

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

    // 2. Gravity & Jump Physics with feedback
    if (meshRef.current.position.y <= 1.0) {
      if (isJumping.current) {
        // Landing feedback: squash
        jumpScale.current = 0.8;
        isJumping.current = false;
      }
      isGrounded.current = true;
      playerVelocity.current.y = 0;
      meshRef.current.position.y = 1.0;
    } else {
      isGrounded.current = false;
    }
    
    if (!isGrounded.current) playerVelocity.current.y += gravityValue * delta;
    meshRef.current.position.y += playerVelocity.current.y * delta;

    // Smoothly return scale to normal (squash/stretch animation)
    jumpScale.current = THREE.MathUtils.lerp(jumpScale.current, 1.0, 10 * delta);
    if (playerBodyRef.current) {
      playerBodyRef.current.scale.set(1 / jumpScale.current, jumpScale.current, 1 / jumpScale.current);
    }

    // 3. Shooting logic (Touch Button OR Spacebar)
    const activeShooting = isShooting || keysRef.current.shoot;
    if (activeShooting) {
      const now = state.clock.getElapsedTime();
      if (now - lastFireTime.current >= fireRate) {
        // Check ammo
        if (onConsumeAmmo && !onConsumeAmmo()) {
          return;
        }

        lastFireTime.current = now;
        
        // Muzzle flash visual
        if (muzzleFlashRef.current) {
          muzzleFlashRef.current.visible = true;
          muzzleFlashRef.current.getWorldPosition(_muzzlePos);
          onSpawnParticles?.([_muzzlePos.x, _muzzlePos.y, _muzzlePos.z], activeWeapon.color);
          setTimeout(() => {
            if (muzzleFlashRef.current) muzzleFlashRef.current.visible = false;
          }, 60);
        }

        const isMelee = activeWeapon.isMelee;

        if (isMelee) {
          // Punch animation effect (rotate forward)
          if (playerBodyRef.current) {
            playerBodyRef.current.rotation.x = -0.3;
            setTimeout(() => { if (playerBodyRef.current) playerBodyRef.current.rotation.x = 0; }, 150);
          }
          try { sounds.playHit(); } catch {}
        }

        // Origin and direction from Camera (or player forward if melee)
        state.camera.getWorldPosition(_shootOrigin);
        state.camera.getWorldDirection(_shootDir);

        for (let p = 0; p < pelletsCount; p++) {
          if (!isMelee && spreadAmount > 0) {
            _shootDir.x += (Math.random() - 0.5) * spreadAmount;
            _shootDir.y += (Math.random() - 0.5) * spreadAmount;
            _shootDir.z += (Math.random() - 0.5) * spreadAmount;
            _shootDir.normalize();
          }

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
                // If it's a tactical Gloo Wall, it absorbs the bullet/punch
                if (targetObj.userData.isGlooWall) {
                  targetObj.userData.takeDamage(baseDamage);
                  onSpawnParticles?.([hit.point.x, hit.point.y, hit.point.z], isMelee ? '#ffffff' : '#38bdf8');
                  return;
                }

                // Check for headshot
                const isHeadshot = !isMelee && (hit.point.y > 1.4 || activeWeapon.category === 'sniper');
                const finalDamage = isHeadshot ? Math.round(baseDamage * 2.2) : baseDamage;
                targetObj.userData.takeDamage(finalDamage);
                onHitEnemy?.(targetObj.name || 'عدو', finalDamage, [hit.point.x, hit.point.y, hit.point.z], isHeadshot);
                onSpawnParticles?.([hit.point.x, hit.point.y, hit.point.z], isMelee ? '#ffffff' : (isHeadshot ? '#ef4444' : '#fbbf24'));
                return;
              }
              targetObj = targetObj.parent;
            }
            break; 
          }
        }
      }
    }

    // Reporting of movement and other logic handled in blocks above
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
