const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// In-memory stores
const players = {}; // { socketId: { username: string, tokens: number, table: string|null } }
const tables = {}; // { tableId: { players: Set<socketId>, game: { dealerHand: [], deck: [], playerHands: {} } } }

// Helper to get/create player
function getPlayer(socket) {
  if (!players[socket.id]) {
    players[socket.id] = {
      username: `Player_${socket.id.slice(0, 5)}`,
      tokens: 1000,
      table: null
    };
  }
  return players[socket.id];
}

// Helper to get/create table (max 6 players)
function getTable(tableId) {
  if (!tables[tableId]) {
    tables[tableId] = {
      players: new Set(),
      game: { dealerHand: [], deck: [], playerHands: {} }
    };
  }
  return tables[tableId];
}

// Broadcast table players
function broadcastTablePlayers(tableId) {
  const table = tables[tableId];
  if (!table) return;
  const playerList = Array.from(table.players).map(id => ({
    id,
    username: players[id].username,
    tokens: players[id].tokens
  }));
  io.to(tableId).emit('tablePlayers', playerList);
}

io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  const player = getPlayer(socket);

  // Send init data
  socket.emit('init', {
    playerId: socket.id,
    username: player.username,
    tokens: player.tokens
  });

  // Broadcast global online count
  io.emit('onlineCount', Object.keys(players).length);

  // Join table
  socket.on('joinTable', (tableId) => {
    console.log(`Player ${socket.id} joining table ${tableId}`);
    
    // Leave previous table
    const prevTable = players[socket.id].table;
    if (prevTable && tables[prevTable]) {
      tables[prevTable].players.delete(socket.id);
      socket.leave(prevTable);
      broadcastTablePlayers(prevTable);
    }
    
    // Join new table
    const table = getTable(tableId);
    if (table.players.size >= 6) {
      socket.emit('joinError', { message: 'Table is full (max 6 players)' });
      return;
    }
    
    players[socket.id].table = tableId;
    table.players.add(socket.id);
    socket.join(tableId);
    broadcastTablePlayers(tableId);
    io.emit('onlineCount', Object.keys(players).length);
  });

  // Place bet (server-authoritative)
  socket.on('placeBet', ({ game, amount, data }) => {
    const player = getPlayer(socket);
    if (amount > player.tokens) {
      socket.emit('betResult', { success: false, message: 'Insufficient tokens' });
      return;
    }
    player.tokens -= amount;

    let result;
    switch (game) {
      case 'coinflip':
        result = require('./games/coinflip')(amount, data);
        break;
      case 'roulette':
        result = require('./games/roulette')(amount, data);
        break;
      case 'blackjack':
        // Use table's game state
        const table = tables[player.table];
        if (!table) {
          socket.emit('betResult', { success: false, message: 'Join a table first' });
          return;
        }
        data.dealerHand = table.game.dealerHand;
        data.deck = table.game.deck;
        data.hand = table.game.playerHands[socket.id] || [];
        result = require('./games/blackjack')(socket, amount, data);
        // Update table's game state
        table.game.dealerHand = result.dealerHand || table.game.dealerHand;
        table.game.deck = result.deck || table.game.deck;
        table.game.playerHands[socket.id] = result.hand;
        break;
      case 'slots':
        result = require('./games/slots')(amount, data);
        break;
      default:
        result = { win: false, payout: 0 };
    }

    player.tokens += result.payout;
    const payload = {
      success: true,
      game,
      win: result.win,
      payout: result.payout,
      details: result.details
    };
    if (result.hand) payload.hand = result.hand;
    if (result.dealerHand) payload.dealerHand = result.dealerHand;
    if (result.deck) payload.deck = result.deck;
    socket.emit('betResult', payload);

    // Broadcast updated table players (for token updates)
    if (player.table) broadcastTablePlayers(player.table);
  });

  // Chat (per table)
  socket.on('sendChat', (message) => {
    const player = players[socket.id];
    if (!player) return;
    const tableId = player.table;
    if (tableId) {
      io.to(tableId).emit('receiveChat', {
        sender: player.username,
        message
      });
    } else {
      // Global chat if no table
      io.emit('receiveChat', {
        sender: player.username,
        message
      });
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    console.log('Disconnected:', socket.id);
    const tableId = players[socket.id]?.table;
    if (tableId && tables[tableId]) {
      tables[tableId].players.delete(socket.id);
      broadcastTablePlayers(tableId);
    }
    delete players[socket.id];
    io.emit('onlineCount', Object.keys(players).length);
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});