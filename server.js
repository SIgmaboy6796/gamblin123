const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

// Serve static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// In-memory player store
const players = {}; // { socketId: { username: string, tokens: number, table: string } }

// Helper to ensure a player has a balance entry
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

// Socket.io events
io.on('connection', (socket) => {
  console.log('New connection:', socket.id);
  const player = getPlayer(socket);
  
  // Send initial data to the newly connected client
  socket.emit('init', { 
    playerId: socket.id, 
    username: player.username, 
    tokens: player.tokens 
  });
  
  // Broadcast updated player list to everyone
  io.emit('players', Object.entries(players).map(([id, p]) => ({
    id, 
    username: p.username, 
    tokens: p.tokens,
    table: p.table
  })));
  
  // Set or change username
      socket.on('setUsername', (name) => {
        players[socket.id].username = name;
        io.emit('players', Object.entries(players).map(([id, p]) => ({
          id, 
          username: p.username, 
          tokens: p.tokens,
          table: p.table
        })));
      });
  
  // Join table command
      socket.on('joinTable', (tableId) => {
        players[socket.id].table = tableId;
        io.emit('players', Object.entries(players).map(([id, p]) => ({
          id, 
          username: p.username, 
          tokens: p.tokens,
          table: p.table
        })));
      });
  
  // Generic bet placement (game-specific validation will be done in each game module)
  socket.on('placeBet', ({ game, amount, data }) => {
    const player = getPlayer(socket);
    if (amount > player.tokens) {
      socket.emit('betResult', { success: false, message: 'Insufficient tokens' });
      return;
    }
    
    // Deduct bet amount immediately
    player.tokens -= amount;
    
    // Resolve the game
    let result;
    switch (game) {
      case 'coinflip':
        result = require('./games/coinflip')(amount, data);
        break;
      case 'roulette':
        result = require('./games/roulette')(amount, data);
        break;
      case 'blackjack':
        result = require('./games/blackjack')(socket, amount, data);
        break;
      case 'slots':
        result = require('./games/slots')(amount, data);
        break;
      default:
        result = { win: false, payout: 0 };
    }
    
    // Update tokens with payout
    player.tokens += result.payout;
    
    // Notify the player of the outcome
    // Include hand, dealerHand and deck in the response if they exist (needed for Blackjack)
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
    
    // Broadcast updated player list
    io.emit('players', Object.entries(players).map(([id, p]) => ({
      id, 
      username: p.username, 
      tokens: p.tokens,
      table: p.table
    })));
  });
  
  // Handle disconnect
    socket.on('disconnect', () => {
      console.log('Disconnected:', socket.id);
      delete players[socket.id];
      io.emit('players', Object.entries(players).map(([id, p]) => ({
        id, 
        username: p.username, 
        tokens: p.tokens,
        table: p.table
      })));
    });
  
  // Chat message handling
  socket.on('sendChat', (message) => {
    io.emit('receiveChat', { 
      sender: player.username, 
      message 
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});