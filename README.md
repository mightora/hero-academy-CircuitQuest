# Hero Academy CircuitQuest: The Spark Isles

A free, local-first electrical circuit adventure for England Year 4 to GCSE. Part of the [Hero Academy](https://heroacademy.app) family.

**Intended site:** https://circuitquest.heroacademy.app  
**Hosting:** GitHub Pages, with DNS provided by Cloudflare (DNS only).  
**Status:** Initial playable development foundation. Not yet a complete 80-mission teaching product or fully verified live deployment.

## What's implemented

- Eight year-band regions (Year 4–11), 80 individually titled curriculum **mission records** with short unique explanations and level codes `CQ4-01` through `CQ11-10`.
- Eight region finales, 40 optional discoverable side-activity records, and seven starter circuits.
- A browser-based two-terminal connection canvas; add, select, connect, disconnect, move, remove and edit components without drag-only controls.
- A topology-aware, nodal DC resistive solver with guarded inputs; series and parallel resistors, 0.2 Ω internal cell resistance, open/closed switches, polarity-sensitive piecewise diodes/LEDs, and simplified buzzer/motor/coil loads.
- Real instrument values in amperes, volts and watts, plus warning messages for shorts and overcurrent.
- Picture and schematic-inspired displays, optional browser read-aloud, local player nicknames, local backup/export and JSON/SVG circuit export.
- An eight-step guided mission screen, including two introductory checks and practical circuit activity.
- GitHub Actions static deployment workflow and automated engine/content checks.

**Important:** Some missions currently reuse an instructional activity shell; mini-games are currently optional discoveries, not complete movement puzzles. AC networks, AC power systems, transformers, motor torque, logic circuits, transistor behaviour, capacitors, magnetic fields and genuine GCSE practical investigations are **not simulated**. Do not treat the 80 narrative mission records as eighty independently quality-assured substantial experiences. The app clearly distinguishes unavailable components.

## Development

Requires Node.js 22+.

```bash
npm install
npm test
npm run build
# serve the dist directory with any static server:
python3 -m http.server 8080 --directory dist
```

Open http://localhost:8080. The production output is in `dist/`; never commit generated `dist` without a reason. Tests exercise topology, electrical maths, invalid circuits, curriculum record counts and basic diode polarity. Browser and device testing still required.

## Custom domain

- Cloudflare record: `circuitquest.heroacademy.app CNAME mightora.github.io`, **DNS only**.
- Custom-domain file: `public/CNAME` copied to `dist/CNAME` during build.
- In GitHub **Settings → Pages**, choose **GitHub Actions** as source and confirm custom domain and HTTPS.
- Open the website and ensure both TLS and its static assets work after the Pages deployment completes.
- The repository workflow must have permission to deploy Pages; this is controlled by repository settings as well as its declared permissions.

## Safety and privacy

Simulation only. Never connect directly to household mains or household wiring. Accounts and network requests are not needed for play. Nicknames, progress and saved inventions remain in your browser until exported. ChoreQuest sync is intentionally **not** implemented without a confirmed secured contract.

## Curriculum and engineering

See [curriculum](docs/CURRICULUM.md), [architecture](docs/ARCHITECTURE.md), [deployment](docs/DEPLOYMENT.md) and [limitations](docs/LIMITATIONS.md). The use of Hero Academy branding follows the existing [BRAND.md](https://github.com/mightora/hero-academy-reading/blob/main/BRAND.md).

## Testing honesty

The GitHub workflow executes `npm test` and then deploys the compiled site if the job succeeds. Check the Actions tab for **actual results**; presence of test code is not a claim that the test suite has passed.

No licence is granted or implied by this README.
