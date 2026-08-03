# CryptoTray

Desktop system-tray application to monitor cryptocurrency prices in USD and BRL. The goal is to provide a fast glance at a personal watchlist — no account, no backend server, no custody.

> Prices are informational and provided by the public CoinGecko API. This app does not provide financial advice. Do not rely on it as the sole source for trading decisions.

## Product overview

CryptoTray solves a simple problem: quickly view current price and 24h change for a small set of cryptocurrencies without keeping a traditional app window open.

Key features:

- Toggle the app window via the system tray icon.
- Closing the window keeps the app running in the tray; use the `Quit` menu item to exit.
- Add/remove assets by name or symbol; watchlist order is preserved.
- View prices in USD or BRL and see 24-hour percentage change.
- Manual refresh via tray menu or auto-refresh at 30s, 1m, 2m or 5m intervals.
- Optional "start with system" (autostart) integration via Tauri plugin.
- Preferences (currency, refresh interval and watchlist) persist locally.

Defaults: watchlist = `bitcoin`, currency = `usd`, refresh interval = 60s.

## Scope & assumptions

- The app is read-only: it fetches market data. It does not authenticate users, custody assets or talk to exchanges.
- No backend, no remote storage and no cross-device sync.
- Data availability, freshness and asset coverage depend on CoinGecko and the user's network.
- "Live" is implemented via periodic HTTP polling, not a streaming WebSocket feed.
- USD and BRL are fetched with separate requests; if the BRL request fails the BRL price may be 0 while USD succeeds.
- The search endpoint returns up to 10 results; queries are debounced by 400ms.
- The UI surfaces API rate-limit (HTTP 429) and network errors but there is no automatic retry, advanced backoff or price caching.

## Architecture

This is a Tauri v2 application where a React + TypeScript frontend runs inside a native WebView and Rust handles tray integration and native services.

Architecture sketch:

React + TypeScript (src/)
  |-- UI, state and localStorage
  |-- HTTP fetches to api.coingecko.com
  v
Tauri WebView
  |-- events / IPC
  v
Rust (src-tauri/)
  |-- system tray and window lifecycle
  |-- autostart integration via plugin
  v
OS

Responsibility map:

- UI & orchestration: src/App.tsx
- CoinGecko client: src/api.ts
- Persistence: src/storage.ts (localStorage key `cryptotray_prefs`)
- Types and defaults: src/types.ts
- Components: src/components/
- Native runtime and commands: src-tauri/src/lib.rs
- Tray and positioning: src-tauri/src/tray.rs

## Data & privacy

External requests (runtime): calls to https://api.coingecko.com/api/v3

- GET /coins/markets — prices (USD/BRL), 24h change, name, symbol, image
- GET /search — search results for adding assets

No API key is configured in the codebase.

Local storage:

Preferences are stored in localStorage under `cryptotray_prefs` and look like:

```json
{
  "currency": "usd",
  "refreshInterval": 60,
  "watchlist": ["bitcoin"]
}
```

Autostart state is controlled by the OS via the Tauri autostart plugin. Clearing localStorage resets preferences but may not disable autostart.

The app does not collect telemetry, credentials, wallets or private keys. Calls to CoinGecko are subject to that provider's privacy and logging policies.

## Development requirements

- Node.js 20+ (CI uses Node 20)
- npm
- Rust stable (>= 1.77.2 as in src-tauri/Cargo.toml)
- Native build prerequisites for Tauri on each OS

Linux build dependencies (CI): libwebkit2gtk-4.1-dev, libgtk-3-dev, libayatana-appindicator3-dev, librsvg2-dev, patchelf. See Tauri docs for full details.

## Quick start

```bash
git clone <repo>
cd client-live-prices
npm ci
npm run tauri:dev
```

`npm run tauri:dev` runs Vite and launches the Tauri app. The window may remain hidden until toggled from the tray.

To run only the web UI:

```bash
npm run dev
```

Note: features that rely on the native runtime (tray, autostart) are unavailable in the pure web mode.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server (web UI) |
| `npm run start` / `npm run tauri:dev` | Start Tauri in dev mode |
| `npm run build` | Type-check then build web bundle |
| `npm run tauri:build` / `npm run package` | Produce native installers |
| `npm run lint` | Run Oxlint rules |
| `npm run typecheck` | Run TypeScript build (no emit) |
| `npm run tauri:check` | Run `cargo check` for Rust code |

Before submitting changes, run:

```bash
npm run lint
npm run typecheck
npm run tauri:check
```

## Build & distribution

Run `npm run tauri:build` to generate platform bundles. Output artifacts are in `src-tauri/target/release/bundle/`.

CI: GitHub Actions workflow at `.github/workflows/build.yml` builds Windows and Linux artifacts and uploads installers as job artifacts.

The CI job installs Node deps with `npm ci` and calls `npx tauri build`.

## Security notes

- Tauri capabilities are configured in `src-tauri/capabilities/default.json`. Avoid granting extra permissions unless needed.
- Content Security Policy is currently disabled (`"csp": null`) in `src-tauri/tauri.conf.json`. Before publishing, define a strict CSP that only allows necessary origins (CoinGecko and image hosts).
- Do not commit secrets. If an authenticated API is used later, document secret provisioning via environment variables and CI secrets.

## Contribution guidelines

- Keep TypeScript types in `src/types.ts` and centralize HTTP calls in `src/api.ts`.
- Keep native code separate under `src-tauri/` and communicate via explicit Tauri commands/events.
- Update `package-lock.json` and `Cargo.lock` when bumping deps.

## Repository layout

```
.
|-- src/                         # React + TypeScript app
|   |-- components/              # UI components
|   |-- api.ts                   # CoinGecko client
|   |-- storage.ts               # localStorage helper
|   `-- types.ts                 # shared types and defaults
|-- src-tauri/                   # Rust native runtime and metadata
|   |-- capabilities/            # Tauri permissions
|   |-- icons/                   # platform icons
|   `-- src/                     # native code (tray, commands)
|-- .github/workflows/build.yml  # CI build + artifacts
|-- package.json                 # scripts and JS deps
`-- vite.config.ts               # Vite configuration
```

## Known limitations & roadmap

- No streaming/real-time sockets; data is polled and may differ from exchange order books.
- No advanced retry/backoff or caching of price responses.
- Tray window positioning uses heuristics for top/bottom taskbars; multi-monitor or left/right taskbar cases may need refinement.
- CI targets Windows and Linux; macOS builds need validation and signing setup.
- No license file found in the repo. Add a LICENSE before redistributing.

## References

- Tauri v2: https://v2.tauri.app/
- React: https://react.dev/
- Vite: https://vite.dev/
- CoinGecko API docs: https://docs.coingecko.com/
