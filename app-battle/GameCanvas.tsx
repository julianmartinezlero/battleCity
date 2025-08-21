// client/components/GameCanvas.tsx
import React from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import { GameState } from './GameState';

interface GameCanvasProps {
  gameState: GameState;
  playerId: string;
  style: any;
}

const CELL_SIZE = Dimensions.get('window').width / 13; // 13 celdas de ancho

const GameCanvas: React.FC<GameCanvasProps> = ({ gameState, playerId, style }) => {
  const renderMap = () => {
    return gameState.map.map((row, y) => (
      <View key={y} style={styles.row}>
        {row.map((cell, x) => (
          <View
            key={`${x}-${y}`}
            style={[
              styles.cell,
              cell === 0 && styles.empty,
              cell === 1 && styles.brick,
              cell === 2 && styles.steel,
            ]}
          />
        ))}
      </View>
    ));
  };

  const renderPlayers = () => {
    return Object.entries(gameState.players).map(([id, player]) => (
      <View
        key={id}
        style={[
          styles.player,
          {
            left: player.x * CELL_SIZE,
            top: player.y * CELL_SIZE,
            backgroundColor: player.color,
            transform: [
              { rotate: player.direction === 'up' ? '0deg' : 
                         player.direction === 'right' ? '90deg' :
                         player.direction === 'down' ? '180deg' : '270deg' }
            ]
          }
        ]}
      >
        {/* Indicador de que es tu jugador */}
        {id === playerId && (
          <View style={styles.playerIndicator} />
        )}
      </View>
    ));
  };

  const renderBullets = () => {
    return gameState.bullets.map((bullet) => (
      <View
        key={bullet.id}
        style={[
          styles.bullet,
          {
            left: bullet.x * CELL_SIZE + CELL_SIZE / 2 - 2,
            top: bullet.y * CELL_SIZE + CELL_SIZE / 2 - 2,
          }
        ]}
      />
    ));
  };

  return (
    <View style={[styles.container, style]}>
      {/* Mapa */}
      <View style={styles.mapContainer}>
        {renderMap()}
      </View>
      
      {/* Jugadores */}
      {renderPlayers()}
      
      {/* Balas */}
      {renderBullets()}
      
      {/* Información de debug */}
      <View style={styles.debugInfo}>
        <Text style={styles.debugText}>
          Jugadores: {Object.keys(gameState.players).length}
        </Text>
        <Text style={styles.debugText}>
          Balas: {gameState.bullets.length}
        </Text>
        <Text style={styles.debugText}>
          Tu ID: {playerId.substring(0, 6)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: '#000',
  },
  mapContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: CELL_SIZE,
    height: CELL_SIZE,
    borderWidth: 0.5,
    borderColor: '#333',
  },
  empty: {
    backgroundColor: '#000',
  },
  brick: {
    backgroundColor: '#8B4513', // Marrón ladrillo
  },
  steel: {
    backgroundColor: '#708090', // Gris acero
  },
  player: {
    position: 'absolute',
    width: CELL_SIZE - 4,
    height: CELL_SIZE - 4,
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFF',
    position: 'absolute',
    top: 4,
  },
  bullet: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#FFD700', // Dorado
  },
  debugInfo: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 8,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
});

export default GameCanvas;