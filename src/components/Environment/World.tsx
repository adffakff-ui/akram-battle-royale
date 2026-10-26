import React from 'react';
import { Grid, Environment, Sky, ContactShadows } from '@react-three/drei';
import { Target } from '../AI/Target';
import { LootItem, LootType } from '../Inventory/LootItem';
import { BlueZone } from './BlueZone';
import * as THREE from 'three';

interface WorldProps {
  playerRef: React.RefObject<THREE.Group | null>;
  onPickup: (item: { name: string; type: LootType; value: number }) => void;
  onAttackPlayer: (amount: number) => void;
  onZoneDamage: (amount: number) => void;
}

export const World: React.FC<WorldProps> = ({ playerRef, onPickup, onAttackPlayer, onZoneDamage }) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      
      {/* Environment */}
      <Sky sunPosition={[100, 20, 100]} />
      <Environment preset="sunset" />
      
      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, 0, 0]}>
        <planeGeometry args={[1000, 1000]} />
        <meshStandardMaterial color="#10b981" roughness={0.8} />
      </mesh>
      
      {/* Grid */}
      <Grid
        infiniteGrid
        fadeDistance={100}
        fadeStrength={5}
        cellSize={1}
        sectionSize={5}
        sectionColor="#ffffff"
        cellColor="#ffffff"
        position={[0, 0.01, 0]}
      />

      {/* Battle Royale Blue Zone */}
      <BlueZone 
        playerRef={playerRef} 
        onZoneDamage={onZoneDamage} 
        initialScale={150} 
        minScale={5} 
        shrinkSpeed={1.0} 
      />

      {/* Interactive AI Enemy Bots */}
      <Target position={[0, 1, -15]} name="Enemy-Bot-Alpha" playerRef={playerRef} onAttackPlayer={onAttackPlayer} />
      <Target position={[15, 1, -10]} name="Enemy-Bot-Beta" playerRef={playerRef} onAttackPlayer={onAttackPlayer} />
      <Target position={[-15, 1, -20]} name="Enemy-Bot-Gamma" playerRef={playerRef} onAttackPlayer={onAttackPlayer} />

      {/* Loot Items */}
      <LootItem 
        position={[3, 0.5, 3]} 
        name="Medkit" 
        type={LootType.HealthKit} 
        value={25} 
        playerRef={playerRef}
        onPickup={onPickup}
      />
      <LootItem 
        position={[-5, 0.5, 0]} 
        name="Ammo Pack" 
        type={LootType.Ammo} 
        value={30} 
        playerRef={playerRef}
        onPickup={onPickup}
      />
      <LootItem 
        position={[0, 0.5, -5]} 
        name="Heavy Armor" 
        type={LootType.Armor} 
        value={50} 
        playerRef={playerRef}
        onPickup={onPickup}
      />

      {/* Decorative props */}
      <group position={[5, 0, -5]}>
        <mesh position={[0, 1, 0]} castShadow name="Tree Trunk">
          <coneGeometry args={[1, 2, 6]} />
          <meshStandardMaterial color="#065f46" />
        </mesh>
        <mesh position={[0, 0.25, 0]} name="Tree Base">
          <cylinderGeometry args={[0.2, 0.2, 0.5]} />
          <meshStandardMaterial color="#78350f" />
        </mesh>
      </group>

      <group position={[-8, 0, 10]}>
        <mesh castShadow position={[0, 0.5, 0]} name="Rock">
          <dodecahedronGeometry args={[0.8]} />
          <meshStandardMaterial color="#475569" roughness={0.9} />
        </mesh>
      </group>

      <ContactShadows
        opacity={0.4}
        scale={20}
        blur={2}
        far={4.5}
        resolution={256}
        color="#000000"
      />
    </>
  );
};
