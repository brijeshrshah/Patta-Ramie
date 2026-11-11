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
const resetCounterBtn = document.getElementById('resetCounterBtn');
const nextRoundBtn = document.getElementById('nextRoundBtn');

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
const PAIR_TARGET = 7;

let players = [];
let pairRoundsWon = [0, 0];
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

function sortHand(a, b) {
  const suitDiff = SUIT_ORDER.indexOf(a.suit) - SUIT_ORDER.indexOf(b.suit);
  if (suitDiff !== 0) return suitDiff;
  return cardStrength(b) - cardStrength(a);
}

function startMatch() {
  gameId += 1;
  const names = [0, 1, 2, 3].map((i) => {
    const input = document.getElementById(`nameInput${i}`);
    const typed = input ? input.value.trim() : '';
    return typed || `Player ${i + 1}`;
  });
  players = names.map((name) => ({ name, hand: [], tricksWon: 0 }));
  pairRoundsWon = [0, 0];
  roundIndex = 0;
  dealerIndex = SEAT_COUNT - 1;
  setupPanel.classList.add('hidden');
  gamePanel.classList.remove('hidden');
  startRound();
}

function startRound() {
  // The player after the dealer is dealt first, calls the Supreme Suit and leads.
  leaderIndex = (dealerIndex + 1) % SEAT_COUNT;
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

function pairOf(index) {
  return index % 2;
}

function pairName(pair) {
  return `${players[pair].name} & ${players[pair + 2].name}`;
}

function pairHands(pair) {
  return players[pair].tricksWon + players[pair + 2].tricksWon;
}

function endRound() {
  phase = 'roundEnd';
  handGate.classList.add('hidden');
  handArea.classList.add('hidden');

  const winningPair = pairHands(0) >= PAIR_TARGET ? 0 : 1;
  pairRoundsWon[winningPair] += 1;

  // The losing pair deals. The same dealer keeps dealing while their pair keeps losing;
  // when the other pair loses, the deal passes to the next seat (an opponent).
  const losingPair = 1 - winningPair;
  if (pairOf(dealerIndex) !== losingPair) {
    dealerIndex = (dealerIndex + 1) % SEAT_COUNT;
  }

  roundSummary.innerHTML = [0, 1].map((pair) => `
    <div class="summary-row">
      <span>${pairName(pair)}</span>
      <span>${pairHands(pair)}/${PAIR_TARGET}</span>
      <span class="${pair === winningPair ? 'plus' : 'minus'}">${pair === winningPair ? 'Won' : 'Lost'}</span>
      <span class="summary-total">Rounds ${pairRoundsWon[pair]}</span>
    </div>
  `).join('');

  roundEnd.classList.remove('hidden');
  turnBanner.textContent = `${pairName(winningPair)} win the round!`;
  nextDealerNote.textContent = `${players[dealerIndex].name} deals next.`;
  renderStatusBoard();
}

function renderStatusBoard() {
  statusBoard.innerHTML = [0, 1].map((pair) => {
    const hands = pairHands(pair);
    const isActive = phase === 'play' && pairOf(currentTurnIndex) === pair;
    const hasLeader = pairOf(leaderIndex) === pair;
    return `
      <div class="status-row${isActive ? ' active' : ''}">
        <span class="status-name">${pairName(pair)}${hasLeader ? ' 👑' : ''}${pairOf(dealerIndex) === pair ? ' 🃏' : ''}</span>
        <span class="status-target">Target ${PAIR_TARGET}</span>
        <span class="status-won">${hands} won</span>
        <span class="status-diff ${hands >= PAIR_TARGET ? 'plus' : 'minus'}">${hands >= PAIR_TARGET ? 'Safe' : `${PAIR_TARGET - hands} to go`}</span>
        <span class="status-total">Rounds ${pairRoundsWon[pair]}</span>
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
resetCounterBtn.addEventListener('click', () => {
  pairRoundsWon = [0, 0];
  renderStatusBoard();
  const rows = roundSummary.querySelectorAll('.summary-total');
  rows.forEach((el) => { el.textContent = 'Rounds 0'; });
});
nextRoundBtn.addEventListener('click', () => {
  roundIndex += 1;
  startRound();
});
suitChoices.addEventListener('click', (event) => {
  const btn = event.target.closest('.suit-btn');
  if (!btn) return;
  chooseTrump(btn.dataset.suit);
});
