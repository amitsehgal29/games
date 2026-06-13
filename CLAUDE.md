# CLAUDE.md — Games Repository

## About

This repo is a collection of simple, single-page HTML games. Each game is a self-contained directory with an `index.html` file that anyone can open in a browser and start playing immediately.

**Goal:** Given just a game name and brief description, produce a complete, polished, production-ready game in a single pass with minimal back-and-forth.

---

## Hosting & Offline

- Hosted via **GitHub Pages** from `main` branch at `https://amitsehgal29.github.io/games/`
- Each game: `https://amitsehgal29.github.io/games/<game-name>/`
- **Every game must include a service worker** (`sw.js`) so it works fully offline after first visit
- Service worker pattern: cache-first for navigation, network-first with cache fallback for all requests
- Register SW silently in `init()`, non-blocking, with `.catch(() => {})`

---

## Repository Structure

```
/
├── index.html              ← Landing page listing all games (visually appealing cards)
├── <game-name>/            ← One directory per game
│   ├── index.html          ← Self-contained game (HTML + CSS + JS inline)
│   └── sw.js               ← Service worker for offline play
├── .claude/                ← Claude Code project settings
├── CLAUDE.md               ← This file (the blueprint)
└── README.md
```

---

## Development Workflow

1. `git checkout -b game/<game-name>`
2. Build the game as `index.html` + `sw.js` inside `<game-name>/`
3. Update the landing page (`index.html` at root) with a card linking to the new game
4. Open a PR to `main`
5. Merge → GitHub Pages deploys automatically

---

## Universal Game Architecture (applies to ALL games)

### File Structure
- **Single `index.html`** — all HTML, CSS, and JS inline. No external files except `sw.js`.
- **No frameworks, no images, no CDN dependencies.** Everything is canvas-drawn or CSS-styled.
- If fonts are needed, use Google Fonts with a `<link>` tag and a solid fallback stack. Fredoka / Fredoka One is the default fun font. Fonts are cached by the service worker.

### Canvas Rendering
- Use a **fixed internal game width** (e.g., 400 units) and scale to canvas via `scaleX(…) = val * (canvas.width / GAME_W)`.
- Render at 60fps via `requestAnimationFrame`. Use **delta-time** (`dt`) for all movement, not frame counts.
- **Never hardcode dt** — always compute from timestamps. Clamp dt: `Math.max(0, Math.min(dt, 0.1))`.
- For y-coordinates, use raw canvas pixels directly. The game-world scaling only applies to x.

### Coordinate System
- Game-space X: 0 to GAME_W (e.g., 400). Scale to canvas pixels with `scaleX()`.
- Game-space Y: raw canvas pixels. Player Y = `canvas.height * RATIO` (e.g., 0.80).
- Store all object positions in game-space. Scale at render time.

### Difficulty Progression
- **Use continuous formulas, never discrete thresholds.** Every meter of distance should make the game slightly harder.
- Speed: linear increase with distance, clamped to a max.
- Obstacle frequency: `GAP_BASE / (1 + distance / N)` — gap shrinks continuously.
- Obstacle count: `1 + Math.floor(distance / M)` — increments smoothly.
- Start easy, end very difficult but not impossible. Players should feel they're doing well early on.

### Seed RNG for Reproducibility
- Use a **seeded PRNG** for obstacle placement so that given the same seed, the same sequence of obstacles is generated.
- Store the seed in the URL hash (`#seed=...`) so players can share or replay specific seeds.
- If no seed is provided, generate one randomly and set it in the URL.

### Service Worker (sw.js)
- Every game gets its own `sw.js` in its directory.
- Cache the game's `./` and `./index.html` on install.
- Network-first with cache fallback for all GET requests.
- On activation, delete old caches.
- Register in `init()` with `navigator.serviceWorker.register('sw.js').catch(() => {})`.

---

## Visual & UX Standards

### Visual Style
- **High contrast, vibrant colors.** Everything should pop. No muted/dull palettes.
- **Custom canvas-drawn art** for all game elements. No emojis in HUD, title screens, or gameplay.
- **Fun, game-like fonts** (Fredoka One for titles/buttons, Fredoka for body). Import via Google Fonts `<link>`.
- **Deep, rich gradients** for backgrounds, sky, and overlays.
- **Strong shadows** under all game objects for depth and contrast against the play field.
- **Atmospheric elements**: drifting clouds, birds, parallax scenery, floating particles.

### Title / Start Screen
- Full-screen overlay with **deep gradient background** (not flat black).
- **Big, bold title** with gradient fill and decorative elements (lines, diamond dots, etc.).
- **Control instructions** in styled cards with colored accent bars — not just text dumped on screen.
- **Prominent START button** with gradient fill, pulsing glow animation, and rounded shape.
- **Decorative elements**: tree silhouettes, floating particles, subtle animations.
- Show high score if one exists.
- The mute button is always visible and accessible from the title screen.

### HUD (Heads-Up Display)
- **Clean, unobtrusive** — small bar at the top of the screen.
- Layout: score (left), distance (center), fuel gauge + speed (right).
- Use **drawn icons** (not emojis) for score type, fuel, etc.
- Fuel gauge: gradient bar that changes color (green → amber → red) as fuel depletes.

