
import React from 'react';
import { useBox, useCylinder } from '@react-three/cannon';
import { useGameStore } from '../store';
import { GamePhase } from '../types';
import { playSound } from '../utils/audio';

export const Hoop: React.FC = () => {
  const registerScore = useGameStore(state => state.registerScore);
  const phase = useGameStore(state => state.phase);

  // Backboard (Static Physics)
  const [backboardRef] = useBox(() => ({
    type: 'Static',
    position: [0, 4, -0.5],
    args: [2.5, 1.5, 0.1],
    material: { friction: 0.5, restitution: 0.6 },
    onCollide: (e) => {
        if (e.contact.impactVelocity > 2) {
            playSound('backboard', Math.min(e.contact.impactVelocity / 15, 0.8));
        }
    }
  }));

  // Rim Visuals & Physics approximations
  const rimY = 3.5;
  const rimZ = 0.6;
  const rimSize = 0.1;
  const rimRadius = 0.6; 

  const rimPhysicsProps = {
      type: 'Static' as const,
      args: [rimSize, rimSize, rimSize] as [number, number, number],
      onCollide: (e: any) => {
          if (e.contact.impactVelocity > 1) {
            playSound('rim', Math.min(e.contact.impactVelocity / 10, 0.6));
          }
      }
  };

  // Left part of rim
  useBox(() => ({ ...rimPhysicsProps, position: [-rimRadius, rimY, rimZ] }));
  // Right part of rim
  useBox(() => ({ ...rimPhysicsProps, position: [rimRadius, rimY, rimZ] }));
  // Front part of rim
  useBox(() => ({ ...rimPhysicsProps, position: [0, rimY, rimZ + rimRadius] }));
  
  // Invisible Scoring Sensor
  const [sensorRef] = useCylinder(() => ({
    isTrigger: true,
    position: [0, 3.2, 0.6], // Just below the rim
    args: [0.3, 0.3, 0.2, 8],
    onCollide: (e) => {
      if (useGameStore.getState().phase === GamePhase.IN_AIR) {
         const velocity = (e.body as any).velocity; 
         // Simple debounce logic could be added here if needed
         registerScore();
         playSound('swish', 1.0);
      }
    }
  }));

  return (
    <group>
      {/* Backboard Visual */}
      {/* @ts-ignore */}
      <mesh ref={backboardRef} castShadow receiveShadow>
        <boxGeometry args={[2.5, 1.5, 0.1]} />
        <meshStandardMaterial color="white" />
      </mesh>
      
      {/* Backboard Stripe */}
      <mesh position={[0, 4, -0.44]}>
        <boxGeometry args={[1, 0.8, 0.01]} />
        <meshStandardMaterial color="#111" />
      </mesh>
      <mesh position={[0, 4, -0.43]}>
        <boxGeometry args={[0.9, 0.7, 0.01]} />
        <meshStandardMaterial color="white" />
      </mesh>

      {/* Pole */}
      <mesh position={[0, 2, -1]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 4, 16]} />
        <meshStandardMaterial color="#555" />
      </mesh>

      {/* Rim Visual (Torus) */}
      <mesh position={[0, 3.5, 0.6]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.45, 0.05, 16, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>

      {/* Net Visual (Simplified Cone) */}
      <mesh position={[0, 3.0, 0.6]} castShadow>
        <cylinderGeometry args={[0.45, 0.3, 0.8, 16, 1, true]} />
        <meshStandardMaterial 
            color="white" 
            wireframe 
            transparent 
            opacity={0.5}
            side={2} // DoubleSide
        />
      </mesh>
    </group>
  );
};
