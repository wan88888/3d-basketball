
import React, { useEffect } from 'react';
import { useGameStore } from '../store';
import { GamePhase } from '../types';
import { Trophy, Flame, Activity, BrainCircuit, Target, Zap } from 'lucide-react';
import { playSound } from '../utils/audio';

export const GameUI: React.FC = () => {
  const { 
    shotsMade, 
    shotsTaken, 
    currentStreak, 
    bestStreak, 
    phase,
    aiComment,
    isAiLoading,
    currentPower
  } = useGameStore();

  // Play cheer on streak
  useEffect(() => {
    if (phase === GamePhase.SCORED && currentStreak > 1) {
        playSound('cheer', 0.6);
    }
  }, [phase, currentStreak]);

  // Calculate theoretical angle based on power (Physics constants: y=5+p*0.1, z=8+p*0.15)
  // Angle = atan(Vy / Vz)
  const vy = 5 + (currentPower * 0.1);
  const vz = 8 + (currentPower * 0.15);
  const angleDeg = Math.round((Math.atan(vy / vz) * 180) / Math.PI);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-10">
      
      {/* Top Bar: Stats */}
      <div className="flex justify-between items-start">
        <div className="bg-slate-900/80 backdrop-blur-md p-4 rounded-xl border border-slate-700 text-white shadow-lg">
            <h1 className="text-xl font-bold text-orange-500 italic tracking-tighter mb-2">GEMINI HOOPS</h1>
            <div className="flex gap-4 text-sm">
                <div className="flex flex-col items-center">
                    <span className="text-slate-400">SCORE</span>
                    <span className="text-2xl font-mono">{shotsMade}<span className="text-slate-500 text-sm">/{shotsTaken}</span></span>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-slate-400 flex items-center gap-1"><Flame size={12} /> STREAK</span>
                    <span className={`text-2xl font-mono ${currentStreak > 2 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                        {currentStreak}
                    </span>
                </div>
            </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-700 text-white shadow-lg flex items-center gap-3">
             <Trophy size={20} className="text-yellow-400" />
             <div className="flex flex-col">
                 <span className="text-xs text-slate-400">BEST STREAK</span>
                 <span className="font-mono text-lg">{bestStreak}</span>
             </div>
        </div>
      </div>

      {/* Center: Feedback */}
      <div className="absolute top-1/3 left-0 right-0 flex justify-center items-center pointer-events-none">
        {phase === GamePhase.SCORED && (
            <div className="text-6xl font-black text-green-400 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] animate-bounce">
                SWISH!
            </div>
        )}
        {phase === GamePhase.MISSED && (
            <div className="text-6xl font-black text-red-500 drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] opacity-80">
                MISS
            </div>
        )}
      </div>

      {/* Right Side: Shot Metrics (Real-time) */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4">
         <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-xl border border-slate-700 text-white w-48 transition-opacity duration-200">
             
             {/* Power Meter */}
             <div className="mb-4">
                 <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Zap size={14} className="text-yellow-400"/> POWER</span>
                    <span className="font-mono">{Math.round(currentPower)}%</span>
                 </div>
                 <div className="h-3 w-full bg-slate-700 rounded-full overflow-hidden border border-slate-600">
                    <div 
                        className={`h-full transition-all duration-75 ease-out ${currentPower > 90 ? 'bg-red-500' : 'bg-yellow-400'}`} 
                        style={{ width: `${currentPower}%` }}
                    />
                 </div>
             </div>

             {/* Angle Indicator */}
             <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                    <span className="flex items-center gap-1"><Target size={14} className="text-blue-400"/> ANGLE</span>
                    <span className="font-mono">{angleDeg}°</span>
                 </div>
                 <div className="h-16 w-full bg-slate-800 rounded-lg relative overflow-hidden flex items-end justify-center">
                    {/* Angle Arc Visualization */}
                    <div className="absolute bottom-0 left-1/2 w-24 h-24 border-2 border-slate-600 rounded-full -translate-x-1/2 translate-y-1/2"></div>
                    <div 
                        className="absolute bottom-0 left-1/2 h-12 w-0.5 bg-blue-400 origin-bottom transition-transform duration-75"
                        style={{ transform: `translateX(-50%) rotate(${90 - angleDeg}deg)` }} // 0deg is right, 90deg is up. Our angle is from horizontal.
                    />
                 </div>
             </div>
         </div>
      </div>

      {/* Bottom: AI Coach & Controls */}
      <div className="flex flex-col gap-4 items-center w-full max-w-lg mx-auto">
        {/* AI Coach */}
        <div className="w-full bg-indigo-950/90 backdrop-blur-md border border-indigo-500/50 p-4 rounded-2xl shadow-xl transition-all duration-300">
            <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-indigo-500 rounded-full">
                    <BrainCircuit size={20} className="text-white" />
                </div>
                <span className="font-bold text-indigo-200 uppercase text-xs tracking-wider">AI Coach</span>
                {isAiLoading && <Activity size={16} className="text-indigo-400 animate-pulse ml-auto" />}
            </div>
            <p className="text-indigo-100 text-lg font-medium leading-snug min-h-[3rem]">
                "{aiComment}"
            </p>
        </div>

        {/* Instruction */}
        <div className="text-white/50 text-sm font-mono bg-black/40 px-4 py-2 rounded-full backdrop-blur-sm">
            {phase === GamePhase.IDLE || phase === GamePhase.AIMING
                ? "HOLD CLICK/TOUCH TO AIM - RELEASE TO SHOOT" 
                : "WATCH THE ARC..."}
        </div>
      </div>
    </div>
  );
};
