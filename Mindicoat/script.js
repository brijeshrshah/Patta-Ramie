const setupPanel = document.getElementById('setupPanel');
const gamePanel = document.getElementById('gamePanel');
const startBtn = document.getElementById('startBtn');
const exitBtn = document.getElementById('exitBtn');
const roundLabel = document.getElementById('roundLabel');
const turnBanner = document.getElementById('turnBanner');
const statusBoard = document.getElementById('statusBoard');
const trumpBadge = document.getElementById('trumpBadge');
const trumpPanel = document.getElementById('trumpPanel');
const trumpPrompt = document.getElementById('trumpPrompt');
const suitChoices = document.getElementById('suitChoices');
const handGate = document.getElementById('handGate');
const gateText = document.getElementById('gateText');
const gateRevealBtn = document.getElementById('gateRevealBtn');
const trickArea = document.getElementById('trickArea');
const handArea = document.getElementById('handArea');
const followHint = document.getElementById('followHint');
const handFan = document.getElementById('handFan');
const roundEnd = document.getElementById('roundEnd');
const roundSummary = document.getElementById('roundSummary');
const nextDealerNote = document.getElementById('nextDealerNote');
const restartBtn = document.getElementById('restartBtn');
const resetScoreBtn = document.getElementById('resetScoreBtn');
const resetCounterBtn = document.getElementById('resetCounterBtn');
const nextRoundBtn = document.getElementById('nextRoundBtn');
const vsComputerInput = document.getElementById('vsComputer');

// Rank strength, weakest to strongest. Full 52-card deck.
const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = [
  { symbol: '♠', color: 'black' },
  { symbol: '♥', color: 'red' },
  { symbol: '♦', color: 'red' },
  { symbol: '♣', color: 'black' },
];
const SUIT_ORDER = SUITS.map((s) => s.symbol);
const SEAT_COUNT = 4;
const DEAL_STEPS = [5, 4, 4];
const MINDI_RANK = '10';
const MINDI_TOTAL = 4;
const MINDI_TARGET = 3;
const HANDS_TIEBREAK = 7;

let players = [];
let pairRoundsWon = [0, 0];
let pairMasterWins = [0, 0];
let roundIndex = 0;
let leaderIndex = 0;
let dealerIndex = 3;
let trumpSuit = null;
let pendingDeals = [];
let trick = [];
let trickLeaderIndex = 0;
let currentTurnIndex = 0;
let phase = 'setup';
let gameId = 0;
let vsComputer = true;
const AI_DELAY = 900;
const AVATARS = ['🤴', '👨', '👩', '🧑'];
const SEAT_POS = ['bottom', 'left', 'top', 'right'];
const TEN_SUITS = ['♥', '♣', '♦', '♠'];

function createDeck() {
  const deck = [];
  SUITS.forEach((suit) => {
    RANKS.forEach((rank) => {
      deck.push({ rank, suit: suit.symbol, color: suit.color, display: `${rank}${suit.symbol}` });
    });
  });
  return deck;
}

