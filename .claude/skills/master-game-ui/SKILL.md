---
name: master-game-ui
description: Use this skill when building gaming interfaces, HUDs, interactive game menus, title screens, and high-performance browser game UI elements. Activates on any game development task involving canvas rendering, game UI layout, or visual polish.
version: 1.0.0
---

# Master Game UI Architecture

## Rendering Engine

- **Canvas 2D only** — all game elements drawn via canvas primitives (arc, rect, ellipse, quadraticCurveTo)
- **Fixed internal game width** (400 units) scaled to canvas via `scaleX(val) = val * (canvas.width / GAME_W)`
- **60fps via requestAnimationFrame** with delta-time for ALL movement
- Never use frame counts for animation — always `elapsedTime` accumulator
- Clamp dt: `Math.max(0, Math.min(dt, 0.1))`

## Visual Standards

- **No emojis anywhere** — custom canvas-drawn icons for everything
- **Fredoka One** for titles/buttons, **Fredoka** for body text — import via Google Fonts `<link>`
- High contrast, vibrant colors — deep gradients, strong shadows
- All artwork via canvas primitives — no images, no sprites

## Title Screen Design

```
┌─────────────────────────┐
│   gradient overlay bg   │
│   floating particles    │
│                         │
│   ★── TITLE ──★        │  (gold gradient, Fredoka One, decorative lines)
│      subtitle           │
│                         │
│  ┌─CONTROLS──┐ ┌─HOW──┐ │  (styled cards with colored accent bars)
│  │ ◀ ▶ steer │ │ info  │ │
│  │ ▲  boost  │ │       │ │
│  └───────────┘ └──────┘ │
│                         │
│    [ ⏵ START ]          │  (pulsing glow, gradient fill, large target)
│                         │
│    Best: 500 pts        │
│  Tap or Space to start  │
└─────────────────────────┘
```

## HUD Design

- Top bar: semi-transparent dark background
- Row 1: score icon + number (left), distance (center)
- Row 2: fuel icon + gauge bar (left), speed (right)
- Fuel gauge: gradient green→amber→red with shine overlay
- All icons custom-drawn, no emojis

## Game Over Screen

- Overlay with game-over title (Fredoka One, warm color)
- Score + distance stats
- "New High Score!" with star icons flanking
- Prominent "PLAY AGAIN" button

## Custom Drawn Icons

- **Fruit**: orange circle, radial gradient, green leaf, highlight spot, pulsing glow
- **Fuel droplet**: red rounded rect, yellow accent stripe, cap
- **Speaker**: rectangle body + triangle cone, arc waves (unmuted) or red X (muted)
- **Star**: 4-point sparkle, gold fill, white center
- **Play triangle**: filled right-pointing triangle

## Performance Rules

- **GPU Acceleration Only**: Never animate `width`, `height`, `top`, `left`. Use canvas transforms.
- **No per-frame allocations**: Cache gradients, don't create objects in render loop
- **Don't mutate state in draw functions** — rendering must be read-only
- **Input Neutrality**: `pointer-events: none` on HUD overlays
- **No Math.random() in render** — causes visual flicker, use deterministic or stored values

## Mobile UX

- Touch targets minimum 44px
- Mute button: 28px+ visual radius, larger touch area
- START/PLAY AGAIN buttons: 200×58+ game units
- Swipe-up for boost, tap sides for steering
- `touchcancel` alongside `touchend`
- `{ passive: false }` on all game touch listeners

## Audio Patterns

- Web Audio API synthesized sounds (no files)
- Default muted — user opts in
- Engine: subtle sine/triangle oscillators (~0.02 max volume)
- SFX: short oscillator envelopes + noise bursts
- iOS: play silent buffer to prime audio session
- Delay engine start 150ms after user gesture on mobile
- Wrap AudioContext in try-catch

## Robustness Checklist

- `safeLS()` wrapper for localStorage (try-catch quota/security errors)
- Service worker for offline play
- Delta-time clamping against negative and huge values
- All empty arrays handled (forEach on empty = no-op)
- Canvas save/restore balanced in all code paths
- `globalAlpha` always reset to 1 after use
