import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { GamePhase } from '../types';
import * as THREE from 'three';

export const Player: React.FC = () => {
  const { phase, startAiming, shoot, setPower } = useGameStore();
  const groupRef = useRef<THREE.Group>(null);
  const leftArmRef = useRef<THREE.Group>(null);
  const rightArmRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);
  
  // Power Logic
  const powerDirection = useRef(1);
  const isCharging = useRef(false);

  // Input Handling
  useEffect(() => {
    const handleDown = () => {
      if (useGameStore.getState().phase === GamePhase.IDLE) {
        isCharging.current = true;
        startAiming();
      }
    };

    const handleUp = () => {
      if (isCharging.current) {
        isCharging.current = false;
        shoot();
      }
    };

    // Fix: Cast window to any as the environment seems to lack proper DOM event types
    (window as any).addEventListener('mousedown', handleDown);
    (window as any).addEventListener('mouseup', handleUp);
    (window as any).addEventListener('touchstart', handleDown);
    (window as any).addEventListener('touchend', handleUp);

    return () => {
      (window as any).removeEventListener('mousedown', handleDown);
      (window as any).removeEventListener('mouseup', handleUp);
      (window as any).removeEventListener('touchstart', handleDown);
      (window as any).removeEventListener('touchend', handleUp);
    };
  }, [startAiming, shoot]);

  // Animation & Logic Loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Power Oscillation
    if (isCharging.current && phase === GamePhase.AIMING) {
      const current = useGameStore.getState().currentPower;
      let next = current + powerDirection.current * 1.5;
      if (next >= 100) { next = 100; powerDirection.current = -1; } 
      else if (next <= 0) { next = 0; powerDirection.current = 1; }
      setPower(next);
    }

    // 2. Body Animation System
    if (groupRef.current && leftArmRef.current && rightArmRef.current && bodyRef.current && headRef.current) {
        
        // --- IDLE: DRIBBLING ANIMATION ---
        if (phase === GamePhase.IDLE) {
            const dribbleSpeed = 8;
            
            // Breathing / Bouncing Rhythm
            bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 1.3 + Math.sin(t * dribbleSpeed) * 0.05, 0.1);
            
            // Head tracks the basket loosely
            headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.1, 0.1);
            headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, 0, 0.1);

            // Left Arm (Guarding/Relaxed)
            leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.5, 0.1);
            leftArmRef.current.rotation.z = -0.3;

            // Right Arm (Dribbling motion)
            // Push down when ball goes down
            const handPush = Math.sin(t * dribbleSpeed);
            rightArmRef.current.rotation.x = 0.5 + (handPush * 0.3); // Flap arm
            rightArmRef.current.rotation.z = 0.2;
            
            // Reset position
            groupRef.current.position.x = THREE.MathUtils.lerp(groupRef.current.position.x, 0, 0.1);
        } 
        
        // --- AIMING: SET SHOT / TRIPLE THREAT ---
        else if (phase === GamePhase.AIMING) {
            // Crouch deep
            bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 1.1, 0.15);
            
            // Arms up to set point (holding imaginary ball)
            leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.0, 0.2); // Support hand
            rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.2, 0.2); // Shooting hand
            
            // Bring hands closer together
            leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.3, 0.1);
            rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.3, 0.1);
            
            // Look up at rim
            headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -0.4, 0.1);
        } 
        
        // --- IN AIR: JUMP & RELEASE ---
        else if (phase === GamePhase.IN_AIR) {
            // Jump extension
            bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 1.8, 0.1);
            
            // Follow through (Goose neck)
            leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -2.5, 0.1);
            rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -2.8, 0.2);
            
            // Open chest
            leftArmRef.current.rotation.z = 0;
            rightArmRef.current.rotation.z = 0;
        } 

        // --- SCORED: CELEBRATION ---
        else if (phase === GamePhase.SCORED) {
            // Jumping for joy
            const jump = Math.abs(Math.sin(t * 10)) * 0.5;
            bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 1.3 + jump, 0.2);

            // Arms raised high "V" for Victory
            leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, -Math.PI, 0.1);
            leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, 0.5, 0.1); // Wave out

            rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, -Math.PI, 0.1);
            rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, -0.5, 0.1); // Wave out
            
            // Head looks around
            headRef.current.rotation.x = -0.2;
            headRef.current.rotation.y = Math.sin(t * 5) * 0.2;
        }

        // --- MISSED: DISAPPOINTMENT ---
        else if (phase === GamePhase.MISSED) {
            // Slump
            bodyRef.current.position.y = THREE.MathUtils.lerp(bodyRef.current.position.y, 1.2, 0.05);

            // Arms hang down
            leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0.1, 0.05);
            leftArmRef.current.rotation.z = THREE.MathUtils.lerp(leftArmRef.current.rotation.z, -0.1, 0.05);

            rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0.1, 0.05);
            rightArmRef.current.rotation.z = THREE.MathUtils.lerp(rightArmRef.current.rotation.z, 0.1, 0.05);

            // Head down (Shame)
            headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, 0.5, 0.05);
            // Shake head no
            headRef.current.rotation.y = Math.sin(t * 2) * 0.2;
        }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 8.5]}>
      {/* Head */}
      <mesh ref={headRef} position={[0, 1.75, 0]} castShadow>
        <boxGeometry args={[0.25, 0.3, 0.25]} />
        <meshStandardMaterial color="#fca5a5" /> 
      </mesh>
       <mesh position={[0, 1.85, 0.05]} castShadow>
        <boxGeometry args={[0.27, 0.1, 0.27]} />
        <meshStandardMaterial color="#111" />
      </mesh>

      {/* Body/Jersey */}
      <mesh ref={bodyRef} position={[0, 1.3, 0]} castShadow>
        <boxGeometry args={[0.5, 0.7, 0.3]} />
        <meshStandardMaterial color="#4f46e5" />
      </mesh>
      {/* Number on Jersey */}
      <mesh position={[0, 1.3, 0.16]}>
        <planeGeometry args={[0.2, 0.2]} />
        <meshBasicMaterial color="white" />
      </mesh>

      {/* Shorts */}
      <mesh position={[0, 0.8, 0]} castShadow>
        <boxGeometry args={[0.52, 0.4, 0.32]} />
        <meshStandardMaterial color="#1e1b4b" />
      </mesh>

      {/* Legs (Static relative to hip for now) */}
      <mesh position={[-0.15, 0.3, 0]} castShadow>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#fca5a5" />
      </mesh>
      <mesh position={[0.15, 0.3, 0]} castShadow>
        <boxGeometry args={[0.15, 0.6, 0.15]} />
        <meshStandardMaterial color="#fca5a5" />
      </mesh>
      {/* Shoes */}
      <mesh position={[-0.15, 0.05, 0.05]} castShadow>
        <boxGeometry args={[0.17, 0.1, 0.3]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>
      <mesh position={[0.15, 0.05, 0.05]} castShadow>
        <boxGeometry args={[0.17, 0.1, 0.3]} />
        <meshStandardMaterial color="#ea580c" />
      </mesh>

      {/* Arms Group (Pivot at shoulder) */}
      <group ref={leftArmRef} position={[-0.32, 1.55, 0]}>
         <mesh position={[0, -0.35, 0]} castShadow>
            <boxGeometry args={[0.12, 0.7, 0.12]} />
            <meshStandardMaterial color="#fca5a5" />
         </mesh>
         <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.13, 0.2, 0.13]} />
            <meshStandardMaterial color="#4f46e5" />
         </mesh>
      </group>

      <group ref={rightArmRef} position={[0.32, 1.55, 0]}>
         <mesh position={[0, -0.35, 0]} castShadow>
            <boxGeometry args={[0.12, 0.7, 0.12]} />
            <meshStandardMaterial color="#fca5a5" />
         </mesh>
         <mesh position={[0, -0.1, 0]}>
            <boxGeometry args={[0.13, 0.2, 0.13]} />
            <meshStandardMaterial color="#4f46e5" />
         </mesh>
      </group>
    </group>
  );
};