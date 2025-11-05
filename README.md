# EverGrow

EverGrow is a minimalist idle growth game that runs entirely in the browser. Grow biomass by hand, automate production with upgrades, unlock achievements, and trigger short-term events that boost your progress. Progress is saved locally in the browser.

## Getting started

1. Serve the `EverGrow/app` directory with any static file server (or open `index.html` directly).
2. Click **Grow the world** to add biomass manually.
3. Purchase upgrades as they become affordable to automate production.
4. Prestige when the progress bar fills to reset for permanent evolution points.

### Development quick start

```bash
cd EverGrow/app
python -m http.server 8080
```

Open http://localhost:8080/ in a browser to play the game from source.

## Key systems

- **State manager** – handles load/save cycles and persistence in `localStorage`.
- **Progression system** – defines upgrades, prestige rewards, and all passive generation.
- **Achievement system** – unlocks milestones as the planet flourishes.
- **Event system** – occasionally triggers short-lived production boosts.
- **Streak system** – tracks daily logins to encourage returning players.

All client code lives under [`EverGrow/app`](EverGrow/app).
