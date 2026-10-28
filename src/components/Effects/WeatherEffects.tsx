import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export type WeatherType = 'clear' | 'fog' | 'rain' | 'sandstorm';

interface WeatherProps {
  type: WeatherType;
}

export const WeatherEffects: React.FC<WeatherProps> = ({ type }) => {
  const rainRef = useRef<THREE.Points>(null);
  const sandRef = useRef<THREE.Points>(null);

  const count = type === 'rain' ? 5000 : 3000;
  
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100;
      pos[i * 3 + 1] = Math.random() * 50;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100;
    }
    return pos;
  }, [count]);

  useFrame((state, delta) => {
    if (type === 'rain' && rainRef.current) {
      const positions = rainRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= delta * 20;
        if (positions[i * 3 + 1] < 0) positions[i * 3 + 1] = 50;
      }
      rainRef.current.geometry.attributes.position.needsUpdate = true;
    }
    if (type === 'sandstorm' && sandRef.current) {
      const positions = sandRef.current.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < count; i++) {
        positions[i * 3] += delta * 10;
        if (positions[i * 3] > 50) positions[i * 3] = -50;
      }
      sandRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  if (type === 'clear') return null;

  return (
    <>
      {type === 'fog' && <fog attach="fog" args={['#d1d5db', 10, 60]} />}
      
      {type === 'rain' && (
        <points ref={rainRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#94a3b8" size={0.1} transparent opacity={0.6} />
        </points>
      )}

      {type === 'sandstorm' && (
        <points ref={sandRef}>
          <bufferGeometry>
            <bufferAttribute attach="attributes-position" args={[positions, 3]} />
          </bufferGeometry>
          <pointsMaterial color="#d97706" size={0.2} transparent opacity={0.4} />
        </points>
      )}
    </>
  );
};
