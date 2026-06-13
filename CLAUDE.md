# CLAUDE.md — Games Repository

## About

This repo is a collection of simple, single-page HTML games. Each game is a self-contained directory with an `index.html` file that anyone can open in a browser and start playing immediately. Basic instructions and rules are shown on the page.

## Hosting

Hosted via **GitHub Pages** from the `main` branch. The repo `amitsehgal29/games` is served at:

```
https://amitsehgal29.github.io/games/
```

Each game lives in its own directory, making it accessible at a clean URL:

```
https://amitsehgal29.github.io/games/<game-name>/
```

## Repository Structure

```
/
├── index.html          ← Landing page listing all games
├── <game-name>/        ← One directory per game
│   └── index.html      ← Self-contained game (HTML + CSS + JS inline)
├── .claude/            ← Claude Code project settings
├── CLAUDE.md           ← This file
└── README.md
```

## Development Workflow

1. **Create a branch** for each new game: `git checkout -b game/<game-name>`
2. **Build the game** as a single `index.html` inside `<game-name>/`
3. **Update the landing page** (`index.html` at root) to link to the new game
4. **Open a PR** to `main`
5. **Merge** → GitHub Pages deploys automatically

## Game Design Guidelines

- **Single file**: Everything (HTML, CSS, JS) in one `index.html` — no external dependencies unless absolutely necessary
- **Zero setup**: Open in any browser and play — no build step, no server, no install
- **Self-documenting**: Rules and instructions displayed on the page
- **Mobile-friendly**: Responsive design that works on phones, tablets, and desktop
- **No framework**: Vanilla HTML/CSS/JS only
