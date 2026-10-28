import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { sounds } from '../../utils/soundEffects';

interface AirdropCrateProps {
  id: string;
  position: [number, number, number];
  playerRef: React.RefObject<THREE.Group | null>;
  onClaim: (id: string, rewardType: 'weapon' | 'upgrade') => void;
}

export const AirdropCrate: React.FC<AirdropCrateProps> = ({
  id,
  position,
  playerRef,
  onClaim
}) => {
  const crateRef = useRef<THREE.Group>(null);
  const smokeRef = useRef<THREE.Mesh>(null);
  const [claimed, setClaimed] = useState(false);

  useFrame((state, delta) => {
    if (claimed || !crateRef.current || !playerRef.current) return;

    // Pulse the smoke beacon
    if (smokeRef.current) {
      smokeRef.current.rotation.y += delta * 0.5;
    }

    // Distance check
    const cratePos = crateRef.current.position;
    const playerPos = playerRef.current.position;
    const dist = cratePos.distanceTo(playerPos);

    if (dist < 3.2) {
      setClaimed(true);
      sounds.playAirdrop();
      // 50% chance of high tier weapon, 50% chance of tactical upgrade
      const reward = Math.random() > 0.5 ? 'weapon' : 'upgrade';
      onClaim(id, reward);
    }
  });

  if (claimed) return null;

  return (
    <group ref={crateRef} position={position}>
      {/* Crate Base Body */}
      <mesh castShadow receiveShadow position={[0, 0.7, 0]}>
        <boxGeometry args={[1.5, 1.4, 1.5]} />
        <meshStandardMaterial color="#b91c1c" roughness={0.6} metalness={0.2} />
      </mesh>

      {/* Crate Reinforced Metal Edges */}
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[1.55, 0.3, 1.55]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.7} />
      </mesh>

      {/* Parachute Pack on Top */}
      <mesh position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.6, 0.7, 0.4, 8]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.9} />
      </mesh>

      {/* Vertical Golden/Orange Smoke Beacon (Visible across governorates) */}
      <mesh ref={smokeRef} position={[0, 10, 0]}>
        <cylinderGeometry args={[0.3, 1.2, 18, 16]} />
        <meshBasicMaterial color="#f59e0b" transparent opacity={0.35} />
      </mesh>

      {/* Beacon Light */}
      <pointLight position={[0, 2, 0]} color="#f59e0b" intensity={3} distance={15} />

      {/* Floating 3D Text Header */}
      <Billboard position={[0, 2.6, 0]}>
        <Text
          fontSize={0.45}
          color="#fde047"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#0f172a"
        >
          إسقاط تكتيكي (اقترب للفتح) 🪂
        </Text>
      </Billboard>
    </group>
  );
};
