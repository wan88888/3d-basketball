
import React, { useEffect, useRef } from 'react';
import { useSphere } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import { GamePhase } from '../types';
import { getCoachCommentary } from '../services/geminiService';
import { playSound } from '../utils/audio';
import * as THREE from 'three';

export const Ball: React.FC = () => {
  const resetBall = useGameStore(state => state.resetBall);
  const registerMiss = useGameStore(state => state.registerMiss);
  const phase = useGameStore(state => state.phase);
  const setAiComment = useGameStore(state => state.setAiComment);
  const setAiLoading = useGameStore(state => state.setAiLoading);
  const currentPower = useGameStore(state => state.currentPower);
  
  // Track last bounce for sound in IDLE mode
  const lastDribbleTime = useRef(0);

  // Physics Body
  const [ref, api] = useSphere(() => ({ 
    mass: 1, 
    position: [0, 2, 8],
    args: [0.24],
    linearDamping: 0.05, 
    angularDamping: 0.2,
    material: { friction: 0.6, restitution: 0.8 },
    onCollide: (e) => {
        // Only play physics sounds if we are in air (actually simulating physics)
        // In IDLE/AIMING, we control the ball manually, so we don't need collision sounds from engine
        if (useGameStore.getState().phase === GamePhase.IN_AIR) {
            const speed = e.contact.impactVelocity;
            if (speed > 1) {
                playSound('bounce', Math.min(speed / 10, 1));
            }
        }
    }
  }));

  // Handle Game Logic Transitions
  useEffect(() => {
    if (phase === GamePhase.IN_AIR) {
        // Set mass to 1 to enable physics
        api.mass.set(1);
        
        const zForce = -1 * (9 + (currentPower * 0.16)); 
        const yForce = 6 + (currentPower * 0.11);
        const xDrift = (Math.random() - 0.5) * 0.2; 

        api.velocity.set(0,0,0); 
        api.applyImpulse([xDrift, yForce, zForce], [0, 0, 0]);
        api.applyTorque([15, 0, 0]); 
    } else {
        // Set mass to 0 when holding/dribbling so it doesn't fall
        api.mass.set(0);
        api.velocity.set(0, 0, 0);
        api.angularVelocity.set(0, 0, 0);
    }
  }, [phase, currentPower, api]);

  // Subscribe to store for resets & scoring
  useEffect(() => {
    const unsubscribe = useGameStore.subscribe(
        (state, prevState) => {
            if (state.phase !== prevState.phase) {
                const currentPhase = state.phase;
                if (currentPhase === GamePhase.SCORED || currentPhase === GamePhase.MISSED) {
                     const stats = useGameStore.getState();
                     setAiLoading(true);
                     getCoachCommentary(stats, currentPhase === GamePhase.SCORED ? 'SCORED' : 'MISSED')
                        .then(comment => {
                            setAiComment(comment);
                            setAiLoading(false);
                        });

                     setTimeout(() => {
                        resetBall();
                        // Reset physics
                        api.velocity.set(0, 0, 0);
                        api.angularVelocity.set(0, 0, 0);
                        api.position.set(0, 2, 8);
                     }, 3000); 
                }
            }
        }
    );
    return () => unsubscribe();
  }, [api, resetBall, setAiComment, setAiLoading]);

  // Game Loop
  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // 1. Dribbling / Holding Logic
    if (phase === GamePhase.IDLE) {
        // Dribble Logic
        const dribbleSpeed = 8;
        // Bouncing Sine Wave: from floor (0.24) to hand height (~1.4)
        // abs(sin) gives us the bounce arc
        const bounceHeight = Math.abs(Math.sin(t * dribbleSpeed)); 
        const yPos = 0.24 + (bounceHeight * 1.2); 
        
        // Offset slightly to right hand side
        api.position.set(0.4, yPos, 8.2);

        // Play sound when ball hits "floor" (bounceHeight near 0)
        // We add a small debouncer using lastDribbleTime
        if (bounceHeight < 0.1 && (t - lastDribbleTime.current > 0.2)) {
            playSound('bounce', 0.5); 
            lastDribbleTime.current = t;
        }

    } else if (phase === GamePhase.AIMING) {
        // Hold above head (Set point)
        api.position.set(0, 2.1, 8.0);
    }

    // 2. Out of bounds check
    // @ts-ignore
    const currentPos = ref.current?.position;
    if (currentPos && phase === GamePhase.IN_AIR) {
        if (currentPos.y < 0.2 || currentPos.z < -5 || currentPos.x > 10 || currentPos.x < -10) {
            if (currentPos.y < 0.5) {
                 setTimeout(() => {
                    if (useGameStore.getState().phase === GamePhase.IN_AIR) {
                        registerMiss();
                    }
                 }, 1000);
            }
        }
    }
  });

  return (
    <group>
        {/* @ts-ignore */}
      <mesh ref={ref} castShadow receiveShadow>
        <sphereGeometry args={[0.24, 32, 32]} />
        <meshStandardMaterial color="#ea580c" roughness={0.4} />
        <mesh rotation={[0, 0, 0]}>
            <torusGeometry args={[0.24, 0.005, 16, 32]} />
            <meshBasicMaterial color="#111" />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.24, 0.005, 16, 32]} />
            <meshBasicMaterial color="#111" />
        </mesh>
      </mesh>
    </group>
  );
};
