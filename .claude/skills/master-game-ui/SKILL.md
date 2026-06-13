---
name: master-game-ui
description: Use this skill when building gaming interfaces, HUDs, interactive game menus, title screens, and high-performance browser game UI elements. Activates on any game development task involving canvas rendering, game UI layout, or visual polish.
version: 3.0.0
---

# Master Game UI Architecture

This skill orchestrates advanced game interface engineering by combining foundational performance skills, genre-appropriate visual libraries, and project-specific Canvas 2D patterns refined across multiple shipped games.

---

## 1. Core Skill Dependencies

*Ensure these background skills are installed in your Claude environment as required:*
- `gsap-skills` (`gsap-core`, `gsap-timeline`, `gsap-plugins`): Offload complex frame-by-frame UI tracking and multi-step timeline easing to GreenSock. Install via `npx skills add https://github.com/greensock/gsap-skills`
- `algorithmic-art`: Generate procedurally drawn HUD borders, crosshairs, and status frames natively in SVG/Canvas. Install via `npx skills add https://github.com/anthropics/skills/tree/main/skills/algorithmic-art`
- `canvas-design`: Handle layout zoning, ensuring HTML/CSS layers sit pixel-perfectly on top of 2D/3D render viewports. Install via `npx skills add https://github.com/anthropics/skills/blob/main/skills/canvas-design/SKILL.md`

---

## 2. Integrated Game UI Libraries

*When generating code for CSS/DOM-based games, style exclusively using one of these three libraries depending on the game genre:*

### Option A: Retro & Pixel-Art (NES.css)
- Use for 8-bit, 16-bit, and classic arcade mechanics.
- Apply semantic retro classes (`.nes-btn`, `.nes-container`, `.nes-progress`).
- Enforce `image-rendering: pixelated;` on all associated asset scaling.

### Option B: Desktop Fantasy RPG (RPGUI)
- Use for strategy, tabletop simulators, and high-fantasy RPGs.
- Structure containers around classic parchment, golden borders, and asset-based progress bars.
- Disable default OS text selection (`user-select: none;`) to mimic native application wrappers.

### Option C: Sci-Fi & Cyberpunk (Arwes Framework CSS)
- Use for futuristic layouts, tactical space grids, and tech dashboards.
- Utilize intense text-shadow glows, neon hex variables, and clip-path polygon cuts.

**For this project's games:** All games use **vanilla Canvas 2D only** — no CSS frameworks, no images, no CDN dependencies. The library options above are for DOM-based games; our games draw everything via canvas primitives.

---

## 3. Genre-Based Theming (Canvas-Native)

When building a new game for this repo, choose a visual theme distinct from existing games:

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
- Limited color palette, blocky pixel-art shapes, crisp edges
- `image-rendering: pixelated`, Press Start 2P font
- For 8-bit/16-bit arcade-style games

### Theme E: Sci-Fi & Futuristic
- Dark backgrounds with intense neon glows, hex grids, clip-path polygons
- High-contrast cyan/magenta/green on black, monospace fonts
- For space, cyberpunk, tactical HUD games

---

## 4. Rendering Engine (Canvas 2D)

- **Canvas 2D only** — all game elements drawn via canvas primitives (arc, rect, ellipse, bezierCurveTo, quadraticCurveTo)
- **Fixed internal game width** (400 units) scaled to canvas via `scaleX(val) = val * (canvas.width / GAME_W)`
- **60fps via requestAnimationFrame** with delta-time for ALL movement
- Never use frame counts for animation — always `elapsedTime` accumulator
- Clamp dt: `Math.max(0, Math.min(dt, 0.1))` — guards against negative and huge values
- Y-coordinates in raw canvas pixels. X in game-space, scaled at render time.

---

## 5. Visual Standards

- **No emojis anywhere** — custom canvas-drawn icons for everything (fruit, speaker, fuel, stars, arrows)
- **High contrast, vibrant colors** — deep gradients, strong shadows
- **Fun, game-like fonts** — Fredoka One (titles/buttons), Fredoka (body), Outfit (modern). Import via Google Fonts `<link>` with solid fallback stack
- All artwork via canvas primitives — no images, no sprites, no external assets

---

## 6. Title Screen Design

