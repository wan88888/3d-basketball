import { create } from 'zustand';
import { GamePhase, GameStats } from './types';

interface GameState extends GameStats {
  phase: GamePhase;
  aiComment: string;
  isAiLoading: boolean;
  
  // Shooting Mechanics
  currentPower: number; // 0 to 100
  releaseAngle: number; // Degrees
  
  // Actions
  startAiming: () => void;
  setPower: (power: number) => void;
  shoot: () => void;
  resetBall: () => void;
  registerScore: () => void;
  registerMiss: () => void;
  setAiComment: (comment: string) => void;
  setAiLoading: (loading: boolean) => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: GamePhase.IDLE,
  shotsTaken: 0,
  shotsMade: 0,
  currentStreak: 0,
  bestStreak: 0,
  aiComment: "Step up to the line, rookie!",
  isAiLoading: false,
  
  currentPower: 0,
  releaseAngle: 45, // Default visual angle

  startAiming: () => set({ phase: GamePhase.AIMING }),
  
  setPower: (power) => set({ currentPower: power }),

  shoot: () => set((state) => ({ 
    phase: GamePhase.IN_AIR,
    shotsTaken: state.shotsTaken + 1
  })),

  resetBall: () => set({ 
    phase: GamePhase.IDLE,
    currentPower: 0
  }),

  registerScore: () => set((state) => {
    const newStreak = state.currentStreak + 1;
    return {
      phase: GamePhase.SCORED,
      shotsMade: state.shotsMade + 1,
      currentStreak: newStreak,
      bestStreak: Math.max(newStreak, state.bestStreak)
    };
  }),

  registerMiss: () => set((state) => ({
    phase: GamePhase.MISSED,
    currentStreak: 0
  })),

  setAiComment: (comment: string) => set({ aiComment: comment }),
  setAiLoading: (loading: boolean) => set({ isAiLoading: loading }),
}));