function shuffle(array) {
  const result = array.slice();
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function cardStrength(card) {
  return RANKS.indexOf(card.rank);
}

function isMindi(card) {
  return card.rank === MINDI_RANK;
}

function sortHand(a, b) {
  const suitDiff = SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
  if (suitDiff !== 0) return suitDiff;
  return cardStrength(b) - cardStrength(a);
}

function isComputer(index) {
  return vsComputer && index !== 0;
}

function startMatch() {
  gameId += 1;
  vsComputer = vsComputerInput.checked;
  const names = [0, 1, 2, 3].map((i) => {
    const input = document.getElementById(`nameInput${i}`);
    const typed = input ? input.value.trim() : '';
    return typed || (vsComputer && i > 0 ? `Computer ${i + 1}` : `Player ${i + 1}`);
  });
  players = names.map((name) => ({ name, hand: [], tricksWon: 0, mindisWon: 0, mindiSuits: [] }));
  pairRoundsWon = [0, 0];
  pairMasterWins = [0, 0];
  roundIndex = 0;
  dealerIndex = SEAT_COUNT - 1;
  setupPanel.classList.add('hidden');
  gamePanel.classList.remove('hidden');
  startRound();
}

function startRound() {
  // The player after the dealer is dealt first, calls the Supreme Suit and leads.
  leaderIndex = (dealerIndex + 1) % SEAT_COUNT;
  players.forEach((p) => { p.tricksWon = 0; p.mindisWon = 0; p.mindiSuits = []; p.hand = []; });
  trumpSuit = null;
  trick = [];
  trumpBadge.classList.add('hidden');

  roundEnd.classList.add('hidden');
  handArea.classList.add('hidden');
  handGate.classList.add('hidden');
  trickArea.innerHTML = '';
  roundLabel.textContent = `Round ${roundIndex + 1}`;

  const deck = shuffle(createDeck());
  let cursor = 0;
  const dealBatch = (count) => {
    for (let r = 0; r < count; r += 1) {
      for (let k = 0; k < SEAT_COUNT; k += 1) {
        players[(leaderIndex + k) % SEAT_COUNT].hand.push(deck[cursor]);
        cursor += 1;
      }
    }
  };
  dealBatch(DEAL_STEPS[0]);
  pendingDeals = [];
  const rest = deck.slice(cursor);
  let offset = 0;
  DEAL_STEPS.slice(1).forEach((count) => {
    const size = count * SEAT_COUNT;
    pendingDeals.push(rest.slice(offset, offset + size));
    offset += size;
  });
  players.forEach((p) => p.hand.sort(sortHand));

  renderStatusBoard();
  showTrumpGate();
}

function showTrumpGate() {
  phase = 'trump';
  trumpPanel.classList.add('hidden');
  handArea.classList.add('hidden');
  if (isComputer(leaderIndex)) {
    handGate.classList.add('hidden');
    turnBanner.textContent = `${players[leaderIndex].name} is choosing the Supreme Suit…`;
    showWaitingHand('Waiting for the Supreme Suit…');
    const id = gameId;
    setTimeout(() => {
      if (id !== gameId || phase !== 'trump') return;
      chooseTrump(aiChooseTrump(leaderIndex));
    }, AI_DELAY);
    return;
  }
  if (vsComputer) {
    revealTrumpHand();
    turnBanner.textContent = `${players[leaderIndex].name}, choose the Supreme Suit`;
    return;
  }
  handGate.classList.remove('hidden');
  gateText.textContent = `Pass the device to ${players[leaderIndex].name}`;
  turnBanner.textContent = `${players[leaderIndex].name} is choosing the Supreme Suit…`;
  gateRevealBtn.onclick = () => revealTrumpHand();
}

function revealTrumpHand() {
  handGate.classList.add('hidden');
  handArea.classList.remove('hidden');
  renderTrumpHandView(leaderIndex);
  trumpPanel.classList.remove('hidden');
  trumpPrompt.textContent = `${players[leaderIndex].name}, choose the Supreme Suit`;
}

function renderTrumpHandView(index) {
  handFan.innerHTML = '';
  players[index].hand.forEach((card) => {
    const el = document.createElement('div');
    el.className = `hand-card view-only${card.color === 'red' ? ' red-suit' : ''}${isMindi(card) ? ' mindi' : ''}`;
    el.innerHTML = `<span class="idx-rank">${card.rank}</span><span class="idx-suit">${card.suit}</span>`;
    handFan.appendChild(el);
  });
}

function chooseTrump(suit) {
  if (phase !== 'trump') return;
  trumpSuit = suit;
  const trumpColor = SUITS.find((x) => x.symbol === suit).color;
  trumpBadge.className = `trump-badge${trumpColor === 'red' ? ' red-suit' : ''}`;
  trumpBadge.textContent = `Supreme Suit: ${suit}`;
  trumpPanel.classList.add('hidden');
  handArea.classList.add('hidden');
  dealRemaining();
}

function dealRemaining() {
  pendingDeals.forEach((batch) => {
    batch.forEach((card, n) => {
      players[(leaderIndex + n) % SEAT_COUNT].hand.push(card);
    });
  });
  players.forEach((p) => p.hand.sort(sortHand));
  trickLeaderIndex = leaderIndex;
  trick = [];
  renderStatusBoard();
  beginTrickTurn(trickLeaderIndex);
}

function legalCardsFor(index) {
  const hand = players[index].hand;
  if (trick.length === 0) return hand.slice();
  const ledSuit = trick[0].card.suit;
  const followable = hand.filter((c) => c.suit === ledSuit);
  return followable.length ? followable : hand.slice();
}

function beginTrickTurn(index) {
  currentTurnIndex = index;
  phase = 'play';
  renderTrickArea();
  renderStatusBoard();
  showHandGate(index);
}

function showHandGate(index) {
  if (vsComputer) {
    handGate.classList.add('hidden');
    if (isComputer(index)) {
      turnBanner.textContent = `${players[index].name} is thinking…`;
      showWaitingHand(`Waiting for ${players[index].name}…`);
      const id = gameId;
      setTimeout(() => {
        if (id !== gameId || phase !== 'play' || currentTurnIndex !== index) return;
        playCard(index, chooseAiCard(index));
      }, AI_DELAY);
    } else {
      turnBanner.textContent = `${players[index].name}, it's your turn`;
      revealHand(index);
    }
    return;
  }
  handArea.classList.add('hidden');
  handGate.classList.remove('hidden');
  gateText.textContent = `Pass the device to ${players[index].name}`;
  turnBanner.textContent = `${players[index].name}'s turn to play`;
  gateRevealBtn.onclick = () => revealHand(index);
}

function revealHand(index) {
  handGate.classList.add('hidden');
  handArea.classList.remove('hidden');
  renderHandFan(index);
}

// Shows the human player's (Player 1) cards, not playable, while the computer is acting.
function showWaitingHand(message) {
  handArea.classList.remove('hidden');
  followHint.textContent = message;
  handFan.innerHTML = '';
  players[0].hand.forEach((card) => {
    const el = document.createElement('div');
    el.className = `hand-card view-only${card.color === 'red' ? ' red-suit' : ''}${isMindi(card) ? ' mindi' : ''}`;
    el.innerHTML = `<span class="idx-rank">${card.rank}</span><span class="idx-suit">${card.suit}</span>`;
    handFan.appendChild(el);
  });
}

function renderHandFan(index) {
  handFan.innerHTML = '';
  const legal = legalCardsFor(index);

  if (trick.length === 0) {
    followHint.textContent = "You're leading — play any card.";
  } else {
    const ledSuit = trick[0].card.suit;
    const hasLedSuit = players[index].hand.some((c) => c.suit === ledSuit);
    followHint.textContent = hasLedSuit
      ? `Must follow suit: play a ${ledSuit} card.`
      : `No ${ledSuit} in hand — play any card.`;
  }

  players[index].hand.forEach((card) => {
    const isLegal = legal.includes(card);
    const btn = document.createElement('button');
    btn.className = `hand-card${card.color === 'red' ? ' red-suit' : ''}${isMindi(card) ? ' mindi' : ''}`;
    btn.disabled = !isLegal;
    btn.innerHTML = `<span class="idx-rank">${card.rank}</span><span class="idx-suit">${card.suit}</span>`;
    btn.addEventListener('click', () => playCard(index, card));
    handFan.appendChild(btn);
  });
}

function playCard(index, card) {
  const player = players[index];
  const pos = player.hand.indexOf(card);
  player.hand.splice(pos, 1);
  trick.push({ index, card });
  handArea.classList.add('hidden');
  renderTrickArea();
  renderStatusBoard();

  if (trick.length < SEAT_COUNT) {
    beginTrickTurn((index + 1) % SEAT_COUNT);
  } else {
    resolveTrick();
  }
}

// ---- Computer player ----

function beats(a, b) {
  const aTrump = a.suit === trumpSuit;
  const bTrump = b.suit === trumpSuit;
  if (aTrump !== bTrump) return aTrump;
  if (a.suit !== b.suit) return false;
  return cardStrength(a) > cardStrength(b);
}

function currentTrickWinner() {
  return trick.reduce((best, t) => (beats(t.card, best.card) ? t : best), trick[0]);
}

// Lower = cheaper to give away: plain low cards first, then trump, 10s last.
function giveAwayCost(card) {
  return cardStrength(card) + (card.suit === trumpSuit ? 100 : 0) + (isMindi(card) ? 50 : 0);
}

function cheapest(cards) {
  return cards.slice().sort((a, b) => giveAwayCost(a) - giveAwayCost(b))[0];
}

function aiChooseTrump(index) {
  let best = SUITS[0].symbol;
  let bestScore = -1;
  SUITS.forEach((suit) => {
    const cards = players[index].hand.filter((c) => c.suit === suit.symbol);
    const score = cards.length * 10 + cards.reduce((sum, c) => sum + cardStrength(c), 0);
    if (score > bestScore) { bestScore = score; best = suit.symbol; }
  });
  return best;
}

function chooseAiCard(index) {
  const legal = legalCardsFor(index);

  if (trick.length === 0) {
    // Lead a plain-suit Ace if we have one, otherwise the cheapest card.
    const aces = legal.filter((c) => c.rank === 'A' && c.suit !== trumpSuit);
    return aces.length ? aces[0] : cheapest(legal);
  }

  const winning = currentTrickWinner();
  const isLast = trick.length === SEAT_COUNT - 1;
  const partnerWinning = winning.index === (index + 2) % SEAT_COUNT;

  if (partnerWinning) {
    // Feed a 10 to a partner's trick only when nobody can overtake them.
    const mindi = legal.filter(isMindi);
    if (isLast && mindi.length) return mindi[0];
    const plain = legal.filter((c) => !isMindi(c));
    return cheapest(plain.length ? plain : legal);
  }

  // An opponent is winning: take the trick with the cheapest card that beats it.
  const winners = legal.filter((c) => beats(c, winning.card) && (isLast || !isMindi(c)));
  if (winners.length) return cheapest(winners);
  const safe = legal.filter((c) => !isMindi(c));
  return cheapest(safe.length ? safe : legal);
}

function resolveTrick() {
  const ledSuit = trick[0].card.suit;
  const trumps = trick.filter((t) => t.card.suit === trumpSuit);
  const pool = trumps.length ? trumps : trick.filter((t) => t.card.suit === ledSuit);
  const winningEntry = pool.reduce((best, t) => (
    cardStrength(t.card) > cardStrength(best.card) ? t : best
  ), pool[0]);

  const winner = players[winningEntry.index];
  winner.tricksWon += 1;
  const mindisInTrick = trick.filter((t) => isMindi(t.card)).length;
  winner.mindisWon += mindisInTrick;
  trick.filter((t) => isMindi(t.card)).forEach((t) => winner.mindiSuits.push(t.card.suit));
  turnBanner.textContent = `${winner.name} wins the hand${mindisInTrick ? ` and collects ${mindisInTrick} Mindi (10)` : ''}!`;
  renderStatusBoard();

  // With 3 Mindis a pair has already won, but the round plays on until the 4th Mindi is
  // collected (all 4 = Master win). It also ends when all 13 hands are played (2-2 split).
  const allMindisPlayed = pairMindis(0) + pairMindis(1) === MINDI_TOTAL;
  if ((allMindisPlayed && mindiWinner() !== null) || winner.hand.length === 0) {
    endRound();
    return;
  }

  const id = gameId;
  setTimeout(() => {
    if (id !== gameId) return;
    trick = [];
    renderTrickArea();
    beginTrickTurn(winningEntry.index);
  }, 1400);
}

function pairOf(index) {
  return index % 2;
}

function pairName(pair) {
  return `${players[pair].name} & ${players[pair + 2].name}`;
}

function pairHands(pair) {
  return players[pair].tricksWon + players[pair + 2].tricksWon;
}

function pairMindis(pair) {
  return players[pair].mindisWon + players[pair + 2].mindisWon;
}

function mindiWinner() {
  if (pairMindis(0) >= MINDI_TARGET) return 0;
  if (pairMindis(1) >= MINDI_TARGET) return 1;
  return null;
}

function endRound() {
  phase = 'roundEnd';
  handGate.classList.add('hidden');
  handArea.classList.add('hidden');

  // 3 or more Mindis wins; with a 2-2 split the pair with 7+ hands wins.
  const byMindi = mindiWinner();
  const winningPair = byMindi !== null ? byMindi : (pairHands(0) >= HANDS_TIEBREAK ? 0 : 1);
  const isMaster = byMindi !== null && pairMindis(winningPair) === MINDI_TOTAL;
  const reason = byMindi !== null
    ? (isMaster ? 'MASTER WIN — all 4 Mindis collected' : `${pairMindis(winningPair)} Mindis collected`)
    : `Mindis split 2-2 — decided by hands (${pairHands(winningPair)})`;
  pairRoundsWon[winningPair] += 1;
  if (isMaster) pairMasterWins[winningPair] += 1;

  // The losing pair deals. The same dealer keeps dealing while their pair keeps losing;
  // when the other pair loses, the deal passes to the next seat (an opponent).
  const losingPair = 1 - winningPair;
  if (pairOf(dealerIndex) !== losingPair) {
    dealerIndex = (dealerIndex + 1) % SEAT_COUNT;
  }

  roundSummary.innerHTML = [0, 1].map((pair) => `
    <div class="summary-row">
      <span>${pairName(pair)}</span>
      <span>${pairMindis(pair)} 🔟 · ${pairHands(pair)} hands</span>
      <span class="${pair === winningPair ? 'plus' : 'minus'}">${pair === winningPair ? 'Won' : 'Lost'}</span>
      <span class="summary-total">Rounds ${pairRoundsWon[pair]}${pairMasterWins[pair] ? ` (${pairMasterWins[pair]} Master)` : ''}</span>
    </div>
  `).join('');

  roundEnd.classList.remove('hidden');
  turnBanner.textContent = `${pairName(winningPair)} win the round! ${reason}.`;
  nextDealerNote.textContent = `${pairName(losingPair)} lost, so ${players[dealerIndex].name} deals next.`;
  renderStatusBoard();
}

function pairMindiSuits(pair) {
  return players[pair].mindiSuits.concat(players[pair + 2].mindiSuits);
}

function renderSeats() {
  [0, 1, 2, 3].forEach((i) => {
    const el = document.getElementById(`seat${i}`);
    const active = (phase === 'play' && currentTurnIndex === i) || (phase === 'trump' && leaderIndex === i);
    el.className = `seat seat-${SEAT_POS[i]}${active ? ' active' : ''}`;
    el.innerHTML = `
      <div class="avatar">${AVATARS[i]}${leaderIndex === i ? '<span class="crown">👑</span>' : ''}</div>
      <div class="name-tag">${players[i].name}${dealerIndex === i ? ' 🃏' : ''}</div>
    `;
  });
}

function renderStatusBoard() {
  renderSeats();
  statusBoard.innerHTML = [0, 1].map((pair) => {
    const hands = pairHands(pair);
    const mindis = pairMindis(pair);
    const got = pairMindiSuits(pair);
    const isActive = phase === 'play' && pairOf(currentTurnIndex) === pair;
    const label = mindis === MINDI_TOTAL ? 'Master!' : mindis >= MINDI_TARGET ? 'Won' : `${MINDI_TARGET - mindis} to win`;
    const tens = TEN_SUITS.map((suit) => {
      const has = got.includes(suit) ? 1 : 0;
      const red = suit === '♥' || suit === '♦';
      return `
        <div class="mindi-col">
          <div class="mini-card${red ? ' red-suit' : ''}${has ? ' got' : ''}"><span>10</span><span>${suit}</span></div>
          <div class="mindi-num${has ? ' got' : ''}">${has}</div>
        </div>`;
    }).join('');
    return `
      <div class="team-panel${pair === 0 ? ' mine' : ' opp'}${isActive ? ' active' : ''}">
        <div class="team-head">
          <span class="team-name">${pairName(pair)}</span>
          <span class="team-rounds">Rounds ${pairRoundsWon[pair]}${pairMasterWins[pair] ? ` (${pairMasterWins[pair]}★)` : ''}</span>
        </div>
        <div class="team-body">
          <div class="mindi-grid">${tens}</div>
          <div class="hands-box"><div class="card-back"><span>${hands}</span></div><small>Hands</small></div>
        </div>
        <div class="team-foot ${mindis >= MINDI_TARGET ? 'plus' : ''}">Mindis ${mindis}/${MINDI_TOTAL} &middot; ${label}</div>
      </div>
    `;
  }).join('');
}

function renderTrickArea() {
  trickArea.innerHTML = trick.map((t) => `
    <div class="trick-slot slot-${SEAT_POS[t.index]}">
      <div class="trick-card${t.card.color === 'red' ? ' red-suit' : ''}${isMindi(t.card) ? ' mindi' : ''}"><span class="idx-rank">${t.card.rank}</span><span class="idx-suit">${t.card.suit}</span></div>
    </div>
  `).join('');
}

function backToSetup() {
  trumpBadge.classList.add('hidden');
  gamePanel.classList.add('hidden');
  setupPanel.classList.remove('hidden');
}

function restartGame() {
  if (phase === 'setup') return;
  if (!window.confirm('Restart this round with a new shuffle? The score is kept.')) return;
  gameId += 1;
  startRound();
}

function resetScore() {
  if (phase === 'setup') return;
  if (!window.confirm('Reset the score to zero?')) return;
  pairRoundsWon = [0, 0];
  pairMasterWins = [0, 0];
  renderStatusBoard();
  roundSummary.querySelectorAll('.summary-total').forEach((el) => { el.textContent = 'Rounds 0'; });
}

function exitGame() {
  gameId += 1;
  backToSetup();
}

startBtn.addEventListener('click', startMatch);
exitBtn.addEventListener('click', exitGame);
restartBtn.addEventListener('click', restartGame);
resetScoreBtn.addEventListener('click', resetScore);
resetCounterBtn.addEventListener('click', resetScore);
nextRoundBtn.addEventListener('click', () => {
  roundIndex += 1;
  startRound();
});
suitChoices.addEventListener('click', (event) => {
  const btn = event.target.closest('.suit-btn');
  if (!btn) return;
  chooseTrump(btn.dataset.suit);
});
