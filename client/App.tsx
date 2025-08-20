// client/App.tsx
import { useEffect, useRef, useState } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// import GameCanvas from './components/GameCanvas';
import { GameCanvas } from './components/GameCanvas';
import { GameState } from './models/GameState';

const SERVER_URL = 'ws://192.168.1.100:8080'; // Cambiar por la IP de tu servidor

export default function App() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const ws = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    connectToServer();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);

  const connectToServer = () => {
    ws.current = new WebSocket(SERVER_URL);

    ws.current.onopen = () => {
      console.log('Conectado al servidor');
      setConnected(true);
    };

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        
        if (data.type === 'init') {
          setPlayerId(data.playerId);
          setGameState(data.gameState);
        } else if (data.type === 'update') {
          setGameState(data.gameState);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.current.onerror = (e) => {
      console.log('Error de conexión:', e.message);
      setConnected(false);
    };

    ws.current.onclose = (e) => {
      console.log('Conexión cerrada:', e.code, e.reason);
      setConnected(false);
    };
  };

  const sendMessage = (message: object) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  };

  const handleMove = (direction: string) => {
    sendMessage({ type: 'move', direction });
  };

  const handleFire = () => {
    sendMessage({ type: 'fire' });
  };

  if (!connected || !gameState || !playerId) {
    return (
      <View style={styles.container}>
        <Text>{connected ? 'Cargando juego...' : 'Conectando al servidor...'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GameCanvas 
        gameState={gameState} 
        playerId={playerId} 
        style={styles.gameCanvas} 
      />
      
      <View style={styles.controls}>
        <View style={styles.dpad}>
          <View style={styles.dpadRow}>
            <TouchableOpacity style={styles.button} onPress={() => handleMove('up')} />
          </View>
          <View style={styles.dpadRow}>
            <TouchableOpacity style={styles.button} onPress={() => handleMove('left')} />
            <View style={styles.buttonPlaceholder} />
            <TouchableOpacity style={styles.button} onPress={() => handleMove('right')} />
          </View>
          <View style={styles.dpadRow}>
            <TouchableOpacity style={styles.button} onPress={() => handleMove('down')} />
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.fireButton} 
          onPress={handleFire}
        >
          <Text style={styles.fireButtonText}>FIRE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gameCanvas: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').width, // Cuadrado
    backgroundColor: '#000',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 20,
    marginTop: 20,
  },
  dpad: {
    alignItems: 'center',
  },
  dpadRow: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  button: {
    width: 60,
    height: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    margin: 5,
    borderRadius: 30,
  },
  buttonPlaceholder: {
    width: 60,
    height: 60,
    margin: 5,
  },
  fireButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fireButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});