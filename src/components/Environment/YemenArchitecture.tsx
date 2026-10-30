import React from 'react';
import { Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import { YEMEN_GOVERNORATES, Governorate } from '../../data/yemenGovernorates';

// 1. برج معماري طيني يمني مع زخارف القمريات (Sana'a / Shibam Tower)
export const YemenTowerHouse: React.FC<{
  position: [number, number, number];
  height?: number;
  width?: number;
  color?: string;
  name?: string;
}> = ({ position, height = 7, width = 2.5, color = '#b45309', name }) => {
  return (
    <group position={position}>
      {/* البرج الطيني الرئيسي */}
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <boxGeometry args={[width, height, width]} />
        <meshStandardMaterial color={color} roughness={0.9} />
      </mesh>

      {/* التاج الأبيض والشرفات العليا (Gypsum Crown & Parapets) */}
      <mesh position={[0, height + 0.3, 0]}>
        <boxGeometry args={[width + 0.2, 0.6, width + 0.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.7} />
      </mesh>
      
      {/* زوايا الشرفات التقليدية */}
      {[-width / 2, width / 2].map((x, i) =>
        [-width / 2, width / 2].map((z, j) => (
          <mesh key={`${i}-${j}`} position={[x, height + 0.8, z]}>
            <coneGeometry args={[0.2, 0.5, 4]} />
            <meshStandardMaterial color="#f8fafc" />
          </mesh>
        ))
      )}

      {/* نوافذ القمريات والزخارف البيضاء على الطوابق (Qamariyah Windows) */}
      {Array.from({ length: Math.floor(height / 1.5) }).map((_, floor) => {
        const y = 1.2 + floor * 1.5;
        return (
          <group key={floor} position={[0, y, 0]}>
            {/* واجهة أمامية */}
            <mesh position={[0, 0, width / 2 + 0.02]}>
              <planeGeometry args={[width * 0.7, 0.45]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
            <mesh position={[0, 0, width / 2 + 0.03]}>
              <planeGeometry args={[width * 0.5, 0.35]} />
              <meshBasicMaterial color="#1e293b" />
            </mesh>
            {/* واجهة خلفية */}
            <mesh position={[0, 0, -width / 2 - 0.02]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[width * 0.7, 0.45]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        );
      })}

      {name && (
        <Billboard position={[0, height + 2, 0]}>
          <Text
            fontSize={0.6}
            color="#fef08a"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
          >
            {name}
          </Text>
        </Billboard>
      )}
    </group>
  );
};

// 2. باب اليمن التاريخي (Bab Al-Yaman Gate)
export const BabAlYaman: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* البرج الأيمن للبوابة */}
      <mesh castShadow receiveShadow position={[-3.5, 3.5, 0]}>
        <cylinderGeometry args={[1.6, 2, 7, 16]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>
      {/* البرج الأيسر للبوابة */}
      <mesh castShadow receiveShadow position={[3.5, 3.5, 0]}>
        <cylinderGeometry args={[1.6, 2, 7, 16]} />
        <meshStandardMaterial color="#92400e" roughness={0.9} />
      </mesh>
      {/* القوس العلوي لباب اليمن */}
      <mesh castShadow receiveShadow position={[0, 6, 0]}>
        <boxGeometry args={[9, 2.2, 2.5]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* الحلية المعمارية البيضاء فوق الباب */}
      <mesh position={[0, 7.3, 0]}>
        <boxGeometry args={[7, 0.6, 2.7]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      {/* اسم المعلم */}
      <Billboard position={[0, 8.5, 0]}>
        <Text
          fontSize={0.7}
          color="#fbbf24"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
        >
          باب اليمن - صنعاء القديمة
        </Text>
      </Billboard>
    </group>
  );
};

// 3. عرش بلقيس وأعمدة سبأ في مأرب (Throne of Bilqis)
export const ThroneOfBilqis: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  const pillars = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
  return (
    <group position={position}>
      {/* القاعدة الحجرية الكبيرة */}
      <mesh receiveShadow position={[0, 0.4, 0]}>
        <boxGeometry args={[9, 0.8, 5]} />
        <meshStandardMaterial color="#d4b996" roughness={0.8} />
      </mesh>
      {/* أعمدة عرش بلقيس الستة التاريخية */}
      {pillars.map((offset, i) => (
        <mesh key={i} castShadow position={[offset, 3.2, 0]}>
          <boxGeometry args={[0.5, 5.6, 0.6]} />
          <meshStandardMaterial color="#e6ccb2" roughness={0.6} />
        </mesh>
      ))}
      <Billboard position={[0, 7, 0]}>
        <Text
          fontSize={0.65}
          color="#fed7aa"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
        >
          عرش بلقيس - مأرب الحضارة
        </Text>
      </Billboard>
    </group>
  );
};

// 4. شجرة دم الأخوين في سقطرى (Socotra Dragon Blood Tree)
export const DragonBloodTree: React.FC<{
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      {/* جذع الشجرة المتفرع */}
      <mesh castShadow position={[0, 1.8, 0]}>
        <cylinderGeometry args={[0.25, 0.6, 3.6, 8]} />
        <meshStandardMaterial color="#713f12" roughness={0.9} />
      </mesh>
      {/* الفروع المظلية */}
      <mesh castShadow position={[0, 3.5, 0]}>
        <cylinderGeometry args={[1.5, 0.4, 0.8, 8]} />
        <meshStandardMaterial color="#854d0e" roughness={0.9} />
      </mesh>
      {/* المظلة الكروية الكثيفة الشهيرة لشجرة دم الأخوين */}
      <mesh castShadow position={[0, 4.3, 0]}>
        <cylinderGeometry args={[2.5, 0.2, 1.2, 16]} />
        <meshStandardMaterial color="#15803d" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[0, 4.8, 0]}>
        <sphereGeometry args={[1.8, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
    </group>
  );
};

// 5. قلعة صيرة في عدن (Sirah Fortress in Aden)
export const SirahFortress: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* الصخرة البركانية لجزيرة صيرة */}
      <mesh receiveShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[4.5, 6, 3, 16]} />
        <meshStandardMaterial color="#334155" roughness={0.95} />
      </mesh>
      {/* أسوار القلعة والبرج */}
      <mesh castShadow position={[0, 4, 0]}>
        <cylinderGeometry args={[2.8, 3.2, 2.5, 12]} />
        <meshStandardMaterial color="#64748b" roughness={0.8} />
      </mesh>
      {/* شرفات القلعة ومدافع المراقبة */}
      <mesh castShadow position={[0, 5.5, 0]}>
        <cylinderGeometry args={[1.4, 1.6, 1.2, 8]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
      <Billboard position={[0, 7.5, 0]}>
        <Text
          fontSize={0.65}
          color="#93c5fd"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
        >
          قلعة صيرة - عدن الباسلة
        </Text>
      </Billboard>
    </group>
  );
};

