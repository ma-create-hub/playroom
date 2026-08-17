# 🀄 Learn American Mah Jongg

A self-contained web app for learning **American mah jongg** — the National Mah
Jongg League (NMJL) game, not the Chinese one. Nine lessons, a full tile
reference, an interactive card-notation decoder, five drills, and a simplified
four-player practice table with three bots.

No server, no build step, no dependencies. Open `index.html` and it runs.

---

## What's in it

**Learn** — nine short lessons, in order, with a progress tracker:

1. What makes it "American"
2. The 152 tiles
3. Setting up and dealing
4. The Charleston
5. Reading the card
6. Playing a turn
7. Jokers
8. Winning, dead hands, wall games
9. Etiquette and table talk

**Tiles** — all 36 distinct tiles drawn as SVG (bams, craks, dots, winds,
dragons, flower, joker). Click one for its table name and what to know about it.
Corner labels can be turned off to self-test.

**The Card** — the notation key plus 31 practice hands in real card notation.
Expand any line to see it dealt out as actual tiles, and swap which suit plays
each colour to watch the hand change. Illegal readings (two colours in the same
suit) are rejected, because that is the rule beginners break most.

**Drills** — scored, with streak tracking saved between visits:

| Drill | What it trains |
|---|---|
| Name that tile | Tile recognition without corner labels |
| Rules quiz | 22 questions across the whole rulebook |
| Card notation | Joker legality, suit/colour rules, `C` vs `X`, which dragon a `D` means |
| Which hand am I closest to? | Reading a rack against the card |
| Charleston: what do I pass? | Choosing three tiles to give away, graded against the engine |

**Practice Table** — a simplified game against three bots: full Charleston
(right/across/left, the optional second Charleston, the courtesy pass), draw and
discard, claiming discards for exposures, mah jongg, wall games, and the correct
self-pick vs discarder payouts. A side panel ranks your best lines live and shows
exactly which tiles each still needs.

**Glossary** — every term you'll hear at a table, filterable.

---

## About the hands in this app

The National Mah Jongg League publishes a **new card every year**, and it is the
only legal source of hands — buy the current one at
[nationalmahjonggleague.org](https://www.nationalmahjonggleague.org).

The 31 hands in this app are **generic practice patterns** written in the same
notation, invented for teaching. They exist so the drills and the practice table
have something to match against and so you can learn to read a line. They are not
a copy of the card, and you cannot play a real game from them.

Everything else — the rules, the Charleston, joker law, claiming, scoring — is
the real game.

## Running it

Double-click `index.html`, or serve the folder over HTTP. Lesson progress and
drill scores are stored in your browser's `localStorage`, per device.

If the repository is published with GitHub Pages, the app lives at
`https://<your-username>.github.io/playroom/mahjong/`.

## Files

| File | Contents |
|---|---|
| `index.html` | Page shell and tab structure |
| `styles.css` | All styling |
| `engine.js` | Tiles, SVG tile art, practice hand patterns, and the hand-matching engine |
| `content.js` | Lesson text, glossary, rules quiz bank |
| `app.js` | Views, drills, and the practice table |

The hand matcher in `engine.js` is the core: it takes a rack and a card line,
tries every legal reading of that line (which number, which suit plays which
colour), applies joker rules correctly (3+ groups only), and returns how many of
the 14 tiles you already hold and which are missing. Everything else — the
advisor panel, the drills, the bots' discard choices — is built on it.

## House rules and simplifications

Where real tables differ (who deals after a wall game, jokerless bonuses), the
lessons say so rather than pretending there is one answer. The practice table
lists its own simplifications at the bottom of the screen — chiefly that you are
always East, joker exchange is not implemented, and hands are never declared dead.
