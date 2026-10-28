import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { sounds } from '../../utils/soundEffects';

export enum EnemyType {
  Sniper = 'Sniper',
  Aggressive = 'Aggressive',
  Defensive = 'Defensive'
}

interface TargetProps {
  position: [number, number, number];
  name: string;
  playerRef: React.RefObject<THREE.Group | null>;
  onAttackPlayer: (amount: number, type: EnemyType) => void;
  onDie?: () => void;
  coverPositions: [number, number, number][];
  enemyType: EnemyType;
}

export const Target: React.FC<TargetProps> = ({ position, name, playerRef, onAttackPlayer, onDie, coverPositions, enemyType }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [showDamagePopup, setShowDamagePopup] = useState(false);
  const [targetCover, setTargetCover] = useState<[number, number, number] | null>(null);
  
  // AI Settings based on type
  const detectionRange = enemyType === EnemyType.Sniper ? 40 : 18;
  const attackRange = enemyType === EnemyType.Sniper ? 30 : 3.5;
  const attackCooldown = enemyType === EnemyType.Sniper ? 3.0 : 1.8;
  const moveSpeed = enemyType === EnemyType.Aggressive ? 5.5 : 3.4;
  const retreatHealthThreshold = enemyType === EnemyType.Defensive ? 50 : 35;
  const lastAttackTime = useRef(0);

  const findNearestCover = () => {
    const myPos = meshRef.current?.position;
    if (!myPos) return null;
    const nearbyCover = coverPositions.filter(pos => new THREE.Vector3(...pos).distanceTo(myPos) < 25);
    if (nearbyCover.length > 0) {
        return nearbyCover[Math.floor(Math.random() * nearbyCover.length)];
    }
    return null;
  }

  const takeDamage = (amount: number) => {
    if (isDead) return;
    
    sounds.playHit();
    setHealth((prev) => {
      const next = Math.max(0, prev - amount);
      if (next <= 0) {
        setIsDead(true);
        setTimeout(() => onDie?.(), 500);
      }
      return next;
    });

    setIsHit(true);
    setShowDamagePopup(true);
    setTimeout(() => setIsHit(false), 120);
    setTimeout(() => setShowDamagePopup(false), 700);

    // Seek cover when hit
    if (!targetCover) {
        const cover = findNearestCover();
        if (cover) setTargetCover(cover);
    }
  };

  useFrame((state, delta) => {
    if (isDead || !meshRef.current || !playerRef.current) return;

    const targetPos = meshRef.current.position;
    const playerPos = playerRef.current.position;
    const distance = targetPos.distanceTo(playerPos);

    // Look at player smoothly in all states
    const targetRotation = new THREE.Quaternion();
    const lookAtMatrix = new THREE.Matrix4();
    lookAtMatrix.lookAt(targetPos, playerPos, new THREE.Vector3(0, 1, 0));
    targetRotation.setFromRotationMatrix(lookAtMatrix);
    meshRef.current.quaternion.slerp(targetRotation, 0.15);

    // Cover Seeking Behavior
    if (targetCover) {
        const coverPos = new THREE.Vector3(...targetCover);
        const distanceToCover = targetPos.distanceTo(coverPos);

        if (distanceToCover > 2) {
            const direction = new THREE.Vector3().subVectors(coverPos, targetPos).normalize();
            direction.y = 0;
            meshRef.current.position.add(direction.multiplyScalar(moveSpeed * 1.5 * delta));
            return; // Skip other AI logic while moving to cover
        } else {
            setTargetCover(null); // Reached cover
        }
    }

    // Smart AI Behavior: Low Health Retreat & Cover Seeking or Tactical Flanking
    if (health <= retreatHealthThreshold) {
      // Seek cover if not already doing so
      if (!targetCover) {
          const cover = findNearestCover();
          if (cover) setTargetCover(cover);
      }
      
      // If no cover, or still close to player, strafe aggressively (flank)
      if (!targetCover || distance < 8) {
          const awayDir = new THREE.Vector3().subVectors(targetPos, playerPos).normalize();
          awayDir.y = 0;
          // Tactical strafe (flank)
          const strafe = new THREE.Vector3(-awayDir.z, 0, awayDir.x).multiplyScalar(Math.sin(state.clock.getElapsedTime() * 4) * 3.0);
          const move = awayDir.add(strafe).normalize().multiplyScalar(moveSpeed * 1.5 * delta);
          meshRef.current.position.add(move);
          return;
      }
    }

    // 1. Detection & Chasing
    if (distance <= detectionRange && distance > attackRange * 0.9) {
      // Move towards player
      const direction = new THREE.Vector3().subVectors(playerPos, targetPos).normalize();
      direction.y = 0; // Keep on ground
      meshRef.current.position.add(direction.multiplyScalar(moveSpeed * delta));
    }

    // 2. Attacking
    if (distance <= attackRange) {
      const now = state.clock.getElapsedTime();
      if (now - lastAttackTime.current >= attackCooldown) {
        lastAttackTime.current = now;
        sounds.playHit();
        onAttackPlayer(enemyType === EnemyType.Sniper ? 25 : 12, enemyType); // Bot deals damage based on type
      }
    }
  });

  if (isDead && health <= 0) return null;

  return (
    <group ref={meshRef} position={position} userData={{ type: 'target', takeDamage }}>
      {/* Bot Body (Capsule with aggressive red armor, flashing yellow/orange when retreating) */}
      <mesh castShadow name={name}>
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshStandardMaterial 
          color={isHit ? "#ffffff" : (health <= retreatHealthThreshold ? "#f59e0b" : "#e11d48")} 
          emissive={isHit ? "#ffffff" : (health <= retreatHealthThreshold ? "#b45309" : "#881337")}
          emissiveIntensity={isHit ? 2.5 : 0.5}
        />
      </mesh>

      {/* Eyes/Visor (Direction indicator) */}
      <mesh position={[0, 0.4, 0.4]}>
        <boxGeometry args={[0.4, 0.12, 0.1]} />
        <meshBasicMaterial color="#0f172a" />
      </mesh>

      {/* Floating Damage Popup when struck */}
      {showDamagePopup && (
        <Billboard position={[0, 2.6, 0]}>
          <Text
            fontSize={0.45}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
          >
            -25 HP
          </Text>
        </Billboard>
      )}

      {/* Health Bar Billboard & Cover Status */}
      <Billboard position={[0, 1.8, 0]}>
        <group>
          <mesh>
            <planeGeometry args={[2.2, 0.25]} />
            <meshBasicMaterial color="#000000" opacity={0.6} transparent />
          </mesh>
          <mesh position={[-(1.1 - (health / 100) * 1.1), 0, 0.01]}>
            <planeGeometry args={[(health / 100) * 2.2, 0.25]} />
            <meshBasicMaterial color={health > 50 ? "#10b981" : health <= retreatHealthThreshold ? "#f59e0b" : "#f43f5e"} />
          </mesh>
          <Text
            position={[0, 0.38, 0]}
            fontSize={0.25}
            color={health <= retreatHealthThreshold ? "#fcd34d" : "white"}
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
          >
            {health <= retreatHealthThreshold ? `${name} [تراجع/احتماء]` : name}
          </Text>
        </group>
      </Billboard>
    </group>
  );
};
