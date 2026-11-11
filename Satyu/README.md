# Satyu

A browser-based, pass-and-play partnership trump trick-taking card game for exactly 4 players, played with a full 52-card deck. Same trump-and-follow-suit rules as [DoTinPanch](../DoTinPanch/README.md). Built with HTML, CSS, and JavaScript.

Part of the [Patta Ramie](../README.md) app — open `../index.html` and pick Satyu from the game selection screen.

## Deck

All 52 cards. Rank order, weakest to strongest: 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A.

## Teams

Four players sit around the device; **opposite players are partners**: Player 1 & Player 3 vs. Player 2 & Player 4. Hands won by either partner count for the pair.

## Setup and deal

1. Enter the four names and tap **Start Game**.
2. Each round, **5 cards** are dealt to each player first. The player dealt first (the one after the **dealer** 🃏, also the round's **leader** 👑) privately reveals their 5 cards and declares the **Supreme Suit** (trump) openly for the round.
3. Then **4 more** cards are dealt to each player, then **4 more** — 13 cards each.
4. **Who deals:** the pair that made fewer than 7 hands deals the next round. The same dealer keeps dealing while their pair keeps losing; when the other pair loses, the deal passes to the next seat (an opponent). Round 1 is dealt by Player 4, so Player 1 starts.

## Playing a hand (trick)

1. The leader plays any card; play passes to the next player in turn.
2. Each player must **follow the led suit** if able; otherwise they may play any card, including Supreme Suit.
3. The highest Supreme Suit card wins the hand; if none was played, the highest card of the led suit wins.
4. The winner of a hand leads the next one, until all 13 hands are played.
5. A hand-reveal gate keeps each player's cards private between turns.

## Scoring

- A pair must win **at least 7 of the 13 hands** to win the round (exactly one pair always does).
- Rounds won by each pair are totalled until you tap **Reset Win Counter**.
- The status board shows each pair's hands won this round and rounds won so far.
- Tap **Start Next Round** to reshuffle, and redeal.

## Files

- `index.html`, `styles.css`, `script.js`
