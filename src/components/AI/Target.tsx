import React, { useState, useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';

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
  
  // AI Settings
  const detectionRange = 15;
  const attackRange = 3;
  const attackCooldown = 2; // seconds
  const moveSpeed = 3;
  const lastAttackTime = useRef(0);

  const takeDamage = (amount: number) => {
    if (isDead) return;
    
    setHealth((prev) => {
      const next = Math.max(0, prev - amount);
      if (next <= 0) {
        setIsDead(true);
        setTimeout(() => onDie?.(), 500);
      }
      return next;
    });

    setIsHit(true);
    setTimeout(() => setIsHit(false), 100);
  };

  useFrame((state, delta) => {
    if (isDead || !meshRef.current || !playerRef.current) return;

    const targetPos = meshRef.current.position;
    const playerPos = playerRef.current.position;
    const distance = targetPos.distanceTo(playerPos);

    // 1. Detection & Chasing
    if (distance <= detectionRange && distance > attackRange * 0.8) {
      // Look at player (smoothly)
      const targetRotation = new THREE.Quaternion();
      const lookAtMatrix = new THREE.Matrix4();
      lookAtMatrix.lookAt(targetPos, playerPos, new THREE.Vector3(0, 1, 0));
      targetRotation.setFromRotationMatrix(lookAtMatrix);
      meshRef.current.quaternion.slerp(targetRotation, 0.1);

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
        onAttackPlayer(10); // Bot deals 10 damage
        console.log(`⚔️ ${name} attacked the player!`);
      }
    }
  });

  if (isDead && health <= 0) return null;

  return (
    <group ref={meshRef} position={position} userData={{ type: 'target', takeDamage }}>
      {/* Bot Body (Capsule/Enemy look) */}
      <mesh castShadow name={name}>
        <capsuleGeometry args={[0.5, 1, 4, 16]} />
        <meshStandardMaterial 
          color={isHit ? "#ffffff" : (health < 50 ? "#fca5a5" : "#ef4444")} 
          emissive={isHit ? "#ffffff" : "#991b1b"}
          emissiveIntensity={isHit ? 2 : 0.5}
        />
      </mesh>

      {/* Eyes/Visor (To show direction) */}
      <mesh position={[0, 0.4, 0.4]}>
        <boxGeometry args={[0.4, 0.1, 0.1]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* Health Bar Billboard */}
      <Billboard position={[0, 1.8, 0]}>
        <group>
          <mesh>
            <planeGeometry args={[2.2, 0.25]} />
            <meshBasicMaterial color="#000000" opacity={0.6} transparent />
          </mesh>
          <mesh position={[-(1.1 - (health / 100) * 1.1), 0, 0.01]}>
            <planeGeometry args={[(health / 100) * 2.2, 0.25]} />
            <meshBasicMaterial color={health > 50 ? "#10b981" : "#f43f5e"} />
          </mesh>
          <Text
            position={[0, 0.4, 0]}
            fontSize={0.25}
            color="white"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
          >
            {name}
          </Text>
        </group>
      </Billboard>
    </group>
  );
};
