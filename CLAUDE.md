# CLAUDE.md — Games Repository

## About

This repo is a collection of simple, single-page HTML games. Each game is a self-contained directory with an `index.html` file that anyone can open in a browser and start playing immediately.

**Goal:** Given just a game name and brief description, produce a complete, polished, production-ready game in a single pass with minimal back-and-forth.

---

## Hosting & Offline

- Hosted via **GitHub Pages** from `main` branch at `https://amitsehgal29.github.io/games/`
- Each game: `https://amitsehgal29.github.io/games/<game-name>/`
- **Every game must include a service worker** (`sw.js`) so it works fully offline after first visit
- Service worker pattern: network-first with cache fallback for all GET requests
- Cache the game HTML and icon on install. Bump cache name (`v2`, `v3`...) on major updates to force refresh
- Register SW silently in `init()`, non-blocking, with `.catch(() => {})`

---

## Repository Structure

```
/
├── index.html              ← Landing page listing all games (visually appealing cards)
├── <game-name>/            ← One directory per game
│   ├── index.html          ← Self-contained game (HTML + CSS + JS inline)
│   ├── sw.js               ← Service worker for offline play
│   └── icon.svg            ← Favicon + OG link preview image
├── .claude/                ← Claude Code project settings + skills
├── CLAUDE.md               ← This file (the blueprint)
└── README.md
```

---

## Development Workflow

1. `git checkout -b game/<game-name>`
2. Build the game as `index.html` + `sw.js` + `icon.svg` inside `<game-name>/`
3. Update the landing page (`index.html` at root) with a card linking to the new game
4. Open a PR to `main`
5. Merge → GitHub Pages deploys automatically

---

## Universal Game Architecture

### File Structure
- **Single `index.html`** — all HTML, CSS, and JS inline. No external files except `sw.js` and `icon.svg`
- **No frameworks, no images, no CDN dependencies.** Everything is canvas-drawn or CSS-styled
- Use **Fredoka One** (titles/buttons) + **Fredoka** (body) via Google Fonts `<link>`. Solid system-ui fallback stack
- **OG meta tags** for rich link previews: `og:title`, `og:description`, `og:image` pointing to `icon.svg`
- **SVG favicon** (`icon.svg`) — simple recognizable icon for browser tabs and link sharing

### Canvas Rendering
- Fixed internal game width (e.g., 400 units). Scale to canvas via `scaleX(val) = val * (canvas.width / GAME_W)`
- 60fps via `requestAnimationFrame`. **Delta-time for ALL movement** — never frame counts
- Clamp dt: `Math.max(0, Math.min(dt, 0.1))` — guards against negative and huge values
- Y-coordinates in raw canvas pixels. X-coordinates in game-space, scaled at render time
- Use `elapsedTime` accumulator (not `frameCount`) for ALL animations — frame-rate independent
- **Never mutate state in draw/render functions.** Drawing must be read-only

### Coordinate System
- Game-space X: 0 to GAME_W (e.g., 400). Scale to canvas pixels with `scaleX()`
- Game-space Y: raw canvas pixels. Player Y = `canvas.height * RATIO` (e.g., 0.80)
- Store object positions in game-space X + raw-pixel Y. Scale X at render time

---

## Difficulty Progression — The Key Insight

**Use continuous formulas that scale to the max distance.** For Wild Run, the target was 50,000m. The difficulty should still be increasing at 50,000m — never plateau.

### Speed
- Linear: `BASE_SPEED + floor(distance / DIST_PER_STEP) * SPEED_STEP`, clamped to `MAX_SPEED`
- Set MAX_SPEED high enough that it's only reached near the max distance
- Example: 140 base, +22 per 1200m, max 700 → reached at ~30,000m, still brutal

### Obstacle Count
- Piecewise thresholds that increase slowly: 1 at 0m, 2 at 3,000m, 3 at 8,000m, 4 at 25,000m
- **Never block all lanes** — cap at `LANES - 1` or use the lane-booking system
- With 4 lanes, max 4 obstacles + collectibles still works if properly spaced

### Obstacle Gap (Frequency)
- Formula that shrinks from a base value to a minimum over the full distance range
- Curved: `GAP_BASE - pow(distance/MAX_DIST, 0.55) * (GAP_BASE - GAP_MIN)`
- Clamped to a non-zero minimum so the game stays playable
- Example: 84 at 0m → 30 at 50,000m

### Visual Difficulty
- Speed lines appear at higher speeds (visible indicator of danger)
- More aggressive spawn patterns at higher speed/distance

---

## Spawn System — Zero Overlaps

The spawn system must guarantee **no two objects ever overlap**. This requires a unified lane-assignment function used by ALL spawn paths.

### `assignClearLane(spawnY)` — the core function
1. Scan ALL existing objects (obstacles + collectibles) on screen
2. For each lane, find the closest object's Y-distance from `spawnY`
3. Return a lane where the closest object is ≥ `MIN_OBJECT_GAP` (250px)
4. If all lanes are occupied nearby, return the lane with the furthest object
5. Used by `spawnObstacle()`, `spawnCollectible()`, and `spawnFuelCan()`

