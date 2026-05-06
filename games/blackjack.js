/**
 * Blackjack game logic
 * @param {object} socket - the socket object
 * @param {number} amount - bet amount
 * @param {object} data - { action: 'hit' | 'stand' | 'start', hand: array, dealerHand: array, deck: array }
 * @returns {{win: boolean, payout: number, details: string, hand: array, dealerHand: array, deck: array}}
 */
const suits = ['♠', '♥', '♦', '♣'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function createDeck() {
  const deck = [];
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

function shuffle(deck) {
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
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

module.exports = function (socket, amount, data) {
  const action = data.action || 'start';
  let hand = data.hand || [];
  let dealerHand = data.dealerHand || [];
  let deck = data.deck || shuffle(createDeck());

  // Start new game if hand is empty
  if (action === 'start' && hand.length === 0) {
    hand = [deck.pop(), deck.pop()];
    dealerHand = [deck.pop(), deck.pop()];
    const playerValue = getHandValue(hand);
    return {
      win: null,
      payout: 0,
      details: `You have ${playerValue}. Hit or stand?`,
      hand,
      dealerHand,
      deck
    };
  }

  if (action === 'hit') {
    hand.push(deck.pop());
    const playerValue = getHandValue(hand);
    if (playerValue > 21) {
      return {
        win: false,
        payout: 0,
        details: `Bust! You have ${playerValue}. Dealer wins.`,
        hand,
        dealerHand,
        deck
      };
    }
    return {
      win: null,
      payout: 0,
      details: `You have ${playerValue}. Hit or stand?`,
      hand,
      dealerHand,
      deck
    };
  }

  if (action === 'stand') {
    let dealerValue = getHandValue(dealerHand);
    while (dealerValue < 17) {
      dealerHand.push(deck.pop());
      dealerValue = getHandValue(dealerHand);
    }
    const playerValue = getHandValue(hand);
    if (dealerValue > 21 || playerValue > dealerValue) {
      return {
        win: true,
        payout: amount * 2,
        details: `You have ${playerValue}, dealer has ${dealerValue}. You win!`,
        hand,
        dealerHand,
        deck
      };
    } else if (playerValue === dealerValue) {
      return {
        win: true,
        payout: amount,
        details: `Push! Both have ${playerValue}.`,
        hand,
        dealerHand,
        deck
      };
    } else {
      return {
        win: false,
        payout: 0,
        details: `You have ${playerValue}, dealer has ${dealerValue}. Dealer wins.`,
        hand,
        dealerHand,
        deck
      };
    }
  }

  return { win: false, payout: 0, details: 'Invalid action', hand, dealerHand, deck };
};