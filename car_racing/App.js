import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

// ====== Game Constants ======
const GRID_COLS = 14;     // ancho de la cuadrícula (ladrillos)
const GRID_ROWS = 24;     // alto de la cuadrícula
const CELL_SIZE_BASE = 16; // tamaño base en px; se ajusta al ancho de pantalla
const LANE_COUNT = 3;     // cantidad de carriles
const CAR_WIDTH = 2;      // tamaño en celdas del auto
const CAR_HEIGHT = 2;

const OBSTACLE_WIDTH = 2; // obstáculo tipo "bloque"
const START_SPEED_MS = 120;
const MIN_SPEED_MS = 50;
const SPEEDUP_EVERY = 10; // cada N puntos se acelera

function clamp(n, min, max) { return Math.max(min, Math.min(max, n)); }

export default function App() {
  const [running, setRunning] = useState(true);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [tickInterval, setTickInterval] = useState(START_SPEED_MS);

  // Car position stored as lane index [0..LANE_COUNT-1]. Each lane is a segment of cols.
  const laneWidth = Math.floor(GRID_COLS / LANE_COUNT);
  const [carLane, setCarLane] = useState(Math.floor(LANE_COUNT / 2));

  // Obstacles: array of { x, y, w, h }, y increases downward.
  const [obstacles, setObstacles] = useState([]);

  // Derived car x,y (car anchored near bottom)
  const carY = GRID_ROWS - CAR_HEIGHT - 1;
  const carX = clamp(carLane * laneWidth + Math.floor((laneWidth - CAR_WIDTH)/2), 0, GRID_COLS - CAR_WIDTH);

  // Responsive cell size
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const cellSize = Math.floor(Math.min(windowWidth / GRID_COLS, (windowHeight * 0.8) / GRID_ROWS));

  const viewWidth = cellSize * GRID_COLS;
  const viewHeight = cellSize * GRID_ROWS;

  // Keyboard support on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const onKey = (e) => {
        if (e.key === 'ArrowLeft') moveLeft();
        if (e.key === 'ArrowRight') moveRight();
        if (e.key === ' ') togglePause();
      };
      window.addEventListener('keydown', onKey);
      return () => window.removeEventListener('keydown', onKey);
    }
  }, [carLane, running, gameOver]);

  function resetGame() {
    setScore(0);
    setTickInterval(START_SPEED_MS);
    setObstacles([]);
    setCarLane(Math.floor(LANE_COUNT / 2));
    setGameOver(false);
    setRunning(true);
  }

  function togglePause() {
    if (gameOver) return;
    setRunning(r => !r);
  }

  function moveLeft() { setCarLane(l => clamp(l - 1, 0, LANE_COUNT - 1)); }
  function moveRight() { setCarLane(l => clamp(l + 1, 0, LANE_COUNT - 1)); }

  // Game loop (tick)
  useEffect(() => {
    if (!running || gameOver) return;
    const id = setInterval(() => {
      setObstacles(prev => {
        // Move obstacles down
        const moved = prev.map(o => ({ ...o, y: o.y + 1 }));
        // Remove off-screen
        const filtered = moved.filter(o => o.y < GRID_ROWS);

        // Maybe spawn new obstacle at top
        // 50% chance each tick
        if (Math.random() < 0.5) {
          const lane = Math.floor(Math.random() * LANE_COUNT);
          const x = clamp(lane * laneWidth + Math.floor((laneWidth - OBSTACLE_WIDTH)/2), 0, GRID_COLS - OBSTACLE_WIDTH);
          filtered.push({ x, y: -1, w: OBSTACLE_WIDTH, h: 1 });
        }
        return filtered;
      });

      // Update score and speed
      setScore(s => {
        const ns = s + 1;
        if (ns % SPEEDUP_EVERY === 0) {
          setTickInterval(t => Math.max(MIN_SPEED_MS, Math.floor(t * 0.92)));
        }
        return ns;
      });

    }, tickInterval);

    return () => clearInterval(id);
  }, [running, gameOver, tickInterval, laneWidth]);

  // Collision detection
  useEffect(() => {
    if (gameOver) return;
    // Check if any obstacle overlaps car
    const collided = obstacles.some(o => rectsOverlap(carX, carY, CAR_WIDTH, CAR_HEIGHT, o.x, o.y, o.w, o.h));
    if (collided) {
      setGameOver(true);
      setRunning(false);
      setBest(b => Math.max(b, score));
    }
  }, [obstacles, carX, carY, gameOver, score]);

  // Build cells to render (monochrome "lit" pixels)
  const cells = useMemo(() => {
    // Start with empty
    const arr = [];
    // Car cells
    for (let dx = 0; dx < CAR_WIDTH; dx++) {
      for (let dy = 0; dy < CAR_HEIGHT; dy++) {
        arr.push({ x: carX + dx, y: carY + dy, type: 'car' });
      }
    }
    // Obstacles
    obstacles.forEach(o => {
      for (let dx = 0; dx < o.w; dx++) {
        for (let dy = 0; dy < o.h; dy++) {
          const cx = o.x + dx, cy = o.y + dy;
          if (cy >= 0 && cy < GRID_ROWS) {
            arr.push({ x: cx, y: cy, type: 'obstacle' });
          }
        }
      }
    });
    // Lane separators (dotted)
    for (let l = 1; l < LANE_COUNT; l++) {
      const x = l * laneWidth;
      for (let y = 0; y < GRID_ROWS; y += 2) {
        arr.push({ x, y, type: 'lane' });
      }
    }
    return arr;
  }, [carX, carY, obstacles, laneWidth]);

  // UI handlers: touch to move
  const onPressLeft = () => { if (!gameOver) moveLeft(); };
  const onPressRight = () => { if (!gameOver) moveRight(); };

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <Text style={styles.title}>BRICK CAR RACING</Text>

      <View style={{ width: viewWidth, height: viewHeight, backgroundColor: '#0a0a0a', borderWidth: 4, borderColor: '#0f3d0f', borderRadius: 8, overflow: 'hidden' }}>
        <Svg width={viewWidth} height={viewHeight}>
          {/* Background grid (subtle) */}
          {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
            const x = i % GRID_COLS;
            const y = Math.floor(i / GRID_COLS);
            return (
              <Rect key={`g-${i}`} x={x * cellSize} y={y * cellSize} width={cellSize} height={cellSize} fill="#0b120b" />
            );
          })}

          {/* Active cells */}
          {cells.map((c, idx) => (
            <Rect
              key={`c-${idx}`}
              x={c.x * cellSize}
              y={c.y * cellSize}
              width={cellSize}
              height={cellSize}
              // Single monochrome color to emulate brick LCD
              fill={c.type === 'car' ? '#8be78b' : c.type === 'obstacle' ? '#5fbe5f' : '#164b16'}
            />
          ))}
        </Svg>

        {/* Touch controls overlay */}
        <View style={styles.touchRow} pointerEvents="box-none">
          <Pressable style={styles.touchZone} onPress={onPressLeft} />
          <Pressable style={styles.touchZone} onPress={onPressRight} />
        </View>
      </View>

      <View style={styles.hud}>
        <Text style={styles.hudText}>Score: {score.toString().padStart(5,'0')}</Text>
        <Text style={styles.hudText}>Best: {best.toString().padStart(5,'0')}</Text>
        <Pressable onPress={togglePause} style={styles.button}>
          <Text style={styles.buttonText}>{running ? 'Pausa' : 'Reanudar'}</Text>
        </Pressable>
        <Pressable onPress={resetGame} style={[styles.button, { marginLeft: 8 }]}>
          <Text style={styles.buttonText}>Reiniciar</Text>
        </Pressable>
      </View>

      {gameOver && (
        <View style={styles.overlay}>
          <Text style={styles.gameOver}>GAME OVER</Text>
          <Text style={styles.overlayText}>Puntaje: {score}  |  Récord: {best}</Text>
          <Pressable onPress={resetGame} style={[styles.button, { marginTop: 12 }]}>
            <Text style={styles.buttonText}>Jugar de nuevo</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function rectsOverlap(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x2 > x1 + w1 - 1 || x2 + w2 - 1 < x1 || y2 > y1 + h1 - 1 || y2 + h2 - 1 < y1);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 32,
    gap: 12
  },
  title: {
    color: '#8be78b',
    fontSize: 20,
    letterSpacing: 3,
    fontWeight: 'bold',
    marginBottom: 4
  },
  hud: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  hudText: {
    color: '#8be78b',
    fontSize: 16,
    marginHorizontal: 6
  },
  button: {
    backgroundColor: '#164b16',
    borderColor: '#2a6f2a',
    borderWidth: 2,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  buttonText: {
    color: '#c6f9c6',
    fontWeight: '600',
    letterSpacing: 1
  },
  touchRow: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    flexDirection: 'row'
  },
  touchZone: {
    flex: 1
  },
  overlay: {
    position: 'absolute', bottom: 100, alignItems: 'center'
  },
  gameOver: {
    color: '#8be78b', fontSize: 28, fontWeight: '900', letterSpacing: 2
  },
  overlayText: {
    color: '#c6f9c6', marginTop: 6
  }
});
