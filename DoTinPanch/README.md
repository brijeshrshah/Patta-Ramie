# DoTinPanch

A browser-based, pass-and-play trump trick-taking card game for exactly 3 players, inspired by Coat / Court Piece ("Hide the Trump"), adapted to 3 seats with a reduced deck and an open (not hidden) trump call. Built with HTML, CSS, and JavaScript.

Part of the [Patta Ramie](../README.md) app — open `../index.html` (or the installed Patta Ramie app) and pick DoTinPanch from the game selection screen.

## Deck

30 cards: A, K, Q, J, 10, 9, 8 in all four suits (28 cards), plus the 7 of Hearts and the 7 of Spades (2 cards). Clubs and Diamonds have no 7. Rank order, weakest to strongest: 7, 8, 9, 10, J, Q, K, A.

## Setup

1. Enter names for all 3 players and tap **Start Game**.
2. Each round, seats rotate through three roles:
   - **Target 5** — the round's dealer-adjacent lead role: declares the Supreme Suit (trump) and leads the first hand.
   - **Target 3**
   - **Target 2** — deals the cards that round.
   
   Round 1: Player 1 → 5, Player 2 → 3, Player 3 → 2 (and deals). Round 2: Player 2 → 5, Player 3 → 3, Player 1 → 2 (and deals). The roles keep rotating one seat every round.
3. Each player is dealt 5 cards. The player targeting 5 that round privately reveals their own 5 cards (device passed to them via a hand-reveal gate) to decide, then declares the **Supreme Suit** openly — the suit itself is announced to everyone, only the cards behind the decision stay private. The remaining 5 cards are then dealt to each player, for 10 cards per hand.

## Playing a hand (trick)

1. The lead player plays any card. The device is then passed to the next player.
2. Each player must **follow the led suit** if they hold a card of it; if not, they may play any card, including a Supreme Suit card.
3. Whoever plays the highest Supreme Suit card wins the hand; if no one plays Supreme Suit, the highest card of the led suit wins.
4. The winner of a hand leads the next one. This repeats until all 10 hands in the round are played.
5. A **hand-reveal gate** ("Pass the device to Player X — tap to reveal hand") keeps each player's cards private from the others between turns on the shared device.

## Scoring

- Each player's goal is to win *at least* their target number of hands for the round (5, 3, or 2).
- The live status board shows each player's target, hands won so far, and a running +/- (hands won minus target).
- At the end of a round, each player's final +/- is added to their running match total, shown on the status board and in the round summary.
- Tap **Start Next Round** to rotate roles, reshuffle, and redeal.

## Installing on your phone

See the [Patta Ramie README](../README.md) — the whole app (all games) installs as a single home-screen PWA.

## Files

- `index.html` — game layout and structure
- `styles.css` — visual design and layout
- `script.js` — game logic (dealing, trump, trick play, scoring)
