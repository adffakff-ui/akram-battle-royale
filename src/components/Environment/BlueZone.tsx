import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BlueZoneProps {
  playerRef: React.RefObject<THREE.Group | null>;
  onZoneDamage: (amount: number) => void;
  initialScale?: number;
  minScale?: number;
  shrinkSpeed?: number;
}

export const BlueZone: React.FC<BlueZoneProps> = ({ 
  playerRef, 
  onZoneDamage, 
  initialScale = 100, 
  minScale = 10, 
  shrinkSpeed = 0.5 
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const [scale, setScale] = useState(initialScale);
  const lastDamageTime = useRef(0);
  const damageInterval = 1; // 1 second
  const zoneDamage = 5;

  useFrame((state, delta) => {
    if (!meshRef.current || !playerRef.current) return;

    // 1. Shrink Zone
    if (scale > minScale) {
      const newScale = Math.max(minScale, scale - shrinkSpeed * delta);
      setScale(newScale);
      meshRef.current.scale.set(newScale, 100, newScale); // High Y to look like a cylinder wall
    }

    // 2. Check Player Position (Horizontal distance only)
    const playerPos = playerRef.current.position;
    const center = new THREE.Vector3(0, 0, 0); // Assuming center is origin
    const distance = new THREE.Vector2(playerPos.x, playerPos.z).distanceTo(new THREE.Vector2(0, 0));
    
    const currentRadius = scale / 2;

    if (distance > currentRadius) {
      const now = state.clock.getElapsedTime();
      if (now - lastDamageTime.current >= damageInterval) {
        lastDamageTime.current = now;
        onZoneDamage(zoneDamage);
      }
    }
  });

  return (
    <group>
      {/* Visual Zone Wall */}
      <mesh ref={meshRef} position={[0, 0, 0]} scale={[initialScale, 100, initialScale]}>
        <cylinderGeometry args={[1, 1, 1, 64, 1, true]} />
        <meshStandardMaterial 
          color="#3b82f6" 
          transparent 
          opacity={0.15} 
          side={THREE.DoubleSide}
          emissive="#3b82f6"
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Grid line on ground showing the edge */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
        <ringGeometry args={[scale / 2 - 0.2, scale / 2, 64]} />
        <meshBasicMaterial color="#3b82f6" transparent opacity={0.8} />
      </mesh>
    </group>
  );
};
