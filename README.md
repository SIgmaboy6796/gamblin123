# Fake Money Multiplayer Casino

A real-time multiplayer casino game built with Node.js, Express, Socket.io, and vanilla JavaScript. Play Coin Flip, Roulette, Blackjack, and Slot Machine with friends at the same table (max 6 players per table).

## Features

- **Multiplayer Tables**: Join tables with up to 6 players, each table has its own game state
- **Real-time Chat**: Chat with other players at your table
- **Four Games**:
  - Coin Flip (1:1 payout)
  - Roulette (color, odd/even, number bets)
  - Blackjack (hit/stand, dealer AI, card images)
  - Slot Machine (3 reels, multiple paylines)
- **Token System**: Start with 1000 tokens, no real money involved
- **Live Player Count**: See how many players are online
- **Animations**: Card dealing, coin flips, chip selection

## Prerequisites

- Node.js (v14 or higher)
- npm (comes with Node.js)

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd "c:\Users\Skulzd\Desktop\something I don't understand"
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

## Running the Server

Start the server:
```bash
npm start
```

Or for development with auto-restart (if you have nodemon):
```bash
npx nodemon server.js
```

The server will start on `http://localhost:3000` (or the port specified in `PORT` environment variable).

## Playing the Game

1. Open your browser and navigate to `http://localhost:3000`
2. The game opens with 1000 tokens
3. Select a game from the dropdown
4. Join a table or play solo
5. Place bets using the chip buttons or enter amount manually
6. Chat with other players at your table

### Multiplayer

- Select a table from the "Table:" dropdown
- Up to 6 players can join each table
- Each table maintains its own game state (for Blackjack)
- Chat is table-specific

## Project Structure

```
something I don't understand/
├── server.js              # Express + Socket.io server
├── games/
│   ├── coinflip.js      # Coin flip game logic
│   ├── roulette.js      # Roulette game logic
│   ├── blackjack.js     # Blackjack game logic
│   └── slots.js         # Slot machine game logic
├── public/
│   ├── index.html        # Main HTML page
│   ├── client.js         # Client-side JavaScript
│   └── style.css         # Styles and animations
├── package.json
└── README.md
```

## Deployment on Vercel

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Import the project in Vercel
3. Set the build command to: `npm install`
4. Set the output directory to: `public`
5. Add environment variable: `PORT=3000` (or let Vercel assign its own)
6. Deploy!

**Note**: This is a real-time application using WebSockets. Make sure your Vercel deployment supports Socket.io connections.

## Game Rules

### Coin Flip
- Bet any amount
- Pick heads or tails
- Win: 1:1 payout

### Roulette
- Bet on color (red/black), odd/even, or specific numbers (0-36)
- Payouts:
  - Single number: 35:1
  - Color: 1:1
  - Odd/Even: 1:1

### Blackjack
- Get as close to 21 as possible without going over
- Face cards = 10, Ace = 1 or 11
- Hit to draw another card, Stand to keep your hand
- Dealer must hit on 16, stand on 17
- Blackjack (21 with 2 cards) pays 3:2

### Slot Machine
- Spin the reels
- Match symbols on the payline
- Payouts:
  - 🍒🍒🍒 = 2x
  - 🍋🍋🍋 = 2x
  - 🍊🍊🍊 = 3x
  - 🍇🍇🍇 = 3x
  - 🔔🔔🔔 = 5x
  - ⭐⭐⭐ = 10x
  - 💎💎💎 = 20x
  - 7️⃣7️⃣7️⃣ = 50x

## Technologies Used

- **Backend**: Node.js, Express, Socket.io
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **Real-time Communication**: Socket.io WebSockets
- **Card Images**: Deck of Cards API (deckofcardsapi.com)

## Known Issues & Fixes

- Fixed: Player count display (now uses separate `onlineCount` event)
- Fixed: Chat functionality (server-authoritative, per table)
- Fixed: Blackjack board duplication (now removes existing board before re-rendering)
- Fixed: Blackjack game logic (no more 28 on 2 cards)
- Fixed: Token system (replaced money with tokens throughout)
- Fixed: Table management (max 6 players, proper join/leave handling)

## License

MIT License - Feel free to use this project for learning or personal use.