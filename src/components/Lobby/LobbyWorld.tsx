import React from 'react';
import { Environment, ContactShadows, PresentationControls, Stage, Float, PerspectiveCamera } from '@react-three/drei';
import { Fighter } from '../UI/FighterSelectModal';

interface LobbyWorldProps {
  selectedFighter: Fighter;
}

export const LobbyWorld: React.FC<LobbyWorldProps> = ({ selectedFighter }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.5, 5]} fov={45} />
      <ambientLight intensity={0.5} />
      <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
      
      <PresentationControls
        global
        config={{ mass: 2, tension: 500 }}
        snap={{ mass: 4, tension: 1500 }}
        rotation={[0, 0.3, 0]}
        polar={[-Math.PI / 3, Math.PI / 3]}
        azimuth={[-Math.PI / 1.4, Math.PI / 1.4]}
      >
        <Stage intensity={0.5} environment="city" shadows={{ type: 'contact', opacity: 0.2, blur: 3 }}>
          <LobbyCharacter fighter={selectedFighter} />
        </Stage>
      </PresentationControls>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <circleGeometry args={[5, 64]} />
        <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.2} />
      </mesh>
      
      <gridHelper args={[20, 20, "#fbbf24", "#1e293b"]} position={[0, 0, 0]} />
      <Environment preset="sunset" />
    </>
  );
};

const LobbyCharacter: React.FC<{ fighter: Fighter }> = ({ fighter }) => {
  return (
    <group>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        {/* Placeholder for actual 3D Character Model */}
        <mesh castShadow>
          <capsuleGeometry args={[0.4, 1.2, 4, 16]} />
          <meshStandardMaterial color={fighter.color} metalness={0.6} roughness={0.1} />
        </mesh>
        
        {/* Head/Helmet */}
        <mesh position={[0, 1, 0]} castShadow>
          <sphereGeometry args={[0.3, 32, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Hero Glow */}
        <pointLight position={[0, 0.5, 0]} distance={3} intensity={2} color={fighter.color} />
      </Float>

      {/* Decorative Weapon (Generic) */}
      <mesh position={[0.6, 0.2, 0.2]} rotation={[0, 0, -Math.PI / 4]} castShadow>
        <boxGeometry args={[0.1, 0.8, 0.1]} />
        <meshStandardMaterial color="#475569" />
      </mesh>
    </group>
  );
};