### Key Rules
- Every obstacle occupies exactly ONE lane (no spanning)
- Obstacles, fruit, and fuel all share the same lane pool
- Objects at different spawn Y values (e.g., -50 for obstacles, -30 for collectibles) still check against each other
- Minimum 250px vertical gap between any two objects in the same lane
- This ensures the player always has maneuvering room

---

## Collision Detection

### Hitbox Design
- Use circle collision (`r = w * 0.28-0.30`) for all obstacles — natural for face-based animals
- Always set both `w` and `r` in `spawnObstacle()` — don't leave `h` or `r` at zero
- Player hitbox: smaller than visual (generous margin) so near-misses feel fair

### Lane-Based Collision
- **Use visual position, not target lane** — `visualLane = clamp(round((displayX - ROAD_X - LANE_W/2) / LANE_W), 0, LANES-1)`
- When the player switches lanes, `playerLane` changes instantly but `displayX` lerps — if you check `playerLane` for collision, the player crashes into obstacles in the NEW lane while still visually in the OLD lane
- This is the #1 cause of "ghost collisions" — fixed by using `visualLane`

### Near-Miss Detection
- Triggered when an obstacle passes close to the player vertically in the same lane
- Visual feedback + audio cue makes near-misses feel exciting

---

## Mobile Audio — The Hard Problem

Getting audio to play instantly on mobile requires aggressive warm-up.

### Audio Architecture
- Web Audio API only — no audio files
- Default muted — user opts in. Store preference in localStorage
- Engine: subtle sine/triangle oscillators (~0.02 max volume)
- SFX: short oscillator envelopes + noise bursts

### iOS Audio Workflow
1. On first user gesture (tap mute button or START): create AudioContext, call `resume()`
2. Immediately play a **0.1s silent buffer** through the context — this "wakes up" iOS audio hardware
3. Burst **4 silent buffers at 0ms, 30ms, 80ms, 150ms** after unmute — aggressive priming
4. Every `playTone()` / `playNoise()` call also checks `audioCtx.state === 'suspended'` and auto-resumes
5. AudioContext creation wrapped in try-catch for unsupported browsers

### Common Audio Bugs
- **Delayed sound**: Not priming the audio pipeline aggressively enough
- **Silent SFX**: AudioContext suspended but SFX functions don't check state
- **Stuck boost sound**: Missing `touchcancel` handler
- **Doubled mute toggle**: Both touchstart and click firing on touchscreen laptops → use a flag

---

## Visual & UX Standards

### Title Screen
- Gradient overlay background (not flat black), floating particles
- Big bold title with gradient fill + decorative diamond dots and lines
- Control instructions in **styled cards** with colored accent bars at top
- Large START button (200×60 game units) with pulsing glow and rounded shape
- Footer: "Tap to start • Swipe up to boost • Steer with taps"

### HUD
- Top bar with semi-transparent dark background, rounded corners
- Row 1: fruit icon + score (left), distance (center) — large font (20px)
- Row 2: fuel nozzle icon + gauge bar (left), speed (right)
- Fuel gauge: gradient green→amber→red with white shine overlay
- All icons custom-drawn, no emojis. Icons should be generous (~34px for fruit, ~28px for fuel)
- Mute button: positioned BELOW the HUD bar (y=100+), not overlapping

### Game Over Screen
- Overlay with "Game Over" in Fredoka One, warm color
- Score + distance stats in large font
- "New High Score!" with star icons flanking
- Large PLAY AGAIN button (200×58) with green gradient and shine

### Custom Drawn Icons
- **Fruit**: orange circle, radial gradient, green leaf with vein, highlight spot
- **Fuel nozzle**: red pistol-grip gas pump handle, metal spout, trigger guard, hose
- **Speaker**: rectangle body + triangle cone, arc waves (unmuted) or red X (muted)
- **Star**: 4-point sparkle, gold fill, white center
- **Play triangle**: filled right-pointing triangle

### Obstacle Design
- Use **faces/heads** not full bodies — instantly recognizable at speed
- Each type needs unique silhouette, color, and feature:
  - Deer: warm brown oval face, branching antlers, white muzzle, large eyes
  - Bear: round dark face, small ears, lighter muzzle, small eyes
  - Sheep: fluffy white cloud-like face, black floppy ears, dark snout
- Strong shadows underneath for depth against the road

### Performance
- Cache gradient objects where possible
- Don't create new objects in render loops
- No `Math.random()` in render — use deterministic or `elapsedTime`-based
- Reuse arrays, pre-allocate where feasible

---

## Error Resilience — The Safe Defaults

### `safeLS()` — localStorage wrapper
```js
function safeLS(key, val) {
    try {
      if (val !== undefined) { localStorage.setItem(key, String(val)); return; }
      return localStorage.getItem(key);
    } catch(e) { return val !== undefined ? null : null; }
}
```
- **Never call safeLS recursively** — it calls `localStorage`, not itself
- Used for ALL reads and writes: high scores, distance records, mute preference
- Prevents crashes on Safari private browsing, full quota, or security errors

