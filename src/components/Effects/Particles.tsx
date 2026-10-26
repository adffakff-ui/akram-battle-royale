import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticlesProps {
  count?: number;
  position: [number, number, number];
  color?: string;
  size?: number;
  speed?: number;
  lifeTime?: number;
  onFinish?: () => void;
}

export const ImpactParticles: React.FC<ParticlesProps> = ({
  count = 15,
  position,
  color = "#fbbf24",
  size = 0.15,
  speed = 4,
  lifeTime = 0.5,
  onFinish
}) => {
  const mesh = useRef<THREE.InstancedMesh>(null);
  const startTime = useRef(Date.now());

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed,
        (Math.random() - 0.5) * speed
      );
      temp.push({ velocity, pos: new THREE.Vector3(0, 0, 0) });
    }
    return temp;
  }, [count, speed]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame(() => {
    if (!mesh.current) return;

    const elapsed = (Date.now() - startTime.current) / 1000;
    if (elapsed > lifeTime) {
      onFinish?.();
      return;
    }

    const scale = 1 - elapsed / lifeTime;

    particles.forEach((p, i) => {
      p.pos.add(p.velocity.clone().multiplyScalar(0.016)); // assuming 60fps approx
      p.velocity.y -= 0.1; // gravity
      
      dummy.position.copy(p.pos);
      dummy.scale.set(scale * size, scale * size, scale * size);
      dummy.updateMatrix();
      mesh.current!.setMatrixAt(i, dummy.matrix);
    });

    mesh.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, count]} position={position}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} />
    </instancedMesh>
  );
};
