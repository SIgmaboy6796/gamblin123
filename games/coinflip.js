/**
 * Coin Flip game logic
 * @param {number} amount - bet amount
 * @param {object} data - { choice: 'heads' | 'tails' }
 * @returns {{win: boolean, payout: number, details: string}}
 */
module.exports = function (amount, data) {
  const choice = data.choice;
  const result = Math.random() < 0.5 ? 'heads' : 'tails';
  const win = choice === result;
  const payout = win ? amount * 2 : 0;
  return {
    win,
    payout,
    details: `Coin landed on ${result}. You chose ${choice}.`,
  };
};