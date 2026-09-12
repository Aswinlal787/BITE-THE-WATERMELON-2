# 🍉 Bite the Watermelon — Remix Edition

A playful 2-player relationship self-reflection game. Players answer everyday
situations without knowing what their answers are actually measuring — until
the watermelon is bitten open at the end.

This is a **from-scratch, single front-end reimagining** of
[`AthulKrishna56/BITE-THE-WATERMELON`](https://github.com/AthulKrishna56/BITE-THE-WATERMELON):
the original game's 10 scenarios and its hidden scoring formulas (green/red
score, sweetness, seeds, bitter seed score, personality types, and player
comparison) are ported over faithfully, but the stack, UI, and presentation
are entirely different:

- **No build step, no backend.** The original was a FastAPI + React +
  PyWebView desktop app. This version is a single static site (HTML/CSS/
  vanilla JS) — open `index.html` and it just works, no `pip install`,
  `npm install`, or Vite build required.
- **New visual identity.** A dark "watermelon rind" theme (deep green +
  juicy pink/lime), Fredoka + Manrope type, and a game-stage layout instead
  of a generic card grid.
- **Floating watermelon seeds.** A lightweight canvas animation drifts real
  seed shapes across the background the whole time you play (respects
  `prefers-reduced-motion`).
- **Soft background music, with zero audio files.** An ambient pad loop is
  generated at runtime with the Web Audio API, so there's nothing to
  download, license, or go stale — just tap the speaker icon.
- **A single hero animation.** When both players finish, one watermelon
  "crack open" moment reveals the results, instead of scattered hover
  effects everywhere.

> "You don't know what the question is testing... until you bite the
> watermelon." 🍉

---

## How it works

1. Two players enter nicknames.
2. Player 1 answers 10 short scenarios, one at a time (message left on
   read, a small argument, a forgotten birthday, etc.).
3. The phone is handed off, and Player 2 answers the same 10 scenarios.
4. Behind the scenes, every choice quietly contributes to hidden metrics:
   trust, communication, empathy, sweetness, maturity, patience,
   boundaries, independence, humor, accountability, ego, jealousy,
   overthinking, and resentment.
5. Some choices also plant a **seed** — a small recurring habit
   (`Overthinking`, `Silent Resentment`, `Ego`, `Grudge Collector`, …).
   Seeds pile up into a **bitter seed score**.
6. Both players get a **Watermelon Personality** (e.g. `PURE WATERMELON 🍉`,
   `SEED COLLECTOR 🌱😂`, `TRUST MELON 🤝🍉`), a full metrics breakdown, and
   a side-by-side comparison of where they differ.

The scoring is entirely deterministic — no AI calls, no network requests.
Everything runs client-side.

---

## Run it

No install required:

```bash
# just open the file
open index.html        # macOS
xdg-open index.html     # Linux
start index.html        # Windows
```

Or serve it locally (recommended, avoids any `file://` quirks with fonts):

```bash
npm start
# or
npx serve .
```

Then visit the printed local URL (typically `http://localhost:3000`).

### Deploying

This is a static site — it deploys as-is to **GitHub Pages**, Netlify,
Vercel, or any static host. For GitHub Pages: push this repo, then enable
Pages on the `main` branch (root folder) in the repo settings.

---

## Project structure

```
bite-the-watermelon/
├── index.html       # page shell, loads all scripts
├── style.css         # design tokens + all styling
├── questions.js       # the 10-question bank (ported from questions.py)
├── scoring.js          # scoring engine (ported from scoring.py)
├── audio.js             # generative ambient background music (Web Audio API)
├── seeds-bg.js            # floating watermelon-seed canvas background
├── app.js                  # UI state machine (intro → questions → results)
├── package.json
└── README.md
```

Every file has a single responsibility, so the scoring logic in
`scoring.js` can be read, tested, or swapped out independently of the UI.

---

## Customizing

- **Add or edit questions:** edit the `QUESTIONS` array in `questions.js`.
  Each question needs a `scenario`, 4 `choices`, and a parallel `scores`
  array (one score object per choice). A `seed` key on a score plants a
  named seed; any other key is added to that hidden metric.
- **Tweak the scoring curve:** all formulas live in `calculatePlayerScore`
  in `scoring.js`.
- **Restyle:** all colors, type, radii, and spacing are CSS custom
  properties at the top of `style.css`.
- **Mute music by default:** flip the initial `muted` value in `audio.js`,
  though browsers block autoplaying audio without a user gesture anyway —
  the game already waits for the "Start the game" click.

---

## Disclaimer

**Bite the Watermelon is an entertainment and self-reflection game.** The
scores, personalities, seeds, and predictions are for fun and should not be
treated as a psychological, medical, or relationship diagnosis.