// 6. جسر شهارة المعلق في عمران (Shaharah Bridge)
export const ShaharahBridge: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      {/* الجبل الأيمن */}
      <mesh position={[-4, 3, 0]}>
        <boxGeometry args={[3, 6, 3]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} />
      </mesh>
      {/* الجبل الأيسر */}
      <mesh position={[4, 3, 0]}>
        <boxGeometry args={[3, 6, 3]} />
        <meshStandardMaterial color="#57534e" roughness={0.95} />
      </mesh>
      {/* قوس الجسر الحجري المعلق */}
      <mesh position={[0, 5, 0]}>
        <boxGeometry args={[5.5, 0.4, 1.5]} />
        <meshStandardMaterial color="#a8a29e" roughness={0.8} />
      </mesh>
      <Billboard position={[0, 6.8, 0]}>
        <Text
          fontSize={0.6}
          color="#c084fc"
          anchorX="center"
          anchorY="middle"
          font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
        >
          جسر شهارة المعلق - عمران
        </Text>
      </Billboard>
    </group>
  );
};

// 7. علامات ولافتات المحافظات اليمنية العائمة (Governorate Waypoint Pillars)
export const GovernorateMarker: React.FC<{
  gov: Governorate;
  playerPos?: THREE.Vector3;
}> = ({ gov }) => {
  return (
    <group position={[gov.x, 0, gov.z]}>
      {/* قاعدة العمود الحجرية */}
      <mesh receiveShadow position={[0, 0.4, 0]}>
        <cylinderGeometry args={[1.5, 2, 0.8, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} />
      </mesh>
      {/* أسطوانة منارة مضيئة بلون المحافظة */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.3, 0.3, 4.2, 16]} />
        <meshStandardMaterial color={gov.color} emissive={gov.color} emissiveIntensity={0.6} />
      </mesh>
      {/* جوهرة مشعة في القمة */}
      <mesh position={[0, 4.8, 0]}>
        <octahedronGeometry args={[0.7]} />
        <meshStandardMaterial color={gov.color} emissive={gov.color} emissiveIntensity={1.5} />
      </mesh>

      {/* لوحة اسم المحافظة والعنوان التاريخي */}
      <Billboard position={[0, 6.5, 0]}>
        <group>
          {/* خلفية اللوحة */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[5, 1.6]} />
            <meshBasicMaterial color="#0f172a" transparent opacity={0.85} />
          </mesh>
          {/* إطار بلون المحافظة */}
          <mesh position={[0, 0, -0.04]}>
            <planeGeometry args={[5.15, 1.75]} />
            <meshBasicMaterial color={gov.color} />
          </mesh>
          {/* اسم المحافظة بالعربية */}
          <Text
            position={[0, 0.35, 0.05]}
            fontSize={0.6}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
          >
            {gov.name}
          </Text>
          {/* اللقب والمعلم */}
          <Text
            position={[0, -0.3, 0.05]}
            fontSize={0.28}
            color={gov.color}
            anchorX="center"
            anchorY="middle"
            font="https://fonts.gstatic.com/s/plusjakartasans/v8/L0xPDFytE3BB6zK9V9K42w.woff2"
          >
            {gov.title}
          </Text>
        </group>
      </Billboard>
    </group>
  );
};