### Game Over Screen
- Strong overlay with game-over title in fun font.
- Show final score, distance, and whether it's a new high score.
- Prominent "PLAY AGAIN" button.
- Stars flanking "New High Score!" text.

### Obstacles & Game Objects
- **Visually distinct and instantly recognizable** at game speed.
- Use **faces/heads** rather than full bodies — easier to identify quickly.
- Each obstacle type must have a **unique silhouette, color, and feature**.
- Always ensure **at least one lane is clear** — check blocked lanes before spawning.
- Obstacles occupy exactly one lane each (no spanning across lanes).
- Collectibles and obstacles must **never overlap** — use a lane-booking system.

### Controls
- **Keyboard**: Arrow keys for primary action, Space/Enter to start.
- **Mobile**: Touch — tap left/right half of screen for directional input.
- Always include `touchcancel` handler alongside `touchend`.
- Prevent default on all game input events. Use `{ passive: false }` for touch.

### Audio
- **Synthesized via Web Audio API** — no audio files.
- **Default muted** — user opts in. Store preference in localStorage.
- Engine: continuous low oscillator + filtered noise. Volume subtle (~0.02 max). Pitch tracks speed.
- Sound effects: short oscillator envelopes and noise bursts.
- Mute button: custom-drawn speaker icon (sound waves when unmuted, X when muted).
- Always wrap AudioContext creation in try-catch for older browsers.
- Add `touchcancel` to prevent stuck audio states.

---

## Code Quality & Robustness

### Error Resilience
- **Wrap all `localStorage` calls** in try-catch (Safari private browsing, quota exceeded).
- **Wrap `AudioContext` constructor** in try-catch (unsupported browsers).
- **Clamp delta-time** to prevent huge jumps after tab-backgrounding: `Math.max(0, Math.min(dt, 0.1))`.
- Service worker registration: always `.catch(() => {})`.

### Performance
- **No per-frame allocations** in hot paths (render, update). Pre-allocate and reuse.
- **Avoid `Math.random()` in render** — causes visual flicker. Use deterministic or frame-count-based patterns for textures.
- **Don't mutate state in draw/render functions.** Drawing should be read-only.
- **Cache gradient objects** where possible — don't create new ones every frame.
- Scale factor computed once: `canvas.width / GAME_W`, not recalculated per call.
- Use `requestAnimationFrame` — never `setTimeout`/`setInterval` for game loops.

### Clean Code
- **No dead code.** If an obstacle type or feature is removed, remove its drawing function too.
- Use semantic variable names in game context (e.g., `playerLane`, `scrollSpeed`, `obstacles`).
- Group code into clearly labeled sections with comment headers.
- Persistent state (high scores, preferences) uses `localStorage` with game-specific key prefixes.

---

## User Preferences (learned through iteration)

- **Nature themes over neon/sci-fi** — forests, animals, dirt roads, mountains.
- **Fun, colorful title screens** — use real fonts (Fredoka One), not system fonts.
- **No emojis** anywhere — draw custom icons for everything (fruit, fuel, speaker, stars, play button).
- **Face-only obstacles** — more recognizable than full-body top-down views.
- **Animal obstacles preferred** over inanimate objects (rocks, puddles, logs).
- **Continuous difficulty ramp** — no sudden spikes. Make it hard gradually.
- **Fuel should be scarce** — if the player gets refueled too often, there's no tension.
- **Obstacles must never overlap** with each other or with collectibles.
- **Always leave at least one clear lane** — the player must always have a path forward.
- **Smooth animations** — lerp-based lane switching with squash & stretch and tilt.
- **Sound defaults to muted** — the engine sound should be subtle, not annoying.
- **Offline-first** — service worker on every game.
- **Minimal back-and-forth** — given a game concept, build it complete in one shot.

---

## Game Template Checklist

When building a new game, include ALL of these:

- [ ] Single `index.html` with inline CSS + JS
- [ ] `sw.js` for offline caching
- [ ] Google Fonts link (Fredoka One + Fredoka) with fallback stack
- [ ] Canvas-based rendering with fixed internal width + scaleX
- [ ] Delta-time game loop with dt clamping
- [ ] Title screen: gradient overlay, bold title, control cards, prominent start button
- [ ] HUD: clean top bar, drawn icons, fuel gauge
- [ ] Game over screen: stats, high score check, play again button
- [ ] Custom-drawn mute button (speaker icon), defaults to muted
- [ ] Web Audio synthesized sounds (wrap in try-catch)
- [ ] safeLS() wrapper for localStorage
- [ ] touchcancel handler alongside touchend
- [ ] Obstacle lane-booking to prevent overlaps and ensure clear path
- [ ] Continuous difficulty formulas (no discrete thresholds)
- [ ] Smooth animations with lerp
- [ ] Keyboard + touch controls
- [ ] Responsive canvas sizing (max-width, centered)
- [ ] Update landing page card
- [ ] PR to main with detailed description
