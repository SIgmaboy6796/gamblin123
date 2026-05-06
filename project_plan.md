# Multiplayer Fake-Money Gambling Game Project Plan

## 1. Project Overview
- **Goal**: Web-based real-time multiplayer game using fake currency (no real money)
- **Core Rules**:
  - All players start with $1000 fake balance
  - Page reload resets balance to $1000 (no persistent storage)
  - Multiple game modes: Coin Flip, Roulette, Blackjack, Slot Machine
- **Multiplayer**: Real-time updates via WebSockets, all players see shared game results
- **Scope**: Browser-based, no downloads required

## 2. Tech Stack
| Layer | Technology | Purpose |
|-------|------------|---------|
| Frontend | HTML5, CSS3, JavaScript (ES6+) | UI, animations, client-side logic |
| Realtime Communication | Socket.io (client + server) | Low-latency multiplayer updates |
| Backend | Node.js, Express.js | Serve static files, handle game logic |
| Animation | CSS Animations, Canvas API | Game-specific animations (roulette wheel, slot reels) |
| Dev Tools | Nodemon, npm | Local development, dependency management |

## 3. Implementation Phases

### Phase 1: Project Setup & Core Backend
- Initialize Node.js project (`npm init -y`)
- Install dependencies: `express`, `socket.io`, `nodemon` (dev)
- Set up directory structure:
  ```
  /public
    index.html
    style.css
    client.js
  /games
    coinflip.js
    roulette.js
    blackjack.js
    slots.js
  server.js
  package.json
  ```
- Implement Express server to serve static files from `/public`
- Set up Socket.io server, handle player connections
- Create in-memory player store: `{ socketId: { username: string, balance: 1000 } }`

### Phase 2: Core Multiplayer Logic
- Implement Socket.io events:
  - `setUsername`: Assign player username
  - `placeBet`: Validate bet amount ≤ balance, record bet
  - `resolveGame`: Server processes game outcome, update balances
  - `updateBalances`: Broadcast balance changes to all players
- Server-side fair random number generation using `crypto.randomInt`
- Handle player disconnection: Clean up player data from in-memory store

### Phase 3: Implement Individual Game Core Logic
- **Coin Flip**:
  - Bet options: Heads/Tails
  - Payout: 1:1 (win = bet amount * 2)
  - Server logic: Random 0/1 for heads/tails
- **Roulette**:
  - Bet options: Color (red/black), Odd/Even, Exact number (0-36)
  - Payouts: 1:1 (color/odd-even), 35:1 (exact number)
  - Server logic: Generate random number 0-36, determine color/parity
- **Blackjack**:
  - Basic rules: Hit/Stand, get as close to 21 as possible, dealer hits until 17
  - Payout: 1:1 (win), 3:2 (natural blackjack)
  - Server logic: Deck shuffling, card dealing, hand value calculation
- **Slot Machine**:
  - 3 reels, 5+ symbols per reel
  - Paylines: Match 3 same symbols on a line
  - Payout: Varies by symbol rarity
  - Server logic: Random symbol selection per reel

### Phase 4: UI/UX, Animations & Gameplay Polish (Middle/End Phase)
- **Base UI Layout**:
  - Responsive design (mobile/desktop friendly)
  - Game mode selector (tab/dropdown for Coin Flip/Roulette/Blackjack/Slots)
  - Player list with live balances
  - Betting panel (amount input, game-specific bet options)
  - Game display area (per game)
  - Chat box (optional multiplayer chat)
- **Animations for Each Game**:
  - **Coin Flip**:
    - Spinning coin CSS animation before result
    - Flip transition to show heads/tails
    - Win/lose color flash feedback
  - **Roulette**:
    - Canvas-based spinning wheel animation
    - Ball bouncing effect before landing on number
    - Highlight winning number/color on wheel
  - **Blackjack**:
    - Card deal animation (slide in from deck)
    - Card flip animation to reveal value
    - Dealer turn auto-play animation
  - **Slot Machine**:
    - Reel spin animation (scroll symbols rapidly)
    - Reels stop one by one with bounce effect
    - Win line highlight animation for matching symbols
- **Visual Feedback**:
  - Animated balance updates (+/- amounts)
  - Bet confirmation popups
  - Win/loss celebration animations (confetti for big wins)
- **Accessibility & Polish**:
  - High contrast mode
  - Sound effects (optional, toggle on/off)
  - Loading states for game actions

### Phase 5: Testing & Documentation
- Test multiplayer with multiple browser tabs
- Verify balance reset on page reload
- Test all game modes for correct payouts
- Fix bugs, optimize animation performance
- Write `README.md` with setup instructions:
  - `npm install` to install dependencies
  - `npm start` to run local server
  - Open `localhost:3000` in browser

## 4. Game-Specific UI/Gameplay Details
### Coin Flip
- UI: Simple coin display, heads/tails buttons, bet amount input
- Gameplay: Player picks heads/tails, places bet, server flips coin, result shown with animation

### Roulette
- UI: Roulette wheel (canvas), betting table (color/number options), spin button
- Gameplay: Players place bets on table, server spins wheel, all players see result

### Blackjack
- UI: Card table, player/dealer hand areas, hit/stand buttons
- Gameplay: Player gets 2 cards, dealer gets 1 up 1 down, player chooses hit/stand, dealer plays after

### Slot Machine
- UI: 3 reel display, spin button, paytable
- Gameplay: Player places bet, spins reels, matching symbols pay out

## 5. Task Checklist (Progress Tracking)
- [✅] Scaffold project and install dependencies
- [✅] Implement server with Express & Socket.io
- [ ] Design data structures for players and balances
- [ ] Implement core multiplayer Socket.io logic
- [✅] Implement Coin Flip core logic
- [✅] Implement Roulette core logic
- [✅] Implement Blackjack core logic
- [✅] Implement Slot Machine core logic
- [✅] Create base client UI (HTML/CSS)
- [ ] Implement client-side Socket.io logic
- [ ] Add Coin Flip UI & animations
- [ ] Add Roulette UI, canvas wheel & animations
- [ ] Add Blackjack UI & card animations
- [ ] Add Slot Machine UI & reel animations
- [ ] Add visual feedback & polish
- [ ] Test multiplayer interaction with multiple tabs
- [ ] Verify balance reset on reload
- [ ] Document setup and run instructions