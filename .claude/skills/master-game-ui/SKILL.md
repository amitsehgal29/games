---
name: master-game-ui
description: Use this skill when building gaming interfaces, HUDs, interactive game menus, title screens, and high-performance browser game UI elements. Activates on any game development task involving canvas rendering, game UI layout, or visual polish.
version: 2.0.0
---

# Master Game UI Architecture

This skill orchestrates game interface engineering — combining performance patterns, visual standards, and genre-appropriate theming. Every game in this repo follows these rules.

---

## 1. Rendering Engine

- **Canvas 2D only** — all game elements drawn via canvas primitives (arc, rect, ellipse, bezierCurveTo, quadraticCurveTo)
- **Fixed internal game width** (400 units) scaled to canvas via `scaleX(val) = val * (canvas.width / GAME_W)`
- **60fps via requestAnimationFrame** with delta-time for ALL movement
- Never use frame counts for animation — always `elapsedTime` accumulator
- Clamp dt: `Math.max(0, Math.min(dt, 0.1))` — guards against negative and huge values

---

## 2. Genre-Based Theming

When building a new game, choose a visual theme distinct from existing games. All styles use **canvas-drawn art only** — no CSS frameworks, no images, no CDN dependencies.

### Theme A: Nature & Wilderness
- Warm earthy palette — forest greens, sky blues, dirt browns, golden sunlight
- Organic shapes — trees, mountains, animals, rivers
- Fredoka One for titles, Fredoka for body
- Example: Wild Run

### Theme B: Modern & Neon
- Dark backgrounds with vibrant accent colors — deep navy, neon glows, jewel tones
- Geometric precision — grids, circles, sharp lines
- Outfit font for clean modern feel
- Example: Arrow Escape

### Theme C: Warm & Tactile
- Cream/paper backgrounds, soft shadows, rich jewel-tone accents
- Handcrafted feel — organic shapes, bezier curves, subtle textures
- Outfit or Fredoka depending on tone
- Example: Matcha

### Theme D: Retro & Pixel
- Limited color palette, blocky pixel-art shapes
- Crisp edges, no anti-aliasing, `image-rendering: pixelated`
- Press Start 2P or similar pixel font
- For 8-bit/16-bit arcade-style games

### Theme E: Sci-Fi & Futuristic
- Dark backgrounds with intense neon glows, hex grids, clip-path polygons
- High-contrast cyan/magenta/green on black
- Monospace or tech fonts
- For space, cyberpunk, tactical HUD games

---

## 3. Visual Standards

- **No emojis anywhere** — custom canvas-drawn icons for everything (fruit, speaker, fuel, stars, arrows)
- **High contrast, vibrant colors** — deep gradients, strong shadows
- **Fun, game-like fonts** — Fredoka One (titles/buttons), Fredoka (body), Outfit (modern). Import via Google Fonts `<link>` with solid fallback stack
- All artwork via canvas primitives — no images, no sprites, no external assets

---

## 4. Title Screen Design

```
┌─────────────────────────┐
│   gradient overlay bg   │
│   floating particles    │
│   decorative circles    │
│                         │
│   ════ TITLE ════      │  (gradient fill, large font, decorative lines/dots)
│      subtitle           │
│                         │
│  ┌─HOW TO PLAY────────┐ │  (styled card: dark bg, colored accent bar, rounded)
│  │ Instruction text    │ │
│  │ Secondary hint      │ │
│  └────────────────────┘ │
│                         │
│    [ ▶ START ]          │  (pulsing glow, gradient fill, rounded pill, 200×52px)
│                         │
│    Best: 500 pts ★★★   │  (high score if exists, with star rating)
└─────────────────────────┘
```

**Rules:**
- Full-screen overlay with deep gradient background (not flat)
- Big bold title with gradient fill + decorative elements (lines, diamond dots, floating particles)
- Control instructions in styled cards with colored accent bars — not just text
- Prominent START button: gradient fill, pulsing shadow glow, rounded pill shape
- Show high score/best level if one exists
- Mute button always visible and accessible from title screen

