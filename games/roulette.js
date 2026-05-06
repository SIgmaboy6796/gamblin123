/**
 * Roulette game logic
 * @param {number} amount - bet amount
 * @param {object} data - { type: 'color' | 'odd' | 'even' | 'number', value: 'red' | 'black' | number }
 * @returns {{win: boolean, payout: number, details: string}}
 */
module.exports = function (amount, data) {
  const result = Math.floor(Math.random() * 37); // 0-36
  const betType = data.type;
  const betValue = data.value;

  // Validate bet type and value
  if (!['color', 'odd', 'even', 'number'].includes(betType)) {
    return { win: false, payout: 0, details: 'Invalid bet type' };
  }

  if (betType === 'color' && !['red', 'black'].includes(betValue)) {
    return { win: false, payout: 0, details: 'Invalid color bet' };
  }

  if (betType === 'number' && (isNaN(betValue) || betValue < 0 || betValue > 36)) {
    return { win: false, payout: 0, details: 'Invalid number bet' };
  }

  let win = false;
  let payout = 0;
  let details = '';

  switch (betType) {
    case 'color':
      const isRed = result >= 1 && result <= 10 || result >= 19 && result <= 28;
      win = isRed;
      payout = win ? amount * 2 : 0;
      details = `Roulette landed on ${result}. You bet on ${betValue}. ${win ? 'You win!' : 'You lose.'}`;
      break;
    case 'odd':
      win = result % 2 === 1;
      payout = win ? amount * 2 : 0;
      details = `Roulette landed on ${result}. You bet on odd. ${win ? 'You win!' : 'You lose.'}`;
      break;
    case 'even':
      win = result % 2 === 0;
      payout = win ? amount * 2 : 0;
      details = `Roulette landed on ${result}. You bet on even. ${win ? 'You win!' : 'You lose.'}`;
      break;
    case 'number':
      win = result === parseInt(betValue);
      payout = win ? amount * 35 : 0;
      details = `Roulette landed on ${result}. You bet on ${betValue}. ${win ? 'You win!' : 'You lose.'}`;
      break;
  }

  return { win, payout, details };
};