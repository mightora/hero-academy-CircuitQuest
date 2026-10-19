# Architecture

Static app for GitHub Pages; TypeScript source and browser-native DOM/Canvas-like SVG. No database or runtime API is needed.

- `src/engine.ts`: component catalogue, typed network, validation, terminal union-find, nodal DC conductance solver, piecewise linear diodes, circuit presets.
- `src/missions.ts`: eight year-band regions, machine-readable 80 mission records, 40 side-activity records, level-code mapping, introductory numerical questions.
- `src/app.ts`: adventure screens, event delegation, touch and keyboard operability, terminal connections, property controls, practice screens, local saves.
- `public/index.html`, `public/style.css`, `public/icon.svg`: brand and UI.
- `public/sw.js`, `public/manifest.webmanifest`: optional offline PWA cache.
- `tests/engine.test.mjs`: Node.js electrical and curriculum tests.
- `scripts/build.mjs`: copies public assets to TypeScript's `dist/` emission directory.
- `.github/workflows/pages.yml`: GitHub Pages build/test/deploy.

## Electrical network analysis

The two terminals on every component are graph nodes. Wires union those terminals into equipotential nets; visual placement never changes the graph. Resistive edges form a conductance matrix; cells use 0.2 Ω Thevenin internal resistance expressed in Norton form. A pinned reference net fixes common-mode voltage. Diodes and LEDs use bounded fixed-threshold iterations, not SPICE-level numerical or thermal modelling. Floating islands are regularised with a tiny leakage conductance.

The engine clamps component and wire counts, numerical sizes and values. Potential invalid topologies return warnings; currents above a safe model threshold produce an overload status. Calculated quantities use consistent units (V, A, W, Ω).

## Trust boundary

All input arrives as untrusted local JSON, including a saved circuit and any imported backup. Structural checks occur before imported circuits are fed to the engine. There are no client secrets. Any future cross-device points synchronization must be verified and rate limited by the ChoreQuest backend; do not grant money or verified family points using only a browser-reported achievement.

## Data

Current localStorage key: `hero-academy-circuitquest-v1`. Data format is versioned with active nickname, up to eight profiles, mission attempt records and saved circuits. All data stays on device. No analytics or advertising tracker is included by this app.
