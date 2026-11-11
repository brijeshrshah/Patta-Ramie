const setupPanel = document.getElementById('setupPanel');
const gamePanel = document.getElementById('gamePanel');
const playerCountSelect = document.getElementById('playerCount');
const matchRuleSelect = document.getElementById('matchRule');
const nameInputs = document.getElementById('nameInputs');
const startBtn = document.getElementById('startBtn');
const exitBtn = document.getElementById('exitBtn');
const turnBanner = document.getElementById('turnBanner');
const tableRing = document.getElementById('tableRing');
const openCross = document.getElementById('openCross');
const pileCount = document.getElementById('pileCount');
const logList = document.getElementById('log');
const winnerBanner = document.getElementById('winnerBanner');
const newGameBtn = document.getElementById('newGameBtn');

const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const suits = [
  { symbol: '♠', color: 'black' },
  { symbol: '♥', color: 'red' },
  { symbol: '♦', color: 'red' },
  { symbol: '♣', color: 'black' },
];

// Angles are degrees clockwise from top (0 = top, 90 = right, 180 = bottom, 270 = left).
const SEAT_ANGLES = {
  2: [270, 90],         // left, right
  3: [0, 120, 240],      // top, bottom-right, bottom-left
  4: [180, 90, 0, 270],  // bottom, right, top, left
};

let players = [];
let centerPile = [];
let currentPlayerIndex = 0;
let gameOver = false;
let pendingWinIndex = null;
let matchRule = 'either';
let gameId = 0;

