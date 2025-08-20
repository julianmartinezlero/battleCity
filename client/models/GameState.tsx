// client/models/GameState.ts
export interface GameState {
  players: { [id: string]: Player };
  bullets: Bullet[];
  map: number[][];
}

export interface Player {
  x: number;
  y: number;
  direction: string;
  color: string;
}

export interface Bullet {
  id: string;
  x: number;
  y: number;
  direction: string;
  playerId: string;
}