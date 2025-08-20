// client/components/GameCanvas.tsx
import React from 'react';
import { View } from 'react-native';
import { GameState } from '../models/GameState';

interface GameCanvasProps {
  gameState: GameState;
  playerId: string;
  style: any;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, playerId, style }) => {
  // Este componente sería más complejo en una implementación real
  // Usaría una WebView con código Three.js o un motor de juegos
  // Para esta demo, mostramos una representación simplificada
  
  return (
    <View style={style}>
      {/* Aquí iría el renderizado del juego */}
      {/* Por simplicidad, mostramos información textual */}
      <View style={{ position: 'absolute', top: 10, left: 10 }}>
        <Text style={{ color: 'white' }}>
          Jugadores: {Object.keys(gameState.players).length}
        </Text>
        <Text style={{ color: 'white' }}>
          Balas: {gameState.bullets.length}
        </Text>
        <Text style={{ color: 'white' }}>
          Eres: {playerId}
        </Text>
      </View>
    </View>
  );
};