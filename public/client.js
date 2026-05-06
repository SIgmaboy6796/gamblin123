const socket = io();

let currentGame = 'coinflip';
let selectedChoice = null;
let playerTokens = 1000;
let blackjackHand = [];
let blackjackDealerHand = [];
let blackjackDeck = null;
let blackjackGameOver = false;
let currentTable = null;

// DOM Elements
const gameSelect = document.getElementById('gameSelect');
const gameArea = document.getElementById('game-area');
const betAmount = document.getElementById('betAmount');
const placeBetBtn = document.getElementById('placeBetBtn');
const resultDiv = document.getElementById('result');
const balanceDiv = document.getElementById('balance');
const resetBtn = document.getElementById('resetBtn');
const tableSelect = document.getElementById('tableSelect');
const chatMessages = document.getElementById('chat-messages');
const chatInput = document.getElementById('chatInput');
const sendChatBtn = document.getElementById('sendChatBtn');
const onlineCount = document.getElementById('onlineCount');

// Helper to map card objects to image URLs (Deck of Cards API)
function cardToImage(card) {
  const suitMap = { '♠': 'S', '♥': 'H', '♦': 'D', '♣': 'C' };
  const valueMap = {
    'A': 'A', '2': '2', '3': '3', '4': '4', '5': '5',
    '6': '6', '7': '7', '8': '8', '9': '9', '10': '0',
    'J': 'J', 'Q': 'Q', 'K': 'K'
  };
  const code = `${valueMap[card.value]}${suitMap[card.suit]}`;
  return `https://deckofcardsapi.com/static/img/${code}.png`;
}

/* -------------------- Socket.io Event Handlers -------------------- */
socket.on('connect', () => console.log('Connected to server'));

socket.on('init', (data) => {
  playerTokens = data.tokens;
  updateTokens();
  renderGameUI();
});

socket.on('players', updatePlayerList);

socket.on('betResult', (result) => {
  if (!result.success) {
    showResult(false, result.message);
    return;
  }
  // Adjust token balance
  playerTokens += result.payout - parseInt(betAmount.value);
  updateTokens();

  // Show win/lose message
  showResult(result.win, result.details);

  // Update blackjack state if present
  if (result.hand) blackjackHand = result.hand;
  if (result.dealerHand) blackjackDealerHand = result.dealerHand;
  if (result.deck) blackjackDeck = result.deck; // Fixed typo: decker → deck

  // Track game over state for Blackjack
  if (result.details && (result.details.includes('Dealer wins') || result.details.includes('You win') || result.details.includes('Push'))) {
    blackjackGameOver = true;
  }

  // Re-render blackjack UI if needed
  if (currentGame === 'blackjack') renderBlackjackUI();
});

socket.on('receiveChat', ({ sender, message }) => addChatMessage(sender, message));

/* -------------------- UI Event Listeners -------------------- */
gameSelect.addEventListener('change', (e) => {
  currentGame = e.target.value;
  selectedChoice = null;
  blackjackHand = [];
  blackjackDealerHand = [];
  blackjackDeck = null;
  blackjackGameOver = false;
  renderGameUI();
});

placeBetBtn.addEventListener('click', placeBet);
resetBtn.addEventListener('click', () => location.reload());
tableSelect.addEventListener('change', (e) => {
  currentTable = e.target.value;
  socket.emit('joinTable', currentTable);
});
sendChatBtn.addEventListener('click', sendChat);
chatInput.addEventListener('keypress', (e) => e.key === 'Enter' && sendChat());

/* -------------------- Core Functions -------------------- */
function updateTokens() {
  balanceDiv.textContent = `Tokens: ${playerTokens}`;
}

function showResult(win, details) {
  resultDiv.textContent = details;
  resultDiv.className = win ? 'win' : 'lose';
  resultDiv.classList.remove('hidden');
  setTimeout(() => resultDiv.classList.add('hidden'), 3000);
}