---

## 5. HUD Design

```
┌──────────────────────────────┐
│  🍎 42    1,250m    ⛽ ████  │  ← semi-transparent dark bar
│            moves     68 km/h │
└──────────────────────────────┘
```

- **Clean, unobtrusive** — small bar at top of screen, semi-transparent dark background
- Row 1: score icon + number (left), distance/progress (center)
- Row 2: fuel/health icon + gauge bar (left), speed/stat (right)
- Gauge bar: gradient that shifts green → amber → red as resource depletes, with shine overlay
- All icons custom-drawn (fruit, fuel can, speaker, star) — never emoji

---

## 6. Game Over / Level Complete Screen

- Strong overlay with title in fun font (warm color for game-over, green for level-clear)
- Show final stats: score, time, moves, distance
- "New High Score!" / "New High Level!" with star icons flanking
- Celebration particles on level clear (colored dots burst outward with gravity)
- Star rating (1-3 ★) based on performance thresholds
- Prominent "PLAY AGAIN" / "NEXT LEVEL" button with pulsing glow
- Secondary "CHANGE DIFFICULTY" or "MENU" button

---

## 7. Custom Drawn Icons

All icons must be canvas-drawn — no emoji, no images.

- **Fruit**: orange circle, radial gradient, green leaf, highlight spot, pulsing glow
- **Fuel can / nozzle**: red grip body, metal nozzle, hose, trigger guard, highlight
- **Speaker**: rectangle body + triangle cone, arc sound waves (unmuted) or red X (muted)
- **Star**: 4-point or 5-point sparkle, gold fill, white center
- **Play triangle**: filled right-pointing triangle
- **Arrow (direction)**: stem + triangular head, rotated for up/down/left/right
- **Tea leaf**: bezier-curve oval, center vein, tiny stem

---

## 8. Mandatory Performance Constraints

- **GPU Acceleration Only**: Never animate `width`, `height`, `top`, `left`. Use canvas transforms
- **No per-frame allocations**: Cache gradient objects, don't create new ones in render loop
- **Don't mutate state in draw functions** — rendering must be read-only
- **Input Neutrality**: Canvas handles all input. Button hit-testing via stored rect objects (`canvas._startBtn = {x,y,w,h}`)
- **No Math.random() in render** — causes visual flicker. Use deterministic patterns seeded by `elapsedTime` + object index
- Scale factor computed once per frame: `canvas.width / GAME_W`, not recalculated per call

---

## 9. Mobile UX

- Touch targets minimum 44px (22 game units at 480px canvas)
- Mute button: 22px+ visual radius, 1.5× larger touch area
- START/PLAY AGAIN buttons: 190-200 game units wide, 48-52 tall
- `touchcancel` handler alongside `touchend` for all press-and-hold interactions
- `{ passive: false }` on all game touch listeners
- Prevent default on game input events
- `muteToggledByTouch` flag to deduplicate touchstart + click on same tap

---

## 10. Audio Patterns

- **Web Audio API synthesized sounds** — no audio files
- **Default muted** — user opts in. Store preference in localStorage
- Engine: subtle sine/triangle oscillators (~0.02 max volume). Pitch tracks game speed
- SFX: short oscillator envelopes + noise bursts (flip, match, click, win, lose)
- iOS: play silent buffer to prime audio session after first user gesture
- Wrap AudioContext creation in try-catch for older browsers
- `toggleMute()` calls `initAudio()` to ensure context is running

---

## 11. Robustness Checklist

- `safeLS()` wrapper for ALL localStorage calls (try-catch quota/security errors)
- Service worker (`sw.js`) for offline play — cache-first navigation, network-first fetch
- Delta-time clamped: `Math.max(0, Math.min(dt, 0.1))`
- All empty arrays handled gracefully (forEach on empty = no-op)
- Canvas `save()`/`restore()` balanced in all code paths
- `globalAlpha` always reset to `1` after use
- Button hit-test rects stored on `canvas._btnName` object, checked in both touch + click handlers
- Service worker registered with `.catch(() => {})`
