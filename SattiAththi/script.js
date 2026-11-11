const setupPanel = document.getElementById('setupPanel');
const gamePanel = document.getElementById('gamePanel');
const playerCountSelect = document.getElementById('playerCount');
const nameInputs = document.getElementById('nameInputs');
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
const nextRoundBtn = document.getElementById('nextRoundBtn');

// Rank strength, weakest to strongest. Only hearts/spades carry a 7.
const RANKS = ['7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const SUITS = [
  { symbol: '♠', color: 'black' },
  { symbol: '♥', color: 'red' },
  { symbol: '♦', color: 'red' },
  { symbol: '♣', color: 'black' },
];
const SUIT_ORDER = SUITS.map((s) => s.symbol);
const SEAT_COUNT = 2;
const LEADER_TARGET = 8;
const OTHER_TARGET = 7;

let players = [];
let isSolo = false;
let cumulativeScore = [0, 0];
let roundIndex = 0;
let targets = [];
let leaderIndex = 0;
let trumpSuit = null;
let pendingSecondDeal = [];
let trick = [];
let currentTurnIndex = 0;
let phase = 'setup';
let gameId = 0;

function createDeck() {
  const deck = [];
  SUITS.forEach((suit) => {
    ['A', 'K', 'Q', 'J', '10', '9', '8'].forEach((rank) => {
      deck.push({ rank, suit: suit.symbol, color: suit.color, display: `${rank}${suit.symbol}` });
    });
  });
  deck.push({ rank: '7', suit: '♥', color: 'red', display: '7♥' });
  deck.push({ rank: '7', suit: '♠', color: 'black', display: '7♠' });
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

function sortHand(a, b) {
  const suitDiff = SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
  if (suitDiff !== 0) return suitDiff;
  return cardStrength(b) - cardStrength(a);
}

function renderNameInputs() {
  const selected = Number(playerCountSelect.value);
  const humanCount = selected === 1 ? 1 : 2;
  nameInputs.innerHTML = '';
  for (let i = 0; i < humanCount; i += 1) {
    const label = document.createElement('label');
    label.className = 'name-input';
    const defaultName = selected === 1 ? 'You' : `Player ${i + 1}`;
    label.textContent = selected === 1 ? 'Your Name' : `Player ${i + 1} Name`;
    const input = document.createElement('input');
    input.type = 'text';
    input.id = `nameInput${i}`;
    input.maxLength = 16;
    input.placeholder = defaultName;
    label.appendChild(input);
    nameInputs.appendChild(label);
  }
}

// --- Simple computer AI ---

function computeBestTrump(hand) {
  const counts = {};
  SUIT_ORDER.forEach((s) => { counts[s] = 0; });
  hand.forEach((c) => { counts[c.suit] += 1; });
  return SUIT_ORDER.reduce((best, s) => (counts[s] > counts[best] ? s : best), SUIT_ORDER[0]);
}

function computeBestCard(legal) {
  const byStrengthAsc = (a, b) => cardStrength(a) - cardStrength(b);

  if (trick.length === 0) {
    // Leading: play the lowest card to conserve strong cards.
    return legal.slice().sort(byStrengthAsc)[0];
  }

  const ledSuit = trick[0].card.suit;
  const trumps = trick.filter((t) => t.card.suit === trumpSuit);
  const pool = trumps.length ? trumps : trick.filter((t) => t.card.suit === ledSuit);
  const currentBest = pool.reduce((best, t) => (
    cardStrength(t.card) > cardStrength(best.card) ? t : best
  ), pool[0]);

  const winningCards = legal.filter((c) => {
    if (c.suit === currentBest.card.suit) return cardStrength(c) > cardStrength(currentBest.card);
    return c.suit === trumpSuit && currentBest.card.suit !== trumpSuit;
  });

  if (winningCards.length) {
    return winningCards.sort(byStrengthAsc)[0];
  }
  return legal.slice().sort(byStrengthAsc)[0];
}

function startMatch() {
  gameId += 1;
  const selected = Number(playerCountSelect.value);
  isSolo = selected === 1;
  const humanCount = isSolo ? 1 : 2;
  const names = [];
  for (let i = 0; i < humanCount; i += 1) {
    const input = document.getElementById(`nameInput${i}`);
    const typed = input ? input.value.trim() : '';
    names.push(typed || (isSolo ? 'You' : `Player ${i + 1}`));
  }
  if (isSolo) names.push('Computer');

  players = names.map((name, i) => ({ name, hand: [], tricksWon: 0, isComputer: isSolo && i === 1 }));
  cumulativeScore = [0, 0];
  roundIndex = 0;
  setupPanel.classList.add('hidden');
  gamePanel.classList.remove('hidden');
  startRound();
}

function startRound() {
  leaderIndex = roundIndex % SEAT_COUNT;
  targets = [0, 1].map((i) => (i === leaderIndex ? LEADER_TARGET : OTHER_TARGET));
  players.forEach((p) => { p.tricksWon = 0; p.hand = []; });
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
  for (let r = 0; r < LEADER_TARGET; r += 1) {
    for (let i = 0; i < SEAT_COUNT; i += 1) {
      players[i].hand.push(deck[cursor]);
      cursor += 1;
    }
  }
  pendingSecondDeal = deck.slice(cursor);
  players.forEach((p) => p.hand.sort(sortHand));

  renderStatusBoard();
  showTrumpGate();
}

function showTrumpGate() {
  phase = 'trump';
  trumpPanel.classList.add('hidden');
  handArea.classList.add('hidden');
  handGate.classList.add('hidden');
  const leader = players[leaderIndex];

  if (leader.isComputer) {
    turnBanner.textContent = `${leader.name} is choosing the Supreme Suit…`;
    const id = gameId;
    setTimeout(() => {
      if (id !== gameId) return;
      chooseTrump(computeBestTrump(leader.hand));
    }, 900);
    return;
  }

  if (isSolo) {
    revealTrumpHand();
    return;
  }

  handGate.classList.remove('hidden');
  gateText.textContent = `Pass the device to ${leader.name}`;
  turnBanner.textContent = `${leader.name} is choosing the Supreme Suit…`;
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
    el.className = `hand-card view-only${card.color === 'red' ? ' red-suit' : ''}`;
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
  let cursor = 0;
  for (let r = 0; r < OTHER_TARGET; r += 1) {
    for (let i = 0; i < SEAT_COUNT; i += 1) {
      players[i].hand.push(pendingSecondDeal[cursor]);
      cursor += 1;
    }
  }
  players.forEach((p) => p.hand.sort(sortHand));
  trick = [];
  renderStatusBoard();
  beginTrickTurn(leaderIndex);
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

  const player = players[index];
  if (player.isComputer) {
    handGate.classList.add('hidden');
    handArea.classList.add('hidden');
    turnBanner.textContent = `${player.name} is playing…`;
    const id = gameId;
    setTimeout(() => {
      if (id !== gameId) return;
      const legal = legalCardsFor(index);
      playCard(index, computeBestCard(legal));
    }, 900);
    return;
  }

  if (isSolo) {
    revealHand(index);
    return;
  }

  showHandGate(index);
}

function showHandGate(index) {
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
    btn.className = `hand-card${card.color === 'red' ? ' red-suit' : ''}`;
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

function resolveTrick() {
  const ledSuit = trick[0].card.suit;
  const trumps = trick.filter((t) => t.card.suit === trumpSuit);
  const pool = trumps.length ? trumps : trick.filter((t) => t.card.suit === ledSuit);
  const winningEntry = pool.reduce((best, t) => (
    cardStrength(t.card) > cardStrength(best.card) ? t : best
  ), pool[0]);

  const winner = players[winningEntry.index];
  winner.tricksWon += 1;
  turnBanner.textContent = `${winner.name} wins the hand!`;
  renderStatusBoard();

  const id = gameId;
  setTimeout(() => {
    if (id !== gameId) return;
    trick = [];
    renderTrickArea();
    if (winner.hand.length === 0) {
      endRound();
    } else {
      beginTrickTurn(winningEntry.index);
    }
  }, 1400);
}

function endRound() {
  phase = 'roundEnd';
  handGate.classList.add('hidden');
  handArea.classList.add('hidden');

  const rows = players.map((p, i) => {
    const diff = p.tricksWon - targets[i];
    cumulativeScore[i] += diff;
    return { name: p.name, target: targets[i], won: p.tricksWon, diff, total: cumulativeScore[i] };
  });

  roundSummary.innerHTML = rows.map((s) => `
    <div class="summary-row">
      <span>${s.name}</span>
      <span>${s.won}/${s.target}</span>
      <span class="${s.diff >= 0 ? 'plus' : 'minus'}">${s.diff >= 0 ? '+' + s.diff : s.diff}</span>
      <span class="summary-total">Total ${s.total >= 0 ? '+' + s.total : s.total}</span>
    </div>
  `).join('');

  roundEnd.classList.remove('hidden');
  turnBanner.textContent = 'Round complete';
  renderStatusBoard();
}

function renderStatusBoard() {
  statusBoard.innerHTML = players.map((p, i) => {
    const diff = p.tricksWon - (targets[i] ?? 0);
    const diffLabel = diff >= 0 ? `+${diff}` : `${diff}`;
    const isActive = i === currentTurnIndex && phase === 'play';
    const isLeader = i === leaderIndex;
    return `
      <div class="status-row${isActive ? ' active' : ''}">
        <span class="status-name">${p.name}${p.isComputer ? ' 🤖' : ''}${isLeader ? ' 👑' : ''}</span>
        <span class="status-target">Target ${targets[i] ?? '-'}</span>
        <span class="status-won">${p.tricksWon} won</span>
        <span class="status-diff ${diff >= 0 ? 'plus' : 'minus'}">${diffLabel}</span>
        <span class="status-total">Total ${cumulativeScore[i] >= 0 ? '+' + cumulativeScore[i] : cumulativeScore[i]}</span>
      </div>
    `;
  }).join('');
}

function renderTrickArea() {
  trickArea.innerHTML = players.map((p, i) => {
    const played = trick.find((t) => t.index === i);
    const card = played ? played.card : null;
    return `
      <div class="trick-slot">
        <div class="trick-name">${p.name}</div>
        ${card
          ? `<div class="trick-card${card.color === 'red' ? ' red-suit' : ''}"><span class="idx-rank">${card.rank}</span><span class="idx-suit">${card.suit}</span></div>`
          : '<div class="trick-card empty"></div>'}
      </div>
    `;
  }).join('');
}

function backToSetup() {
  trumpBadge.classList.add('hidden');
  gamePanel.classList.add('hidden');
  setupPanel.classList.remove('hidden');
}

function exitGame() {
  gameId += 1;
  backToSetup();
}

startBtn.addEventListener('click', startMatch);
exitBtn.addEventListener('click', exitGame);
playerCountSelect.addEventListener('change', renderNameInputs);
nextRoundBtn.addEventListener('click', () => {
  roundIndex += 1;
  startRound();
});
suitChoices.addEventListener('click', (event) => {
  const btn = event.target.closest('.suit-btn');
  if (!btn) return;
  chooseTrump(btn.dataset.suit);
});

renderNameInputs();
