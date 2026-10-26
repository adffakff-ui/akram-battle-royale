import React from 'react';
import { Grid, Environment, ContactShadows } from '@react-three/drei';
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
}

export const World: React.FC<WorldProps> = ({ 
  playerRef, 
  onPickup, 
  onAttackPlayer, 
  onZoneDamage 
}) => {
  return (
    <>
      {/* إضاءة شمس اليمن الذهبية (Warm Yemeni Sunlight) */}
      <ambientLight intensity={0.65} color="#fffbeb" />
      <directionalLight
        position={[45, 50, 30]}
        intensity={1.4}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={250}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        color="#fef3c7"
      />
      <directionalLight position={[-30, 20, -30]} intensity={0.4} color="#93c5fd" />
      
      {/* البيئة والسماء اليمنية */}
      <Environment preset="sunset" />
      
      {/* أرضية الخريطة اليمنية الكبرى (تضاريس رملية وجبلية دافئة) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[0, -0.05, 0]}>
        <planeGeometry args={[1200, 1200]} />
        <meshStandardMaterial color="#926239" roughness={0.92} metalness={0.05} />
      </mesh>
      
      {/* بقعة صنعاء واللواء الأخضر (إب والمحويت وريمة) باللون الأخضر والخصيب */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow position={[-15, 0.01, 30]}>
        <circleGeometry args={[45, 32]} />
        <meshStandardMaterial color="#2d6a4f" roughness={0.88} />
      </mesh>

      {/* سقطرى والمحيط (Turquoise Coastal Waters around Socotra & Aden) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[75, 0.02, 60]}>
        <circleGeometry args={[25, 32]} />
        <meshStandardMaterial color="#0284c7" roughness={0.3} metalness={0.2} transparent opacity={0.7} />
      </mesh>
      
      {/* شبكة الإحداثيات الاستراتيجية */}
      <Grid
        infiniteGrid
        fadeDistance={180}
        fadeStrength={6}
        cellSize={2}
        sectionSize={10}
        sectionColor="#fbbf24"
        cellColor="#78350f"
        position={[0, 0.05, 0]}
      />

      {/* 1. الدائرة الآمنة باتل رويال (Safe Zone) */}
      <BlueZone 
        playerRef={playerRef} 
        onZoneDamage={onZoneDamage} 
        initialScale={220} 
        minScale={12} 
        shrinkSpeed={0.8} 
      />

      {/* 2. معالم العاصمة صنعاء التاريخية (Center: 0, 0) */}
      <BabAlYaman position={[0, 0, -5]} />
      <YemenTowerHouse position={[-8, 0, -12]} height={9} width={3} name="قصر صنعاء القديم" />
      <YemenTowerHouse position={[8, 0, -14]} height={8} width={2.8} />
      <YemenTowerHouse position={[-14, 0, -6]} height={7} width={2.5} />
      <YemenTowerHouse position={[14, 0, -4]} height={7.5} width={2.6} />

      {/* 3. معالم مأرب وعرش بلقيس وسد سبأ (East-Center: 25, -12) */}
      <ThroneOfBilqis position={[25, 0, -12]} />
      {/* جدار سد مأرب القديم */}
      <mesh castShadow receiveShadow position={[32, 2.5, -20]}>
        <boxGeometry args={[18, 5, 3]} />
        <meshStandardMaterial color="#b45309" roughness={0.9} />
      </mesh>

      {/* 4. ناطحات سحاب شبام حضرموت (East: 55, -15) */}
      <group position={[55, 0, -15]}>
        <YemenTowerHouse position={[0, 0, 0]} height={11} width={3} color="#9a3412" name="ناطحات شبام حضرموت" />
        <YemenTowerHouse position={[4.5, 0, 2]} height={10} width={2.8} color="#9a3412" />
        <YemenTowerHouse position={[-4.5, 0, 2]} height={9.5} width={2.6} color="#c2410c" />
        <YemenTowerHouse position={[3, 0, -4]} height={9} width={2.7} color="#c2410c" />
        <YemenTowerHouse position={[-3, 0, -4]} height={8.5} width={2.5} color="#9a3412" />
      </group>

      {/* 5. جزيرة سقطرى وأشجار دم الأخوين (Far South-East: 75, 60) */}
      <DragonBloodTree position={[75, 0, 60]} scale={1.3} />
      <DragonBloodTree position={[72, 0, 56]} scale={1.1} />
      <DragonBloodTree position={[78, 0, 57]} scale={1.2} />
      <DragonBloodTree position={[76, 0, 65]} scale={1.0} />
      <DragonBloodTree position={[70, 0, 63]} scale={0.9} />

      {/* 6. قلعة صيرة في عدن (South: 12, 65) */}
      <SirahFortress position={[12, 0, 65]} />

      {/* 7. جسر شهارة المعلق في عمران (North: -8, -28) */}
      <ShaharahBridge position={[-8, 0, -28]} />

      {/* 8. أبراج وقلاع إب وتعز الخضراء */}
      <YemenTowerHouse position={[-18, 0, 32]} height={8} width={2.8} color="#047857" name="اللواء الأخضر - إب" />
      <YemenTowerHouse position={[-22, 0, 52]} height={8.5} width={3} color="#be185d" name="قلعة القاهرة - تعز" />

      {/* 9. علامات ومنارات محافظات اليمن الـ 22 (All 22 Governorate Waypoints) */}
      {YEMEN_GOVERNORATES.map((gov) => (
        <GovernorateMarker key={gov.id} gov={gov} />
      ))}

      {/* 10. بوتات الأعداء المتمركزة في المحافظات الرئيسية */}
      <Target position={[20, 1, -10]} name="حارس مأرب" playerRef={playerRef} onAttackPlayer={onAttackPlayer} />
      <Target position={[50, 1, -12]} name="قناص شبام حضرموت" playerRef={playerRef} onAttackPlayer={onAttackPlayer} />
      <Target position={[10, 1, 60]} name="حامي قلعة صيرة - عدن" playerRef={playerRef} onAttackPlayer={onAttackPlayer} />
      <Target position={[-10, 1, -30]} name="حارس جسر شهارة - عمران" playerRef={playerRef} onAttackPlayer={onAttackPlayer} />
      <Target position={[-20, 1, 30]} name="حارس جبال إب" playerRef={playerRef} onAttackPlayer={onAttackPlayer} />
      <Target position={[72, 1, 58]} name="حارس جزيرة سقطرى" playerRef={playerRef} onAttackPlayer={onAttackPlayer} />
      <Target position={[-45, 1, 20]} name="خفير ميناء الحديدة" playerRef={playerRef} onAttackPlayer={onAttackPlayer} />

      {/* 11. صناديق اللوت المنتشرة عبر محافظات اليمن */}
      <LootItem position={[2, 0.5, 4]} name="علاج باب اليمن" type={LootType.HealthKit} value={35} playerRef={playerRef} onPickup={onPickup} />
      <LootItem position={[27, 0.5, -10]} name="ذخيرة سبأ - مأرب" type={LootType.Ammo} value={40} playerRef={playerRef} onPickup={onPickup} />
      <LootItem position={[58, 0.5, -13]} name="درع شبام الفولاذي" type={LootType.Armor} value={60} playerRef={playerRef} onPickup={onPickup} />
      <LootItem position={[14, 0.5, 62]} name="ترياق صيرة - عدن" type={LootType.HealthKit} value={45} playerRef={playerRef} onPickup={onPickup} />
      <LootItem position={[74, 0.5, 61]} name="دم الأخوين السقطري" type={LootType.HealthKit} value={50} playerRef={playerRef} onPickup={onPickup} />
      <LootItem position={[-6, 0.5, -26]} name="عتاد شهارة - عمران" type={LootType.Ammo} value={50} playerRef={playerRef} onPickup={onPickup} />
      <LootItem position={[-19, 0.5, 34]} name="إسعاف اللواء الأخضر - إب" type={LootType.HealthKit} value={40} playerRef={playerRef} onPickup={onPickup} />
      <LootItem position={[-23, 0.5, 50]} name="درع قلعة القاهرة - تعز" type={LootType.Armor} value={50} playerRef={playerRef} onPickup={onPickup} />
      <LootItem position={[-46, 0.5, 24]} name="ذخيرة ساحل الحديدة" type={LootType.Ammo} value={35} playerRef={playerRef} onPickup={onPickup} />

      <ContactShadows
        opacity={0.4}
        scale={40}
        blur={2}
        far={6}
        resolution={512}
        color="#000000"
      />
    </>
  );
};
