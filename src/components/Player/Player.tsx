import React, { useRef, useMemo, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlayerProps {
  joystickInput: { x: number; y: number };
  isShooting: boolean;
  cameraRotation: { x: number; y: number };
}

export const Player = forwardRef<THREE.Group, PlayerProps>(({ joystickInput, isShooting, cameraRotation }, ref) => {
  const meshRef = useRef<THREE.Group>(null);
  const muzzleFlashRef = useRef<THREE.Mesh>(null);
  const playerVelocity = useRef(new THREE.Vector3(0, 0, 0));
  const isGrounded = useRef(true);
  const lastFireTime = useRef(0);

  // Expose the internal meshRef to the forwarded ref
  useImperativeHandle(ref, () => meshRef.current!);

  // Constants
  const playerSpeed = 8.0;
  const gravityValue = -18.0;
  const rotationSmoothing = 0.15;
  const fireRate = 0.15;
  const range = 50;

  // Camera Settings
  const cameraOffset = useMemo(() => new THREE.Vector3(0, 2.5, 8), []);
  const cameraSmoothSpeed = 10;
  const cameraLookAtOffset = useMemo(() => new THREE.Vector3(0, 1.5, 0), []);

  // Reusable vectors for optimization
  const _moveDir = useMemo(() => new THREE.Vector3(), []);
  const _targetRotation = useMemo(() => new THREE.Quaternion(), []);
  const _raycaster = useMemo(() => new THREE.Raycaster(), []);
  const _shootOrigin = useMemo(() => new THREE.Vector3(), []);
  const _shootDir = useMemo(() => new THREE.Vector3(), []);
  
  // Camera math helpers
  const _camEuler = useMemo(() => new THREE.Euler(), []);
  const _camQuat = useMemo(() => new THREE.Quaternion(), []);
  const _camPos = useMemo(() => new THREE.Vector3(), []);
  const _lookTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // 1. Movement logic
    const moveX = joystickInput.x;
    const moveZ = -joystickInput.y;
    _moveDir.set(moveX, 0, moveZ);

    if (_moveDir.length() > 0.01) {
      meshRef.current.position.add(_moveDir.clone().multiplyScalar(playerSpeed * delta));
      const targetAngle = Math.atan2(moveX, moveZ);
      _targetRotation.setFromAxisAngle(new THREE.Vector3(0, 1, 0), targetAngle);
      meshRef.current.quaternion.slerp(_targetRotation, rotationSmoothing);
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

    // 3. Shooting logic
    if (isShooting) {
      const now = state.clock.getElapsedTime();
      if (now - lastFireTime.current >= fireRate) {
        lastFireTime.current = now;
        
        if (muzzleFlashRef.current) {
          muzzleFlashRef.current.visible = true;
          setTimeout(() => {
            if (muzzleFlashRef.current) muzzleFlashRef.current.visible = false;
          }, 50);
        }

        const range = 100;
        const damageAmount = 25;

        // Origin and direction from Camera (matches MobileWeaponController.cs)
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
    _camEuler.set(radY, radX, 0, 'YXZ');
    _camQuat.setFromEuler(_camEuler);
    _camPos.copy(cameraOffset).applyQuaternion(_camQuat).add(meshRef.current.position);
    state.camera.position.lerp(_camPos, cameraSmoothSpeed * delta);
    _lookTarget.copy(meshRef.current.position).add(cameraLookAtOffset);
    state.camera.lookAt(_lookTarget);
  });

  return (
    <group ref={meshRef} position={[0, 1, 0]}>
      {/* Main Body */}
      <mesh castShadow receiveShadow>
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* Visor */}
      <mesh castShadow position={[0, 0.4, 0.4]}>
        <boxGeometry args={[0.6, 0.2, 0.2]} />
        <meshStandardMaterial color="#1e1b4b" roughness={0.1} metalness={0.8} />
      </mesh>

      {/* Muzzle Flash */}
      <mesh ref={muzzleFlashRef} position={[0, 0.4, 1.2]} visible={false}>
        <sphereGeometry args={[0.2, 8, 8]} />
        <meshBasicMaterial color="#fbbf24" />
        <pointLight color="#fbbf24" intensity={2} distance={3} />
      </mesh>

      {/* Backpack */}
      <mesh castShadow position={[0, 0.1, -0.4]}>
        <boxGeometry args={[0.6, 0.8, 0.3]} />
        <meshStandardMaterial color="#3730a3" roughness={0.5} />
      </mesh>
    </group>
  );
});
