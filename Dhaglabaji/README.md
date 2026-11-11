# Dhaglabaji

A browser-based, pass-and-play card collecting game for 2–4 players (or solo vs. a computer opponent), built with HTML, CSS, and JavaScript.

Part of the [Patta Ramie](../README.md) app — open `../index.html` (or the installed Patta Ramie app) and pick Dhaglabaji from the game selection screen.

## Rules

1. Before starting, pick the number of players (1–4), a **Match Rule**: Number only, Suit only, or Number or Suit (either), and optionally type a name for each human player (blank falls back to "Player N", or "You" in solo mode). Picking 1 player starts a 2-player game where the second seat is played by the computer. A standard 52-card deck is shuffled and dealt as evenly as possible across all players.
2. Each player has their own **Flip Card** button on their seat, which only activates on their turn. Flipping sends the card into the pinwheel in the middle of the table.
3. If a flipped card matches the **immediately preceding** card played by number/rank (e.g. 7 matches 7), by exact suit (spade↔spade, heart↔heart, diamond↔diamond, club↔club), or either — depending on the chosen Match Rule — that player's own seat button turns into **Collect Cards**. Clicking it sweeps every card on the table into their hand.
4. A player who just collected the table immediately flips again (their button reverts to Flip Card) to start a fresh round; otherwise the turn passes to the next player.
5. The moment any player's hand is completely empty, the game ends immediately. The player holding the most cards at that point wins.
6. An **Exit to Home** button is always available during a game to abandon the current game and return to the setup screen.

## Layout

- Seating depends on player count: 2 players sit left/right, 3 players are spaced 120° apart around the table, and 4 players are spaced 90° apart (bottom, right, top, left). Each seat also shows a small blue diamond-patterned card back representing that player's hand. Seats have no background box — the current player's name is highlighted in accent color instead — and sit far enough out that a seat's Flip/Collect button never overlaps the pinwheel in the middle.
- Each player's open card appears in a pinwheel in the center, rotated to face outward from its player's seat, sized at 70% of a normal card. Cards are styled like real playing cards: white face, a rank/suit index in the top-left corner (and a mirrored one in the bottom-right, as on a physical card), and a large suit glyph in the center. The top-left index sits on the edge that ends up facing outward after rotation, so it stays readable even where two cards overlap near the center.
- The most recently played card always renders on top of the pinwheel, regardless of which seat played it.

## Installing on your phone

See the [Patta Ramie README](../README.md) — the whole app (all games) installs as a single home-screen PWA.

## Files

- `index.html` — game layout and structure
- `styles.css` — visual design and layout
- `script.js` — game logic, turn handling

## Notes

- The computer opponent has no strategic choices to make (there's no card selection in this game — just flipping the top card), so it plays automatically with a short delay for pacing, and auto-collects when it matches. Its seat button reads "Computer (auto)" and is always disabled.
- With 2+ human players, everyone shares one device — each player's own Flip Card button only enables on their turn, so it's clear whose turn it is even without a shared button.
- Cards are dealt as evenly as possible; if 52 doesn't divide evenly among the chosen player count, the first few players dealt get one extra card.
- Custom names are used everywhere a player is referenced: seat labels, the turn banner, the activity log, and the game-over message.
