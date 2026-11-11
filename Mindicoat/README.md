# Mindicoat

A browser-based, pass-and-play partnership trump trick-taking card game for exactly 4 players, played with a full 52-card deck. All rules are the same as [Satyu](../Satyu/README.md) (teams, deal, Supreme Suit, following suit, card ranking) — only the way a round is won is different: the **10s ("Mindis")** are what matter. Built with HTML, CSS, and JavaScript.

Part of the [Patta Ramie](../README.md) app — open `../index.html` and pick Mindicoat from the game selection screen.

## Same as Satyu

- Full 52-card deck; rank order, weakest to strongest: 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K, A.
- Opposite players are partners: Player 1 & Player 3 vs. Player 2 & Player 4.
- 5 cards dealt first, the first player declares the Supreme Suit (trump), then 4 + 4 more — 13 cards each.
- Must follow the led suit if able; highest Supreme Suit card wins the hand, otherwise the highest card of the led suit. Winner leads next.

## Playing against the computer

By default you are **Player 1** and Players 2–4 are played by the computer, so there's no passing the device — your hand is always on screen (the computer's turns show "is thinking…"). Player 2–4 names are optional (default "Computer 2/3/4"). Untick **Play against the computer** on the setup screen for 4-person pass-and-play.

The computer picks the Supreme Suit from its strongest/longest suit, leads Aces, wins hands with the cheapest card that beats the current winner, feeds a 10 to its partner only when the partner's win is safe, and avoids giving 10s to opponents.

## Table layout

Players sit around an oval table: Player 1 at the bottom, Player 2 left, Player 3 (your partner) across the top, Player 4 right. Each played card appears in front of its player, and the player whose turn it is glows. Two team panels show the **Mindi counter**: the four 10s (♥ ♣ ♦ ♠) light up with a 1 as the pair collects them, plus the pair's hands won this round on a card-back.

## Winning a round

- Whoever wins a hand collects every **10 (Mindi)** played in it for their pair. 10s are highlighted in gold.
- A pair holding **3 Mindis has won the round**, but play continues until the **4th Mindi** is collected.
  - If the same pair also gets the 4th, it's a **Master win** (tracked separately, shown as ★ / "Master").
  - If the opponents get the 4th, it's a normal 3–1 win and the round ends there.
- If the Mindis split **2–2**, the round plays out all 13 hands and the pair with **7 or more hands** wins.
- The scoreboard shows Mindis as `x/4`.
- **↻ Restart** redeals the current round with a new shuffle (score kept). **↺ Reset Score** (under the table) sets every pair's rounds and Master wins back to zero.

## Dealing

The losing pair **distributes the cards** next round: the same dealer keeps dealing while their pair keeps losing; when the other pair loses, the deal passes to the next seat (an opponent). Round 1 is dealt by Player 4, so Player 1 starts.

## Files

- `index.html`, `styles.css`, `script.js`
