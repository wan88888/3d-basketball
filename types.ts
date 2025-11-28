export enum GamePhase {
  IDLE = 'IDLE',
  AIMING = 'AIMING',
  IN_AIR = 'IN_AIR',
  SCORED = 'SCORED',
  MISSED = 'MISSED'
}

export interface GameStats {
  shotsTaken: number;
  shotsMade: number;
  currentStreak: number;
  bestStreak: number;
}

export interface Commentary {
  text: string;
  tone: 'excited' | 'disappointed' | 'neutral' | 'coach';
}