import React, { useMemo } from 'react';
import * as THREE from 'three';
import { useGameStore } from '../store';
import { GamePhase } from '../types';

export const Trajectory: React.FC = () => {
    const power = useGameStore(state => state.currentPower);
    const phase = useGameStore(state => state.phase);
    
    // Only show trajectory when aiming
    const visible = phase === GamePhase.AIMING || phase === GamePhase.IDLE;
    
    const points = useMemo(() => {
        if (!visible) return [];
        
        // Ensure power is a number
        const safePower = typeof power === 'number' ? power : 0;
        
        const origin = new THREE.Vector3(0, 2, 8); // Hand position roughly
        
        // Match the physics logic in Ball.tsx
        // zForce = -1 * (9 + (currentPower * 0.16)); 
        // yForce = 6 + (currentPower * 0.11);
        
        const forceY = 6 + (safePower * 0.11);
        const forceZ = -1 * (9 + (safePower * 0.16));
        
        const velocity = new THREE.Vector3(0, forceY, forceZ);
        
        // Simulation parameters
        const damping = 0.05; // Must match Ball.tsx linearDamping
        const dt = 0.05; // Time step for simulation
        const steps = 40; 
        
        const pts = [origin.clone()];
        let pos = origin.clone();
        let vel = velocity.clone();

        for (let i = 0; i < steps; i++) {
            // 1. Gravity
            vel.y += -9.81 * dt;

            // 2. Air Resistance (Damping)
            // CannonJS approx: vel *= (1 - damping * dt)
            vel.multiplyScalar(1 - damping * dt);

            // 3. Move
            pos.add(vel.clone().multiplyScalar(dt));

            pts.push(pos.clone());

            if (pos.y < 0) break;
        }

        return pts;
    }, [power, visible]);

    // Safety check: TubeGeometry and CatmullRomCurve3 fail with < 2 points
    if (!visible || points.length < 2) return null;

    // Create a CatmullRomCurve3 for smooth lines
    const curve = new THREE.CatmullRomCurve3(points);
    
    return (
        <mesh>
            <tubeGeometry args={[curve, 20, 0.03, 8, false]} />
            <meshBasicMaterial color="white" transparent opacity={0.3} />
        </mesh>
    );
}