// 8. تشكيلات صخرية بركانية (Yemen Rock Formations)
export const YemenRockFormation: React.FC<{
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#57534e" roughness={0.9} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.6, 0.5, 0.3]} scale={0.6}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#44403c" roughness={0.9} />
      </mesh>
    </group>
  );
};

// 9. أشجار النخيل اليمنية (Yemen Palm Tree)
export const YemenPalmTree: React.FC<{
  position: [number, number, number];
  scale?: number;
}> = ({ position, scale = 1 }) => {
  return (
    <group position={position} scale={scale}>
      {/* الجذع */}
      <mesh castShadow position={[0, 1.5, 0]}>
        <cylinderGeometry args={[0.2, 0.3, 3, 8]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* سعف النخيل */}
      <mesh castShadow position={[0, 3, 0]}>
        <coneGeometry args={[1.5, 1, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.8} />
      </mesh>
    </group>
  );
};
// 10. أعمدة الكهرباء التكتيكية (Tactical Power Line Poles - As seen in FF Max)
export const PowerLinePole: React.FC<{
  position: [number, number, number];
  rotationY?: number;
}> = ({ position, rotationY = 0 }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main Pole */}
      <mesh castShadow position={[0, 4.5, 0]}>
        <cylinderGeometry args={[0.2, 0.35, 9, 8]} />
        <meshStandardMaterial color="#334155" roughness={0.8} />
      </mesh>
      
      {/* Top Crossbar */}
      <mesh castShadow position={[0, 8.5, 0]}>
        <boxGeometry args={[4, 0.25, 0.25]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      
      {/* Insulators */}
      {[-1.8, -0.6, 0.6, 1.8].map((x, i) => (
        <mesh key={i} position={[x, 8.7, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.3, 8]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.4} />
        </mesh>
      ))}

      {/* Middle Crossbar */}
      <mesh castShadow position={[0, 6.5, 0]}>
        <boxGeometry args={[3.2, 0.2, 0.2]} />
        <meshStandardMaterial color="#475569" roughness={0.7} />
      </mesh>
      
      {/* Transformers / Boxes (Tactical details) */}
      <mesh castShadow position={[0.4, 6.8, 0.1]}>
        <boxGeometry args={[0.5, 0.8, 0.4]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
    </group>
  );
};
