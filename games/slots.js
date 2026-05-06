/**
 * Slot Machine game logic
 * @param {number} amount - bet amount * @param {object} data - { lines: number } (optional)
 * @returns {{win: boolean, payout: number, details: string, reels: string[][]}}
 */
const symbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '💎', '7'];
const symbolWeights = [4, 4, 4, 4, 3, 2, 1, 0.5]; // relative weights (higher = more common)

function weightedRandom() {
  const total = symbolWeights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < symbols.length; i++) {
    if (r < symbolWeights[i]) return symbols[i];
    r -= symbolWeights[i];
  }
  return symbols[symbols.length - 1];
}

function spinReels() {
  const reels = [];
  for (let i = 0; i < 3; i++) {
    const reel = [];
    for (let j = 0; j < 3; j++) {
      reel.push(weightedRandom());
    }
    reels.push(reel);
  }
  return reels;
}

function checkWin(reels, lines, amount) {
  let totalPayout = 0;
  let win = false;
  let details = '';
  const paytable = {
    '🍒': 2,
    '🍋': 2,
    '🍊': 3,
    '🍇': 3,
    '🔔': 5,
    '⭐': 10,
    '💎': 20,
    '7': 50,
  };

  // Check each line (for simplicity, we check the middle row only)
  const middleRow = reels.map(reel => reel[1]);
  const firstSymbol = middleRow[0];
  if (middleRow.every(s => s === firstSymbol)) {
    const multiplier = paytable[firstSymbol] || 0;
    totalPayout += amount * multiplier;
    if (multiplier > 0) {
      win = true;
      details += `Line win: ${firstSymbol} x3 = ${multiplier}x! `;
    }
  }

  // Check for any 3 matching symbols anywhere (simple bonus)
  const allSymbols = reels.flat();
  const counts = {};
  allSymbols.forEach(s => { counts[s] = (counts[s] || 0) + 1; });
  for (const [sym, count] of Object.entries(counts)) {
    if (count >= 3 && sym !== firstSymbol) {
      const multiplier = paytable[sym] || 0;
      totalPayout += amount * multiplier;
      if (multiplier > 0) {
        win = true;
        details += `Bonus: ${sym} x${count} = ${multiplier}x! `;
      }
    }
  }

  if (totalPayout > 0) {
    details += `Total payout: ${totalPayout}`;
  } else {
    details = 'No win this spin.';
  }

  return { win, payout: totalPayout, details, reels };
}

module.exports = function (amount, data) {
  const lines = data.lines || 1;
  const reels = spinReels();
  const result = checkWin(reels, lines, amount);
  return result;
};