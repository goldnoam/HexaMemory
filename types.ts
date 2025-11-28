import { LucideIcon } from 'lucide-react';

export interface GameSectionData {
  id: number;
  color: string;
  activeColor: string;
  icon: LucideIcon;
  frequency: number; // For audio tone
  label: string;
}

export enum GameState {
  IDLE = 'IDLE',
  PLAYING_SEQUENCE = 'PLAYING_SEQUENCE',
  PLAYER_TURN = 'PLAYER_TURN',
  GAME_OVER = 'GAME_OVER',
}

export interface Score {
  current: number;
  high: number;
}
