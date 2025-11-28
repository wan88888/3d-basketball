import React from 'react';
import { usePlane } from '@react-three/cannon';

export const Court: React.FC = () => {
  // Static physics body for the floor
  const [ref] = usePlane(() => ({ 
    rotation: [-Math.PI / 2, 0, 0],
    position: [0, 0, 0],
    material: { friction: 0.5, restitution: 0.7 } 
  }));

  return (
    <group>
      {/* The main floor */}
      {/* @ts-ignore - r3f ref types */}
      <mesh ref={ref} receiveShadow>
        <planeGeometry args={[50, 50]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
      
      {/* Court Lines (Visual only) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 5]} receiveShadow>
        <planeGeometry args={[16, 12]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>
       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 5]} receiveShadow>
        <planeGeometry args={[15, 11]} />
        <meshStandardMaterial color="#334155" />
      </mesh>

       {/* Key Area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 2]} receiveShadow>
        <planeGeometry args={[6, 8]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>
    </group>
  );
};