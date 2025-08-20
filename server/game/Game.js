// server/game/Game.js
class Game {
  constructor() {
    this.players = {};
    this.bullets = [];
    this.map = this.generateMap();
    this.lastUpdateTime = Date.now();
    this.shouldSendUpdate = false;
    
    // Actualizar el juego cada 16ms (~60fps)
    setInterval(this.update.bind(this), 16);
  }
  
  generateMap() {
    // Crear un mapa simple con bloques y paredes
    const map = [];
    const size = 13; // Tamaño del mapa
    
    for (let y = 0; y < size; y++) {
      map[y] = [];
      for (let x = 0; x < size; x++) {
        // Bordes del mapa
        if (x === 0 || y === 0 || x === size - 1 || y === size - 1) {
          map[y][x] = 2; // Pared indestructible
        } 
        // Bloques en patrones
        else if (x % 2 === 0 && y % 2 === 0) {
          map[y][x] = 2; // Pared indestructible
        }
        // Algunos bloques destructibles
        else if (Math.random() > 0.7) {
          map[y][x] = 1; // Bloque destructible
        }
        // Espacio vacío
        else {
          map[y][x] = 0; // Vacío
        }
      }
    }
    
    // Asegurar que los jugadores tengan espacio para spawnear
    map[1][1] = 0;
    map[1][size-2] = 0;
    map[size-2][1] = 0;
    map[size-2][size-2] = 0;
    
    return map;
  }
  
  addPlayer() {
    const playerId = Math.random().toString(36).substring(7);
    const spawnPositions = [
      { x: 1, y: 1 },
      { x: 11, y: 1 },
      { x: 1, y: 11 },
      { x: 11, y: 11 }
    ];
    
    const position = spawnPositions[Object.keys(this.players).length % 4];
    
    this.players[playerId] = {
      x: position.x,
      y: position.y,
      direction: 'right',
      speed: 0.1,
      color: this.getRandomColor(),
      lastFire: 0
    };
    
    return playerId;
  }
  
  getRandomColor() {
    const colors = ['#FF5252', '#448AFF', '#66BB6A', '#FFCA28'];
    return colors[Object.keys(this.players).length % 4];
  }
  
  removePlayer(playerId) {
    delete this.players[playerId];
  }
  
  movePlayer(playerId, direction) {
    const player = this.players[playerId];
    if (!player) return;
    
    player.direction = direction;
    
    // Calcular nueva posición
    let newX = player.x;
    let newY = player.y;
    
    switch (direction) {
      case 'up': newY -= player.speed; break;
      case 'down': newY += player.speed; break;
      case 'left': newX -= player.speed; break;
      case 'right': newX += player.speed; break;
    }
    
    // Verificar colisiones con el mapa
    if (this.canMoveTo(newX, newY)) {
      player.x = newX;
      player.y = newY;
    }
    
    this.shouldSendUpdate = true;
  }
  
  canMoveTo(x, y) {
    // Convertir coordenadas a índices de matriz
    const mapX = Math.floor(x);
    const mapY = Math.floor(y);
    
    // Verificar si está dentro de los límites del mapa
    if (mapX < 0 || mapY < 0 || mapY >= this.map.length || mapX >= this.map[0].length) {
      return false;
    }
    
    // Verificar si la celda está vacía
    return this.map[mapY][mapX] === 0;
  }
  
  playerFire(playerId) {
    const player = this.players[playerId];
    if (!player) return;
    
    const now = Date.now();
    // Limitar la velocidad de disparo (300ms entre disparos)
    if (now - player.lastFire < 300) return;
    
    player.lastFire = now;
    
    // Crear una nueva bala
    this.bullets.push({
      id: Math.random().toString(36).substring(7),
      x: player.x,
      y: player.y,
      direction: player.direction,
      speed: 0.2,
      playerId: playerId
    });
    
    this.shouldSendUpdate = true;
  }
  
  update() {
    const now = Date.now();
    const dt = now - this.lastUpdateTime;
    this.lastUpdateTime = now;
    
    // Actualizar posición de las balas
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      
      // Mover la bala según su dirección
      switch (bullet.direction) {
        case 'up': bullet.y -= bullet.speed; break;
        case 'down': bullet.y += bullet.speed; break;
        case 'left': bullet.x -= bullet.speed; break;
        case 'right': bullet.x += bullet.speed; break;
      }
      
      // Verificar colisiones con el mapa
      const mapX = Math.floor(bullet.x);
      const mapY = Math.floor(bullet.y);
      
      if (
        mapX < 0 || mapY < 0 || 
        mapY >= this.map.length || 
        mapX >= this.map[0].length ||
        this.map[mapY][mapX] !== 0
      ) {
        // Si es un bloque destructible, destruirlo
        if (
          mapY >= 0 && mapY < this.map.length &&
          mapX >= 0 && mapX < this.map[0].length &&
          this.map[mapY][mapX] === 1
        ) {
          this.map[mapY][mapX] = 0;
        }
        
        // Eliminar la bala
        this.bullets.splice(i, 1);
        this.shouldSendUpdate = true;
        continue;
      }
      
      // Verificar colisiones con jugadores
      for (const playerId in this.players) {
        if (playerId === bullet.playerId) continue; // No colisionar con el jugador que disparó
          
        const player = this.players[playerId];
        const dx = Math.abs(player.x - bullet.x);
        const dy = Math.abs(player.y - bullet.y);
        
        if (dx < 0.5 && dy < 0.5) {
          // Eliminar al jugador
          delete this.players[playerId];
          // Eliminar la bala
          this.bullets.splice(i, 1);
          this.shouldSendUpdate = true;
          break;
        }
      }
    }
    
    // Enviar actualizaciones periódicamente o cuando haya cambios
    if (this.shouldSendUpdate) {
      this.shouldSendUpdate = false;
    }
  }
  
  getState() {
    return {
      players: this.players,
      bullets: this.bullets,
      map: this.map
    };
  }
}

module.exports = Game;