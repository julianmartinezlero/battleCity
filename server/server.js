// server/server.js
const WebSocket = require('ws');
const Game = require('./game/Game');

const wss = new WebSocket.Server({ port: 8080 });
const game = new Game();


wss.on('connection', (ws) => {
  console.log('Nuevo jugador conectado');
  
  // Asignar un nuevo jugador al juego
  const playerId = game.addPlayer();
  console.log(`Jugador ${playerId} agregado. Total: ${Object.keys(game.players).length}`);

  // Enviar al cliente su ID y estado inicial del juego
  ws.send(JSON.stringify({
    type: 'init',
    playerId,
    gameState: game.getState()
  }));
  
  
  // Enviar estado inicial a todos los clientes
    // setInterval(this.update.bind(this), 16);
    setInterval(() => {
    if (game.shouldSendUpdate || Object.keys(game.players).length > 0) {
      broadcastGameState();
      game.shouldSendUpdate = false;
    }
  }, 50); // Enviar updates cada 50ms (20 FPS)
  // broadcastGameState();
  
  // Escuchar mensajes del cliente
  ws.on('message', (message) => {

    try {
      const data = JSON.parse(message);
      
      if (data.type === 'move') {
        game.movePlayer(playerId, data.direction);
        
        // Enviar estado actualizado a todos los clientes
        broadcastGameState();
      } else if (data.type === 'fire') {
        game.playerFire(playerId);
        broadcastGameState();
      }
      while (true) {
        broadcastGameState();
        console.log('update')
      }
    } catch (error) {
      console.error('Error procesando mensaje:', error);
    }
  });
  
  // Manejar desconexión
  ws.on('close', () => {
    console.log('Jugador desconectado:', playerId);
    game.removePlayer(playerId);
    broadcastGameState();
  });
  
  // Función para enviar estado a todos los clientes
  function broadcastGameState() {
    const gameState = game.getState();
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'update',
          gameState
        }));
      }
    });
  }



});

console.log('Servidor WebSocket ejecutándose en el puerto 8080');