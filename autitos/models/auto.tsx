export interface Auto {
  id: number;
  modelo: string;
  ubicacionX: number;
  ubicacionY: number;
  color: string;
  width: number;
  heigth: number;
  carril: 'izq' | 'der';
}