function placeBet() {
  const amount = parseInt(betAmount.value);
  if (isNaN(amount) || amount <= 0 || amount > playerTokens) {
    showResult(false, 'Invalid bet amount');
    return;
  }

  let data = {};
  if (currentGame === 'coinflip') {
    if (!selectedChoice) {
      showResult(false, 'Select heads or tails');
      return;
    }
    data = { choice: selectedChoice };
  } else if (currentGame === 'roulette') {
    const betType = document.getElementById('rouletteBetType').value;
    const betValue = document.getElementById('rouletteBetValue').value;
    data = { type: betType, value: betValue };
  } else if (currentGame === 'blackjack') {
    data = {
      action: blackjackHand.length === 0 ? 'start' : (blackjackGameOver ? 'start' : 'hit'),
      hand: blackjackHand,
      dealerHand: blackjackDealerHand,
      deck: blackjackDeck
    };
  } else if (currentGame === 'slots') {
    data = { lines: 1 };
  }

  socket.emit('placeBet', { game: currentGame, amount, data });
}

function sendChat() {
  const message = chatInput.value.trim();
  if (message) {
    socket.emit('sendChat', message);
    chatInput.value = '';
  }
}

function addChatMessage(sender, message) {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message';
  messageDiv.innerHTML = `<strong>${sender}:</strong> ${message}`;
  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function updatePlayerList(playersArray) {
  // Update online count
  onlineCount.textContent = playersArray.length;

  // Update table selector with available tables
  const tables = new Set();
  playersArray.forEach(p => {
    if (p.table) tables.add(p.table);
  });

  const currentSelection = tableSelect.value;
  tableSelect.innerHTML = '<option value="">Solo Play</option>';
  tables.forEach(table => {
    const option = document.createElement('option');
    option.value = table;
    option.textContent = `Table ${table}`;
    tableSelect.appendChild(option);
  });

  // Restore current selection if still valid
  if ([...tables].includes(currentSelection)) {
    tableSelect.value = currentSelection;
  }
}

function renderGameUI() {
  gameArea.innerHTML = '';
  if (currentGame === 'coinflip') {
    renderCoinFlipUI();
  } else if (currentGame === 'roulette') {
    renderRouletteUI();
  } else if (currentGame === 'blackjack') {
    renderBlackjackUI();
  } else if (currentGame === 'slots') {
    renderSlotsUI();
  }
  renderChipSelector(); // update chip selector after any game UI is rendered
}

// Render chip selector for betting
function renderChipSelector() {
  const chipContainer = document.getElementById('chip-selector');
  if (!chipContainer) return;
  chipContainer.innerHTML = '';
  const chipValues = [5, 20, 50, 100, 200, 500, 1000];
  chipValues.forEach(val => {
    const chipBtn = document.createElement('button');
    chipBtn.className = 'chip-btn';
    chipBtn.textContent = val;
    chipBtn.onclick = () => {
      betAmount.value = val;
    };
    chipContainer.appendChild(chipBtn);
  });
}

/* -------------------- Game-Specific UI Renderers -------------------- */
function renderCoinFlipUI() {
  const container = document.createElement('div');
  container.className = 'coin-container';

  const coin = document.createElement('div');
  coin.className = 'coin';
  coin.id = 'coin';

  const heads = document.createElement('div');
  heads.className = 'coin-face heads';
  heads.textContent = 'H';

  const tails = document.createElement('div');
  tails.className = 'coin-face tails';
  tails.textContent = 'T';

  coin.appendChild(heads);
  coin.appendChild(tails);
  container.appendChild(coin);

  const buttonContainer = document.createElement('div');
  buttonContainer.className = 'coin-buttons';

  const headsBtn = document.createElement('button');
  headsBtn.className = 'coin-btn';
  headsBtn.textContent = 'Heads';
  headsBtn.onclick = () => {
    selectedChoice = 'heads';
    headsBtn.classList.add('selected');
    tailsBtn.classList.remove('selected');
  };

  const tailsBtn = document.createElement('button');
  tailsBtn.className = 'coin-btn';
  tailsBtn.textContent = 'Tails';
  tailsBtn.onclick = () => {
    selectedChoice = 'tails';
    tailsBtn.classList.add('selected');
    headsBtn.classList.remove('selected');
  };

  buttonContainer.appendChild(headsBtn);
  buttonContainer.appendChild(tailsBtn);

  gameArea.appendChild(container);
  gameArea.appendChild(buttonContainer);
}

function renderRouletteUI() {
  const container = document.createElement('div');

  const betTypeSelect = document.createElement('select');
  betTypeSelect.id = 'rouletteBetType';
  ['color', 'odd', 'even', 'number'].forEach(type => {
    const opt = document.createElement('option');
    opt.value = type;
    opt.textContent = type.charAt(0).toUpperCase() + type.slice(1);
    betTypeSelect.appendChild(opt);
  });

  const betValueInput = document.createElement('input');
  betValueInput.type = 'text';
  betValueInput.id = 'rouletteBetValue';
  betValueInput.placeholder = 'Enter value (red/black or 0-36)';

  container.appendChild(betTypeSelect);
  container.appendChild(betValueInput);

  gameArea.appendChild(container);
}

function renderBlackjackUI() {
  // Remove existing blackjack table to avoid duplicates
  const existingTable = gameArea.querySelector('#blackjack-table');
  if (existingTable) existingTable.remove();

  const container = document.createElement('div');
  container.id = 'blackjack-table';

  // Dealer section
  const dealerSection = document.createElement('div');
  dealerSection.className = 'dealer-section';

  const dealerTitle = document.createElement('h3');
  dealerTitle.textContent = 'Dealer';
  dealerSection.appendChild(dealerTitle);

  const dealerCardsDiv = document.createElement('div');
  dealerCardsDiv.id = 'dealer-cards';
  dealerCardsDiv.className = 'cards-container';

  // Show dealer cards (hide second card until game over)
  if (blackjackDealerHand.length > 0) {
    // First dealer card (always shown)
    const firstCardImg = document.createElement('img');
    firstCardImg.src = cardToImage(blackjackDealerHand[0]);
    firstCardImg.className = 'card-image';
    firstCardImg.alt = `${blackjackDealerHand[0].value}${blackjackDealerHand[0].suit}`;
    dealerCardsDiv.appendChild(firstCardImg);

    // Second dealer card (hidden until game over)
    if (blackjackGameOver && blackjackDealerHand.length > 1) {
      const secondCardImg = document.createElement('img');
      secondCardImg.src = cardToImage(blackjackDealerHand[1]);
      secondCardImg.className = 'card-image';
      secondCardImg.alt = `${blackjackDealerHand[1].value}${blackjackDealerHand[1].suit}`;
      dealerCardsDiv.appendChild(secondCardImg);
    } else if (blackjackDealerHand.length > 1) {
      const hiddenCard = document.createElement('div');
      hiddenCard.className = 'card-image hidden-card';
      hiddenCard.textContent = '?';
      dealerCardsDiv.appendChild(hiddenCard);
    }

    // Show dealer hand value only when game is over
    if (blackjackGameOver) {
      const dealerValue = document.createElement('div');
      dealerValue.className = 'hand-value';
      dealerValue.textContent = `Value: ${getHandValue(blackjackDealerHand)}`;
      dealerSection.appendChild(dealerValue);
    }
  }

  dealerSection.appendChild(dealerCardsDiv);

  // Player section
  const playerSection = document.createElement('div');
  playerSection.className = 'player-section';

  const playerTitle = document.createElement('h3');
  playerTitle.textContent = 'Your Hand';
  playerSection.appendChild(playerTitle);

  const playerCardsDiv = document.createElement('div');
  playerCardsDiv.id = 'player-cards';
  playerCardsDiv.className = 'cards-container';

  // Show player cards
  if (blackjackHand.length > 0) {
    blackjackHand.forEach(card => {
      const cardImg = document.createElement('img');
      cardImg.src = cardToImage(card);
      cardImg.className = 'card-image';
      cardImg.alt = `${card.value}${card.suit}`;
      playerCardsDiv.appendChild(cardImg);
    });

    const playerValue = document.createElement('div');
    playerValue.className = 'hand-value';
    playerValue.textContent = `Value: ${getHandValue(blackjackHand)}`;
    playerSection.appendChild(playerValue);
  }

  playerSection.appendChild(playerCardsDiv);

  // Action buttons (always show if hand exists)
  if (blackjackHand.length > 0) {
    const actionButtons = document.createElement('div');
    actionButtons.className = 'action-buttons';

    const hitBtn = document.createElement('button');
    hitBtn.className = 'hit-btn';
    hitBtn.textContent = 'Hit';
    hitBtn.disabled = blackjackGameOver; // Disable after game over
    hitBtn.onclick = () => {
      socket.emit('placeBet', {
        game: 'blackjack',
        amount: parseInt(betAmount.value),
        data: {
          action: 'hit',
          hand: blackjackHand,
          dealerHand: blackjackDealerHand,
          deck: blackjackDeck
        }
      });
    };

    const standBtn = document.createElement('button');
    standBtn.className = 'stand-btn';
    standBtn.textContent = 'Stand';
    standBtn.disabled = blackjackGameOver; // Disable after game over
    standBtn.onclick = () => {
      socket.emit('placeBet', {
        game: 'blackjack',
        amount: parseInt(betAmount.value),
        data: {
          action: 'stand',
          hand: blackjackHand,
          dealerHand: blackjackDealerHand,
          deck: blackjackDeck
        }
      });
    };

    actionButtons.appendChild(hitBtn);
    actionButtons.appendChild(standBtn);
    container.appendChild(actionButtons);
  }

  // New Game button after round ends
  if (blackjackGameOver) {
    const newGameBtn = document.createElement('button');
    newGameBtn.className = 'new-game-btn';
    newGameBtn.textContent = 'New Game';
    newGameBtn.onclick = () => {
      // Clear the game area and reset state
      gameArea.innerHTML = '';
      blackjackHand = [];
      blackjackDealerHand = [];
      blackjackDeck = null;
      blackjackGameOver = false;
      // Start a new game
      socket.emit('placeBet', {
        game: 'blackjack',
        amount: parseInt(betAmount.value),
        data: { action: 'start' }
      });
    };
    container.appendChild(newGameBtn);
  }

  // Assemble container
  container.appendChild(dealerSection);
  container.appendChild(playerSection);

  gameArea.appendChild(container);
}

function getHandValue(hand) {
  let value = 0;
  let aces = 0;
  for (const card of hand) {
    if (card.value === 'A') {
      aces++;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.value)) {
      value += 10;
    } else {
      value += parseInt(card.value);
    }
  }
  while (value > 21 && aces > 0) {
    value -= 10;
    aces--;
  }
  return value;
}

