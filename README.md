# Patta Ramie

A collection of browser-based, pass-and-play card games for one shared device. Built with HTML, CSS, and JavaScript. Installable as a single home-screen app (PWA) on your phone — opening it shows a game selection screen.

## Games

- [Dhaglabaji](Dhaglabaji/README.md) — flip & match, collect the whole table with a matching number or suit. 2–4 players (or solo vs. computer).
- [DoTinPanch](DoTinPanch/README.md) — trump trick-taking with rotating hand targets. 3 players.
- [SattiAththi](SattiAththi/README.md) — DoTinPanch rules for 2 players (targets 7 and 8), solo vs. computer available.
- [Satyu](Satyu/README.md) — partnership trump trick-taking with a full 52-card deck. 4 players in 2 pairs.
- [Mindicoat](Mindicoat/README.md) — Satyu rules, but collecting the 10s (Mindis) decides the round: 3 Mindis wins (all 4 is a Master win), a 2–2 split goes to the pair with 7+ hands. 4 players in 2 pairs — you vs. the computer by default, or 4-person pass-and-play.

Each game lives in its own folder as a self-contained page (`index.html`/`styles.css`/`script.js`) linked from the root game selection screen, with a "← Back to Games" link to return.

## Installing on your phone

This is a static site with no backend, so getting the install prompt and offline support (manifest + service worker) requires it to be served over `http(s)://` — opening `index.html` directly from a file browser (`file://`) won't offer "Add to Home Screen" with the custom icon on most phones.

1. **Get it reachable by your phone**, either:
   - Quick/local: run a tiny server from this folder (e.g. `python3 -m http.server 8000`) and, with your phone on the same Wi-Fi as this computer, visit `http://<this-computer's-LAN-IP>:8000` in your phone's browser.
   - Permanent: push this folder to any static host (GitHub Pages, Netlify, Vercel, etc.) and visit that URL from your phone.
2. **Install it**: in Chrome (Android) open the ⋮ menu → "Add to Home Screen"; in Safari (iOS) tap Share → "Add to Home Screen". The "Patta Ramie" icon appears on your home screen and opens full-screen, without browser chrome, straight to the game selection screen.
3. Once installed, the service worker (`sw.js`) caches every game's files so the whole app keeps working offline after the first load.

## Adding a new game

1. Create a new folder at the root (e.g. `NewGame/`) with its own `index.html`, `styles.css`, and `script.js`.
2. In that folder's `index.html`, drop the standalone PWA meta tags (manifest link, apple/mobile-web-app meta) — only the root `index.html` needs those — and add a `← Back to Games` link (`<a class="back-link" href="../index.html">`) pointing back to the root, plus a matching `.back-link` rule in its `styles.css`.
3. Reference shared icons via `../icons/...` if needed.
4. Add a `.game-card` link to it from the root `index.html`.
5. Add its files to the `ASSETS` list in the root `sw.js` so it's cached for offline use.

## Files

- `index.html` — game selection screen
- `styles.css` — selection screen visual design
- `script.js` — service worker registration
- `manifest.json` — PWA metadata (name, icons, theme color) used for home-screen install
- `sw.js` — service worker that caches the whole app (all games) for offline use
- `icons/` — shared app icons (`icon-192.png`, `icon-512.png`, `icon-180.png` for iOS, `favicon-32.png`, plus the editable `icon-source.svg`)
- `Dhaglabaji/`, `DoTinPanch/`, `SattiAththi/`, `Satyu/`, `Mindicoat/` — individual game folders
