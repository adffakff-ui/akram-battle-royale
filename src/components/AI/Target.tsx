import React, { useState, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { sounds } from '../../utils/soundEffects';

interface TargetProps {
  position: [number, number, number];
  name: string;
  playerRef: React.RefObject<THREE.Group | null>;
  onAttackPlayer: (amount: number) => void;
  onDie?: () => void;
}

export const Target: React.FC<TargetProps> = ({ position, name, playerRef, onAttackPlayer, onDie }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [health, setHealth] = useState(100);
  const [isDead, setIsDead] = useState(false);
  const [isHit, setIsHit] = useState(false);
  const [showDamagePopup, setShowDamagePopup] = useState(false);
  
  // AI Settings
  const detectionRange = 18;
  const attackRange = 3.5;
  const attackCooldown = 1.8; // seconds
  const moveSpeed = 3.4;
  const retreatHealthThreshold = 35; // Smart AI retreat threshold
  const lastAttackTime = useRef(0);

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

    // Smart AI Behavior: Low Health Retreat & Cover Seeking
    if (health <= retreatHealthThreshold && distance < 12) {
      // Retreat backwards / sideways away from player to find cover
      const awayDir = new THREE.Vector3().subVectors(targetPos, playerPos).normalize();
      awayDir.y = 0;
      // Add slight perpendicular strafe for tactical cover maneuvering
      const strafe = new THREE.Vector3(-awayDir.z, 0, awayDir.x).multiplyScalar(Math.sin(state.clock.getElapsedTime() * 3) * 1.5);
      const retreatMove = awayDir.add(strafe).normalize().multiplyScalar(moveSpeed * 1.2 * delta);
      meshRef.current.position.add(retreatMove);
      return;
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
        onAttackPlayer(12); // Bot deals 12 damage
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
