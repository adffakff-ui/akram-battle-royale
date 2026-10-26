import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Text } from '@react-three/drei';
import * as THREE from 'three';
import { sounds } from '../../utils/soundEffects';

export enum LootType {
  Weapon = 'Weapon',
  HealthKit = 'HealthKit',
  Ammo = 'Ammo',
  Armor = 'Armor'
}

interface LootItemProps {
  position: [number, number, number];
  name: string;
  type: LootType;
  value: number;
  playerRef: React.RefObject<THREE.Group | null>;
  onPickup: (item: { name: string; type: LootType; value: number }) => void;
}

export const LootItem: React.FC<LootItemProps> = ({ 
  position, 
  name, 
  type, 
  value, 
  playerRef, 
  onPickup 
}) => {
  const meshRef = useRef<THREE.Group>(null);
  const [isPickedUp, setIsPickedUp] = useState(false);
  const pickupRange = 3.0;

  // Colors based on type
  const colorMap = {
    [LootType.Weapon]: '#f59e0b', // Amber
    [LootType.HealthKit]: '#10b981', // Emerald
    [LootType.Ammo]: '#3b82f6', // Blue
    [LootType.Armor]: '#8b5cf6', // Violet
  };

  useFrame(() => {
    if (isPickedUp || !meshRef.current || !playerRef.current) return;

    const playerPos = playerRef.current.position;
    const itemPos = meshRef.current.position;
    const distance = playerPos.distanceTo(itemPos);

    if (distance <= pickupRange) {
      setIsPickedUp(true);
      sounds.playPickup();
      onPickup({ name, type, value });
    }
  });

  if (isPickedUp) return null;

  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1} position={position}>
      <group ref={meshRef}>
        {/* Visual representation based on type */}
        <mesh castShadow>
          {type === LootType.HealthKit ? (
            <boxGeometry args={[0.6, 0.4, 0.2]} />
          ) : type === LootType.Ammo ? (
            <cylinderGeometry args={[0.2, 0.2, 0.5, 8]} />
          ) : (
            <octahedronGeometry args={[0.4]} />
          )}
          <meshStandardMaterial 
            color={colorMap[type]} 
            emissive={colorMap[type]} 
            emissiveIntensity={0.5} 
          />
        </mesh>

        {/* Floating Label */}
        <Text
          position={[0, 0.8, 0]}
          fontSize={0.2}
          color="white"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
        >
          {name}
        </Text>
      </group>
    </Float>
  );
};