function renderSlotsUI() {
  const container = document.createElement('div');
  container.id = 'slot-machine';

  const reelsDiv = document.createElement('div');
  reelsDiv.className = 'reels';

  for (let i = 0; i < 3; i++) {
    const reel = document.createElement('div');
    reel.className = 'reel';
    reel.id = `reel${i}`;
    reel.textContent = '🍒';
    reelsDiv.appendChild(reel);
  }

  const spinBtn = document.createElement('button');
  spinBtn.className = 'spin-btn';
  spinBtn.textContent = 'Spin';
  spinBtn.onclick = placeBet;

  const paytable = document.createElement('div');
  paytable.className = 'paytable';
  paytable.innerHTML = `
    <div>🍒🍒🍒 = 2x</div>
    <div>🍋🍋🍋 = 2x</div>
    <div>🍊🍊🍊 = 3x</div>
    <div>🍇🍇🍇 = 3x</div>
    <div>🔔🔔🔔 = 5x</div>
    <div>⭐⭐⭐ = 10x</div>
    <div>💎💎💎 = 20x</div>
    <div>7️⃣7️⃣7️⃣ = 50x</div>
  `;

  container.appendChild(reelsDiv);
  container.appendChild(spinBtn);
  container.appendChild(paytable);

  gameArea.appendChild(container);
}

// Initial render
renderGameUI();