function createDeck() {
  const deck = [];
  suits.forEach((suit) => {
    ranks.forEach((rank) => {
      deck.push({
        rank,
        suit: suit.symbol,
        color: suit.color,
        display: `${rank}${suit.symbol}`,
      });
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

function dealCards(playerCount) {
  const deck = shuffle(createDeck());
  const base = Math.floor(deck.length / playerCount);
  const remainder = deck.length % playerCount;
  const hands = [];
  let cursor = 0;
  for (let i = 0; i < playerCount; i += 1) {
    const size = base + (i < remainder ? 1 : 0);
    hands.push(deck.slice(cursor, cursor + size));
    cursor += size;
  }
  return hands;
}

function renderNameInputs() {
  const selected = Number(playerCountSelect.value);
  const humanCount = selected === 1 ? 1 : selected;
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

function setupPlayers() {
  const selected = Number(playerCountSelect.value);
  const totalPlayers = selected === 1 ? 2 : selected;
  const hands = dealCards(totalPlayers);
  players = hands.map((hand, index) => {
    const isComputer = selected === 1 && index === 1;
    let name;
    if (isComputer) {
      name = 'Computer';
    } else {
      const input = document.getElementById(`nameInput${index}`);
      const typed = input ? input.value.trim() : '';
      name = typed || (selected === 1 ? 'You' : `Player ${index + 1}`);
    }
    return { name, isComputer, hand, openCard: null };
  });
}

function addLog(message) {
  const item = document.createElement('li');
  item.textContent = message;
  logList.prepend(item);
}

function attemptFlip(index) {
  if (gameOver || pendingWinIndex !== null) return;
  if (index !== currentPlayerIndex) return;
  if (players[index].isComputer) return;
  playTurn(index);
}

function attemptCollect(index) {
  if (gameOver || pendingWinIndex !== index) return;
  if (players[index].isComputer) return;
  claimPile(index);
}

function seatAngles() {
  return SEAT_ANGLES[players.length] || SEAT_ANGLES[4];
}

function offsetFor(angleDeg, radius) {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    dx: radius * Math.sin(rad),
    dy: -radius * Math.cos(rad),
  };
}

function renderPlayers() {
  const angles = seatAngles();
  const seatRadius = Math.min(tableRing.clientWidth, tableRing.clientHeight) * 0.42 || 180;

  tableRing.querySelectorAll('.seat').forEach((el) => el.remove());

  players.forEach((player, index) => {
    const isTurn = index === currentPlayerIndex && !gameOver && pendingWinIndex === null;
    const isActive = index === currentPlayerIndex && !gameOver;
    const isWinner = pendingWinIndex === index;
    const { dx, dy } = offsetFor(angles[index], seatRadius);

    const seat = document.createElement('div');
    seat.className = 'seat';
    seat.style.transform = `translate(-50%, -50%) translate(${dx}px, ${dy}px)`;

    const card = document.createElement('div');
    card.className = `player-card${isActive ? ' active' : ''}`;
    card.innerHTML = `
      <div class="player-name">${player.name}${player.isComputer ? ' 🤖' : ''}</div>
      <div class="card-back-mini"></div>
      <div class="player-count">${player.hand.length} card${player.hand.length === 1 ? '' : 's'}</div>
    `;

    const actionButton = document.createElement('button');
    if (isWinner) {
      actionButton.className = 'mini-flip-btn collect';
      if (player.isComputer) {
        actionButton.textContent = 'Collecting…';
        actionButton.disabled = true;
      } else {
        actionButton.textContent = 'Collect Cards';
        actionButton.disabled = false;
        actionButton.addEventListener('click', () => attemptCollect(index));
      }
    } else if (player.isComputer) {
      actionButton.className = 'mini-flip-btn';
      actionButton.textContent = 'Computer (auto)';
      actionButton.disabled = true;
    } else {
      actionButton.className = 'mini-flip-btn';
      actionButton.textContent = 'Flip Card';
      actionButton.disabled = !isTurn;
      actionButton.addEventListener('click', () => attemptFlip(index));
    }
    card.appendChild(actionButton);

    seat.appendChild(card);
    tableRing.appendChild(seat);
  });
}

function renderTable() {
  const angles = seatAngles();
  const cardRadius = Math.min(openCross.clientWidth, openCross.clientHeight) * 0.18 || 32;

  openCross.innerHTML = '';

  const openEntries = players
    .map((player, index) => ({ player, index }))
    .filter((entry) => entry.player.openCard)
    .sort((a, b) => centerPile.indexOf(a.player.openCard) - centerPile.indexOf(b.player.openCard));

  openEntries.forEach(({ player, index }) => {
    const angle = angles[index];
    const { dx, dy } = offsetFor(angle, cardRadius);
    const el = document.createElement('div');
    el.className = `open-card${player.openCard.color === 'red' ? ' red-suit' : ''}`;
    el.style.transform = `translate(${dx}px, ${dy}px) rotate(${angle}deg)`;
    el.innerHTML = `
      <div class="card-index top">
        <span class="idx-rank">${player.openCard.rank}</span>
        <span class="idx-suit">${player.openCard.suit}</span>
      </div>
      <div class="card-center-suit">${player.openCard.suit}</div>
      <div class="card-index bottom">
        <span class="idx-rank">${player.openCard.rank}</span>
        <span class="idx-suit">${player.openCard.suit}</span>
      </div>
    `;
    openCross.appendChild(el);
  });
  pileCount.textContent = centerPile.length === 0
    ? 'Table is empty'
    : `${centerPile.length} card${centerPile.length === 1 ? '' : 's'} on the table`;
}

function beginTurn(index) {
  currentPlayerIndex = index;
  turnBanner.textContent = `${players[currentPlayerIndex].name}'s turn`;
  renderPlayers();
  const player = players[currentPlayerIndex];
  if (player.isComputer) {
    const id = gameId;
    setTimeout(() => {
      if (id === gameId) playTurn(index);
    }, 900);
  }
}

function showWinBanner(index) {
  pendingWinIndex = index;
  const player = players[index];
  turnBanner.textContent = `${player.name} matched! Collecting the table…`;
  renderPlayers();
  if (player.isComputer) {
    const id = gameId;
    setTimeout(() => {
      if (id === gameId) claimPile(index);
    }, 900);
  }
}

function claimPile(index) {
  if (gameOver) return;
  pendingWinIndex = null;
  const player = players[index];
  player.hand.push(...centerPile);
  centerPile = [];
  players.forEach((p) => { p.openCard = null; });
  renderTable();
  renderPlayers();
  beginTurn(index);
}

function endGame(emptyHandedPlayer) {
  gameOver = true;
  const winner = players.reduce((best, p) => (p.hand.length > best.hand.length ? p : best), players[0]);
  winnerBanner.textContent = `${emptyHandedPlayer.name}'s hand is empty — game over! ${winner.name} wins with ${winner.hand.length} card${winner.hand.length === 1 ? '' : 's'}.`;
  winnerBanner.classList.remove('hidden');
  turnBanner.textContent = 'Game over';
  newGameBtn.classList.remove('hidden');
  renderPlayers();
  addLog(`${emptyHandedPlayer.name} is out of cards. ${winner.name} wins!`);
}

function playTurn(index) {
  if (gameOver) return;
  const player = players[index];
  const flippedCard = player.hand.shift();
  player.openCard = flippedCard;

  if (centerPile.length === 0) {
    centerPile.push(flippedCard);
    renderTable();
    renderPlayers();
    addLog(`${player.name} flips ${flippedCard.display} to start the table.`);
    if (player.hand.length === 0) {
      endGame(player);
      return;
    }
    beginTurn((index + 1) % players.length);
    return;
  }

  const prev = centerPile[centerPile.length - 1];
  const rankMatch = flippedCard.rank === prev.rank;
  const suitMatch = flippedCard.suit === prev.suit;
  let isMatch;
  if (matchRule === 'number') {
    isMatch = rankMatch;
  } else if (matchRule === 'suit') {
    isMatch = suitMatch;
  } else {
    isMatch = rankMatch || suitMatch;
  }

  centerPile.push(flippedCard);
  renderTable();
  renderPlayers();

  if (isMatch) {
    let matchLabel;
    if (rankMatch && suitMatch) matchLabel = 'number and suit';
    else if (rankMatch) matchLabel = 'number';
    else matchLabel = 'suit';
    addLog(`${player.name} flips ${flippedCard.display} — matches by ${matchLabel}!`);
    showWinBanner(index);
    return;
  }

  addLog(`${player.name} flips ${flippedCard.display} — no match.`);
  if (player.hand.length === 0) {
    endGame(player);
    return;
  }
  beginTurn((index + 1) % players.length);
}

function startGame() {
  gameId += 1;
  matchRule = matchRuleSelect.value;
  setupPlayers();
  centerPile = [];
  currentPlayerIndex = 0;
  gameOver = false;
  pendingWinIndex = null;
  logList.innerHTML = '';
  winnerBanner.classList.add('hidden');
  newGameBtn.classList.add('hidden');
  setupPanel.classList.add('hidden');
  gamePanel.classList.remove('hidden');
  renderTable();
  renderPlayers();
  beginTurn(0);
}

function backToSetup() {
  gamePanel.classList.add('hidden');
  setupPanel.classList.remove('hidden');
}

function exitGame() {
  gameId += 1;
  gameOver = true;
  backToSetup();
}

startBtn.addEventListener('click', startGame);
newGameBtn.addEventListener('click', backToSetup);
exitBtn.addEventListener('click', exitGame);
playerCountSelect.addEventListener('change', renderNameInputs);

renderNameInputs();
