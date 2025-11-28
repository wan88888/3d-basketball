import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Sky, Stars } from '@react-three/drei';
import { Court } from './components/Court';
import { Hoop } from './components/Hoop';
import { Ball } from './components/Ball';
import { Player } from './components/Player';
import { Trajectory } from './components/Trajectory';
import { Lighting } from './components/Lighting';
import { GameUI } from './components/GameUI';

const App: React.FC = () => {
  return (
    <div className="w-full h-screen bg-slate-900 overflow-hidden relative">
      {/* 2D UI Overlay */}
      <GameUI />

      {/* 3D Scene */}
      <Canvas shadows camera={{ position: [2, 3, 14], fov: 45 }}>
        <Suspense fallback={null}>
          <Lighting />
          
          {/* Environment */}
          <Sky distance={450000} sunPosition={[10, 20, 5]} inclination={0} azimuth={0.25} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          
          <Physics 
            gravity={[0, -9.81, 0]} 
            defaultContactMaterial={{ restitution: 0.7, friction: 0.5 }}
          >
             {/* Game Objects */}
             <Court />
             <Hoop />
             <Player />
             <Ball />
             
          </Physics>
          {/* Trajectory is visual only, no physics */}
          <Trajectory />
        </Suspense>
      </Canvas>
    </div>
  );
};

export default App;