### AudioContext
- Constructor in try-catch for unsupported browsers
- Check `audioCtx.state === 'suspended'` before every sound
- `resume()` returns a Promise — fire-and-forget with `.catch(() => {})`

### Delta-Time
- `Math.max(0, Math.min(dt, 0.1))` — prevents negative values AND huge jumps
- Negative dt causes reversed game state (distance decreases, fuel increases)

### Touch Input
- Always include `touchcancel` alongside `touchend`
- Check mute button first in touchstart before any game action
- Use `{ passive: false }` on all game touch listeners
- Touch coords must match canvas pixels: `tx * (canvas.width / rect.width)`

### Canvas State
- Every `ctx.save()` must have a matching `ctx.restore()`
- Reset `globalAlpha` to 1 after any use
- Reset `shadowColor` to `'transparent'` after shadow effects
- Reset `shadowBlur` to 0

---

## Code Quality Standards

### No Dead Code
- If an obstacle type is removed, remove its drawing function
- If a feature is replaced, delete the old code — don't comment it out
- Dead code confuses maintainers and bloats the file

### Variable Naming
- Semantic game-context names: `playerLane`, `scrollSpeed`, `obstacles`, `collectibles`
- Game state prefix: `drawX` for drawing functions, `sfxX` for sound effects
- Constants in UPPER_SNAKE_CASE

### Code Organization
Group into clearly labeled sections with `═══` header comments:
- CANVAS SETUP → CONSTANTS → COLOR PALETTE → GAME STATE → AUDIO → HELPERS
- DRAWING (SKY, LANDSCAPE, TREES, PLAYER, OBSTACLES, COLLECTIBLES, PARTICLES)
- GAME OBJECT SPAWNING → COLLISION → HUD → SCREENS
- GAME LOGIC → RENDER → GAME LOOP → INPUT → INIT

### No Emojis
All visual elements must be custom canvas-drawn. This includes:
- Score icons (fruit), fuel icons (nozzle), mute button (speaker)
- Title screen decorations, button icons, star ratings
- Use text like "Wild Run" not "🏞️ Wild Run"

---

## User Preferences (learned through iteration)

- **Nature themes** — forests, animals, dirt roads, mountains. Not neon/sci-fi
- **Vehicle should be a tractor** — large rear wheels, green body, cabin at rear
- **Animal obstacles** — deer, bear, sheep (faces only). No rocks, puddles, or logs
- **Fuel as gas pump nozzle** — red pistol-grip dispenser handle
- **Continuous difficulty** — formulas not thresholds. Scale to 50,000m+
- **Scarce fuel** — thresholds at 50%, 25%, 5%. 40pt fill. Creates tension
- **Zero overlaps** — unified lane-assignment system for all objects
- **Large HUD** — 40% bigger than default, icons doubled for readability
- **Smooth animations** — lerp-based with squash & stretch + tilt
- **Sound defaults muted** — subtle engine, pleasant waveforms
- **Offline-first** — service worker on every game
- **Fun fonts** — Fredoka One, not system fonts
- **No emojis** — custom canvas art everywhere
- **Large touch targets** — 44pt minimum for buttons, 28px+ for mute
- **Swipe-up to boost** on mobile — intuitive gas-pedal metaphor
- **Link previews** — favicon + OG meta tags for rich sharing
- **Minimal back-and-forth** — build complete in one shot

---

## Game Template Checklist

When building a new game, include ALL of these:

- [ ] Single `index.html` with inline CSS + JS
- [ ] `sw.js` for offline caching (cache HTML + icon.svg)
- [ ] `icon.svg` — favicon + OG link preview image
- [ ] OG meta tags: title, description, image, type, url
- [ ] Google Fonts link (Fredoka One + Fredoka) with fallback stack
- [ ] Canvas-based rendering with fixed internal width + scaleX
- [ ] Delta-time game loop with `elapsedTime` for animations
- [ ] dt clamping: `Math.max(0, Math.min(dt, 0.1))`
- [ ] Title screen: gradient overlay, bold title, control cards, prominent start button
- [ ] HUD: clean top bar (not overlapping mute button), drawn icons, fuel gauge
- [ ] Game over screen: stats, new-high-score check (before endGame updates), play again button
- [ ] Custom-drawn mute button (speaker + sound waves / X), defaults to muted
- [ ] Web Audio synthesized sounds with aggressive iOS warmup (4-buffer burst)
- [ ] `safeLS()` wrapper for ALL localStorage calls
- [ ] `touchcancel` handler alongside `touchend`
- [ ] Unified `assignClearLane()` for ALL spawns — zero overlap guarantee
- [ ] Collision uses `visualLane` from display position, not target lane
- [ ] Obstacle hitbox radius `r = w * 0.28-0.30`
- [ ] Continuous difficulty formulas scaling to max distance
- [ ] Smooth animations with lerp, squash & stretch, tilt
- [ ] Keyboard + touch controls (swipe-up for boost on mobile)
- [ ] Responsive canvas sizing (max-width matching MAX_W, centered)
- [ ] Update landing page card
- [ ] PR to main with detailed description
