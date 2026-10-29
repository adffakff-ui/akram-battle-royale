import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export interface GlooWallData {
  id: string;
  position: [number, number, number];
  rotationY: number;
  hp: number;
  maxHp: number;
  createdAt: number;
}

interface GlooWallProps {
  wall: GlooWallData;
  onExpire: (id: string) => void;
  onDestroy: (id: string, pos: [number, number, number]) => void;
}

export const GlooWall: React.FC<GlooWallProps> = ({ wall, onExpire, onDestroy }) => {
  const meshRef = useRef<THREE.Group>(null);
  const [currentHp, setCurrentHp] = useState(wall.hp);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    // 15 seconds lifespan like authentic Free Fire
    const timer = setTimeout(() => {
      onExpire(wall.id);
    }, 15000);
    return () => clearTimeout(timer);
  }, [wall.id, onExpire]);

  // Expose takeDamage on userData for bullet raycasting
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.userData = {
        isGlooWall: true,
        takeDamage: (amount: number) => {
          setFlash(true);
          setTimeout(() => setFlash(false), 80);
          setCurrentHp(prev => {
            const next = prev - amount;
            if (next <= 0) {
              onDestroy(wall.id, wall.position);
              return 0;
            }
            return next;
          });
        }
      };
    }
  }, [wall.id, wall.position, onDestroy]);

  const hpRatio = Math.max(0, currentHp / wall.maxHp);

  return (
    <group 
      ref={meshRef} 
      position={wall.position} 
      rotation={[0, wall.rotationY, 0]}
    >
      {/* Curved Ice Shield Wall */}
      <mesh castShadow receiveShadow position={[0, 1.25, 0]}>
        <cylinderGeometry args={[2.2, 2.4, 2.5, 24, 2, true, -Math.PI * 0.45, Math.PI * 0.9]} />
        <meshStandardMaterial 
          color={flash ? "#ffffff" : "#38bdf8"} 
          emissive={flash ? "#ffffff" : "#0284c7"}
          emissiveIntensity={flash ? 1.5 : 0.4}
          roughness={0.15}
          metalness={0.1}
          transparent
          opacity={0.88 * hpRatio}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Cyberpunk Ice Reinforcements (Top and base border) */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[2.2, 2.22, 0.15, 24, 1, true, -Math.PI * 0.45, Math.PI * 0.9]} />
        <meshStandardMaterial color="#0284c7" metalness={0.8} roughness={0.2} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[0, 0.1, 0]}>
        <cylinderGeometry args={[2.4, 2.42, 0.2, 24, 1, true, -Math.PI * 0.45, Math.PI * 0.9]} />
        <meshStandardMaterial color="#0369a1" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Central Ice Core Crystal */}
      <mesh position={[0, 1.2, 0]}>
        <octahedronGeometry args={[0.5, 0]} />
        <meshStandardMaterial 
          color="#67e8f9" 
          emissive="#06b6d4" 
          emissiveIntensity={0.8} 
          roughness={0.1}
          metalness={0.9} 
        />
      </mesh>

      {/* Ambient Ice Glow PointLight */}
      <pointLight color="#38bdf8" intensity={2} distance={6} position={[0, 1.2, 0]} />
    </group>
  );
};