```
┌─────────────────────────┐
│   gradient overlay bg   │
│   floating particles    │
│   decorative circles    │
│                         │
│   ════ TITLE ════      │  (gradient fill, large font, decorative lines/diamond dots)
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

## 7. HUD Design

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

## 8. Game Over / Level Complete Screen

- Strong overlay with title in fun font (warm color for game-over, green for level-clear)
- Show final stats: score, time, moves, distance
- "New High Score!" / "New High Level!" with star icons flanking
- Celebration particles on level clear (colored dots burst outward with gravity)
- Star rating (1-3 ★) based on performance thresholds
- Prominent "PLAY AGAIN" / "NEXT LEVEL" button with pulsing glow
- Secondary "CHANGE DIFFICULTY" or "MENU" button

---

## 9. Custom Drawn Icons

All icons must be canvas-drawn — no emoji, no images.

- **Fruit**: orange circle, radial gradient, green leaf, highlight spot, pulsing glow + sparkle rays
- **Fuel can / nozzle**: red grip body with gradient, metal nozzle spout, hose, trigger guard, highlight shine
- **Speaker**: rectangle body + triangle cone, arc sound waves (unmuted) or red X (muted)
- **Star**: 4-point or 8-point sparkle, gold fill, white center dot
- **Play triangle**: filled right-pointing triangle
- **Arrow (direction)**: stem + triangular head, rotated for up/down/left/right
- **Tea leaf**: bezier-curve oval, center vein, tiny stem

---

## 10. Mandatory Performance Constraints

- **GPU Acceleration Only**: Never animate structural box properties (`width`, `height`, `top`, `left`). Use canvas transforms. For DOM overlays, translate via `transform: translate3d()` and `opacity`.
- **No per-frame allocations**: Cache gradient objects, don't create new ones in render loop. Reuse arrays.
- **Don't mutate state in draw functions** — rendering must be read-only
- **Input Neutrality**: Canvas handles all input. Button hit-testing via stored rect objects (`canvas._startBtn = {x,y,w,h}`). For DOM overlays, use `pointer-events: none` so clicks pass through to the game canvas.
- **No Math.random() in render** — causes visual flicker. Use deterministic patterns seeded by `elapsedTime` + object index. All randomness confined to spawn/init functions.
- Scale factor computed once per frame: `canvas.width / GAME_W`, not recalculated per call

---

## 11. Mobile UX

- Touch targets minimum 44px (22 game units at 480px canvas)
- Mute button: 22-28px visual radius, 1.5× larger touch area
- START/PLAY AGAIN buttons: 190-200 game units wide, 48-60 tall
- Swipe-up for boost, tap sides for steering
- `touchcancel` handler alongside `touchend` for all press-and-hold interactions
- `{ passive: false }` on all game touch listeners
- Prevent default on all game input events
- `muteToggledByTouch` flag to deduplicate touchstart + click on same tap

---

## 12. Audio Patterns

- **Web Audio API synthesized sounds** — no audio files
- **Default muted** — user opts in. Store preference in localStorage
- Engine: subtle sine/triangle oscillators (~0.02 max volume). Pitch tracks game speed.
- SFX: short oscillator envelopes + noise bursts (flip, match, click, win, lose, crash, near-miss)
- iOS: play silent buffer to prime audio session after first user gesture. Burst multiple buffers (0ms, 30ms, 80ms, 150ms) for aggressive warm-up.
- Delay engine start 150ms after user gesture on mobile
- Wrap AudioContext creation in try-catch for older browsers
- `toggleMute()` calls `initAudio()` to ensure context is running

---

## 13. Robustness Checklist

- `safeLS()` wrapper for ALL localStorage calls (try-catch quota/security errors)
- Service worker (`sw.js`) for offline play — cache-first navigation, network-first fetch. Bump cache name on major updates.
- Delta-time clamped: `Math.max(0, Math.min(dt, 0.1))`
- All empty arrays handled gracefully (forEach on empty = no-op)
- Canvas `save()`/`restore()` balanced in all code paths
- `globalAlpha` always reset to `1` after use
- Button hit-test rects stored on `canvas._btnName` object, checked in both touch + click handlers
- Service worker registered with `.catch(() => {})`
