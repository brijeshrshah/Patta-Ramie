# SattiAththi

A browser-based trump trick-taking card game for exactly 2 players (or solo vs. a computer opponent) — the same rules as [DoTinPanch](../DoTinPanch/README.md), adapted from 3 seats down to 2. Built with HTML, CSS, and JavaScript.

Part of the [Patta Ramie](../README.md) app — open `../index.html` (or the installed Patta Ramie app) and pick SattiAththi from the game selection screen.

## Deck

Same 30-card deck as DoTinPanch: A, K, Q, J, 10, 9, 8 in all four suits (28 cards), plus the 7 of Hearts and the 7 of Spades (2 cards). Clubs and Diamonds have no 7. Rank order, weakest to strongest: 7, 8, 9, 10, J, Q, K, A.

## Setup

1. Choose 1 player (you vs. the computer) or 2 players, enter names, and tap **Start Game**.
2. Each round, the two seats take one of two roles, named after the game: **Satt** (7) and **Aath** (8) — 7 + 8 = 15, one full half of the 30-card deck each.
   - The **Target 8** seat declares the Supreme Suit (trump) and leads the first hand.
   - The **Target 7** seat has no special role that round.
   - Roles swap every round: whoever was Target 7 becomes Target 8 next round, and vice versa.
3. Each player is dealt 8 cards. The Target 8 player privately reveals their own 8 cards (device passed to them via a hand-reveal gate, skipped in solo mode) to decide, then declares the **Supreme Suit** openly — the suit itself is announced, only the cards behind the decision stay private. The remaining 7 cards are then dealt to each player, for 15 cards per hand.

## Playing a hand (trick)

1. The Target 8 player leads the first hand by playing any card. The device is then passed to the other player.
2. The other player must **follow the led suit** if they hold a card of it; if not, they may play any card, including a Supreme Suit card.
3. Whoever plays the highest Supreme Suit card wins the hand; if no one plays Supreme Suit, the highest card of the led suit wins.
4. The winner of a hand leads the next one. This repeats until all 15 hands in the round are played.
5. A **hand-reveal gate** ("Pass the device to Player X — tap to reveal hand") keeps each player's cards private from the other on a shared device — skipped entirely in solo mode, since the same person is always at the device.

## Scoring

- Each player's goal is to win *at least* their target number of hands for the round (8 or 7).
- The live status board shows each player's target, hands won so far, and a running +/- (hands won minus target).
- At the end of a round, each player's final +/- is added to their running match total.
- Tap **Start Next Round** to swap roles, reshuffle, and redeal.

## Computer opponent

In solo mode, the computer has no card-selection help visible to you (its hand stays hidden, same as a human opponent would). Its play is a simple heuristic: when declaring trump, it picks the suit it holds the most cards of; when playing a card, it plays the cheapest card that wins the trick if one exists, otherwise it plays its lowest card to conserve stronger ones. It plays automatically with a short delay for pacing.

## Installing on your phone

See the [Patta Ramie README](../README.md) — the whole app (all games) installs as a single home-screen PWA.

## Files

- `index.html` — game layout and structure
- `styles.css` — visual design and layout
- `script.js` — game logic (dealing, trump, trick play, scoring, computer AI)
