import React, { useMemo } from 'react';
import { Grid, Environment, ContactShadows, Sky, Stars } from '@react-three/drei';
import { Target } from '../AI/Target';
import { LootItem, LootType } from '../Inventory/LootItem';
import { BlueZone } from './BlueZone';
import { YEMEN_GOVERNORATES } from '../../data/yemenGovernorates';
import { 
  YemenTowerHouse, 
  BabAlYaman, 
  ThroneOfBilqis, 
  DragonBloodTree, 
  SirahFortress, 
  ShaharahBridge, 
  GovernorateMarker 
} from './YemenArchitecture';
import * as THREE from 'three';

interface WorldProps {
  playerRef: React.RefObject<THREE.Group | null>;
  onPickup: (item: { name: string; type: LootType; value: number }) => void;
  onAttackPlayer: (amount: number) => void;
  onZoneDamage: (amount: number) => void;
  enemyCount?: number;
  onEnemyDie?: (name: string) => void;
}

export const World: React.FC<WorldProps> = ({ 
  playerRef, 
  onPickup, 
  onAttackPlayer, 
  onZoneDamage,
  enemyCount = 12,
  onEnemyDie
}) => {
  // Enhanced spawn points for soldiers
  const soldierSpawnPoints = useMemo(() => [
    { pos: [20, 1, -10] as [number, number, number], name: 'حارس مأرب' },
    { pos: [50, 1, -12] as [number, number, number], name: 'قناص شبام حضرموت' },
    { pos: [12, 1, 62] as [number, number, number], name: 'حامي قلعة صيرة - عدن' },
    { pos: [-10, 1, -30] as [number, number, number], name: 'حارس جسر شهارة - عمران' },
    { pos: [-20, 1, 30] as [number, number, number], name: 'حارس جبال إب' },
    { pos: [72, 1, 58] as [number, number, number], name: 'حارس جزيرة سقطرى' },
    { pos: [-45, 1, 20] as [number, number, number], name: 'خفير ميناء الحديدة' },
    { pos: [3, 1, 15] as [number, number, number], name: 'جندي باب اليمن - صنعاء' },
    { pos: [-6, 1, -18] as [number, number, number], name: 'حارس دار الحجر' },
    { pos: [35, 1, 18] as [number, number, number], name: 'مقاتل شبوة التاريخية' },
    { pos: [15, 1, -38] as [number, number, number], name: 'حارس معبد معين - الجوف' },
    { pos: [-35, 1, -28] as [number, number, number], name: 'حارس كحلان عفار - حجة' },
    { pos: [16, 1, 25] as [number, number, number], name: 'حارس منارة رداع - البيضاء' },
    { pos: [-28, 1, 8] as [number, number, number], name: 'حارس جبل برد - ريمة' },
    { pos: [-25, 1, -14] as [number, number, number], name: 'حارس كوكبان - المحويت' },
    { pos: [-2, 1, 55] as [number, number, number], name: 'حارس بساتين لحج' },
    { pos: [28, 1, 52] as [number, number, number], name: 'حارس دلتا أبين' },
    { pos: [-5, 1, 42] as [number, number, number], name: 'حارس جبال جحاف - الضالع' },
    { pos: [-2, 1, 18] as [number, number, number], name: 'حارس آثار بينون - ذمار' },
    { pos: [85, 1, -5] as [number, number, number], name: 'حارس محمية حوف - المهرة' },
    { pos: [-12, 1, -68] as [number, number, number], name: 'حارس سور صعدة التاريخي' },
    { pos: [-8, 1, -28] as [number, number, number], name: 'حارس عمران' },
  ], []);

  const activeSoldiers = useMemo(() => 
    soldierSpawnPoints.slice(0, Math.max(4, Math.min(soldierSpawnPoints.length, enemyCount))),
  [enemyCount, soldierSpawnPoints]);

  // Random environmental clutter (rocks/bushes) to make world feel "fuller"
  const clutter = useMemo(() => {
    const items = [];
    for (let i = 0; i < 60; i++) {
      items.push({
        pos: [(Math.random() - 0.5) * 400, 0.5, (Math.random() - 0.5) * 400] as [number, number, number],
        scale: 0.5 + Math.random() * 2,
        color: Math.random() > 0.5 ? "#78350f" : "#44403c"
      });
    }
    return items;
  }, []);

  return (
    <>
      {/* Dynamic Lighting */}
      <ambientLight intensity={0.7} color="#fffbeb" />
      <directionalLight
        position={[100, 100, 50]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={500}
        shadow-camera-left={-200}
        shadow-camera-right={200}
        shadow-camera-top={200}
        shadow-camera-bottom={-200}
        color="#fef3c7"
      />
      
      <Sky distance={450000} sunPosition={[100, 20, 100]} inclination={0} azimuth={0.25} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="sunset" />
      
      {/* Massive Ground Plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
        <planeGeometry args={[2000, 2000]} />
        <meshStandardMaterial color="#926239" roughness={0.9} />
      </mesh>
      
      {/* Decorative Environmental Clutter */}
      {clutter.map((c, i) => (
        <mesh key={i} position={c.pos} scale={c.scale} castShadow receiveShadow>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={c.color} roughness={0.8} />
        </mesh>
      ))}

      {/* Grid for Tactical Awareness */}
      <Grid
        infiniteGrid
        fadeDistance={250}
        fadeStrength={10}
        cellSize={5}
        sectionSize={25}
        sectionColor="#fbbf24"
        cellColor="#78350f"
        position={[0, 0.05, 0]}
      />

      {/* 1. Safe Zone System */}
      <BlueZone 
        playerRef={playerRef} 
        onZoneDamage={onZoneDamage} 
        initialScale={300} 
        minScale={20} 
        shrinkSpeed={1.0} 
      />

      {/* 2. Major Landmark Constructions */}
      <BabAlYaman position={[0, 0, -5]} />
      <YemenTowerHouse position={[-15, 0, -20]} height={12} width={4} name="قصر صنعاء" />
      <YemenTowerHouse position={[20, 0, 15]} height={10} width={3.5} />
      
      {/* 3. Governorate Specific Landmarks */}
      <ThroneOfBilqis position={[25, 0, -12]} />
      <group position={[55, 0, -15]}>
        <YemenTowerHouse position={[0, 0, 0]} height={14} width={4} color="#9a3412" name="شبام حضرموت" />
        <YemenTowerHouse position={[8, 0, 0]} height={11} width={3.5} color="#c2410c" />
        <YemenTowerHouse position={[-8, 0, 0]} height={12} width={3.5} color="#c2410c" />
      </group>

      <DragonBloodTree position={[75, 0, 60]} scale={1.5} />
      <DragonBloodTree position={[70, 0, 65]} scale={1.2} />
      <SirahFortress position={[12, 0, 65]} />
      <ShaharahBridge position={[-8, 0, -40]} />

      {/* 4. Active Waypoints for 22 Governorates */}
      {YEMEN_GOVERNORATES.map((gov) => (
        <GovernorateMarker key={gov.id} gov={gov} />
      ))}

      {/* 5. Dynamic Soldier AI - The "Fighters" requested by user */}
      {activeSoldiers.map((soldier, idx) => (
        <Target 
          key={idx} 
          position={soldier.pos} 
          name={soldier.name} 
          playerRef={playerRef} 
          onAttackPlayer={onAttackPlayer} 
          onDie={() => onEnemyDie?.(soldier.name)}
        />
      ))}

      {/* 6. Tactical Loot Drops */}
      <LootItem position={[5, 0.5, 5]} name="إسعافات أولية" type={LootType.HealthKit} value={40} playerRef={playerRef} onPickup={onPickup} />
      <LootItem position={[25, 0.5, -15]} name="ذخيرة ثقيلة" type={LootType.Ammo} value={50} playerRef={playerRef} onPickup={onPickup} />
      <LootItem position={[55, 0.5, -10]} name="درع واقي" type={LootType.Armor} value={50} playerRef={playerRef} onPickup={onPickup} />

      <ContactShadows opacity={0.4} scale={50} blur={2.5} far={10} resolution={1024} color="#000000" />
    </>
  );
};
