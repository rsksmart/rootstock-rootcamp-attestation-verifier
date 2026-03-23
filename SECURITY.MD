# Security

## Reporting issues

Report sensitive issues responsibly:

- Email **security@rootstocklabs.com**, or  
- Use GitHub **Security → Report a vulnerability** on this repository (if enabled).

Do not open public issues for undisclosed vulnerabilities.

## Frontend / Vite exposure

- All `VITE_*` environment variables are **embedded in the client JavaScript** at build time. Anyone can read them in the shipped bundle.
- **Rootstock RPC URLs** that include an API key in the path are therefore visible to users. Mitigate by:
  - Using provider dashboards to **restrict keys** by HTTP referrer, origin, or IP where supported.
  - Rotating keys if they leak.
- **WalletConnect (`VITE_WC_PROJECT_ID`)** is intended to be public; still avoid sharing project settings beyond what Reown documents.

## Vercel environment scoping

- Use **Production** env for live domain values (`VITE_SITE_URL`, production RPC keys, mainnet schema UID / start block).
- **Preview** deployments inherit Preview env; omit or use separate Preview RPC keys if you want to limit quota or avoid sharing production keys on every PR.
- Remember: changing `VITE_*` requires a **new build** — env edits do not affect already-built static assets.

## Repository hygiene

- Enable branch protection on `main` (required reviews, required status checks) if this repo is organization-owned.
- Run `npm audit` regularly and upgrade dependencies when practical; prefer lockfile-committed installs in CI.

## Data handling

- Search input is **length-capped and sanitized** (`src/lib/search.ts`) before use.
- **Attestation UIDs** are stored in **browser `localStorage`** per wallet + chain to reload “My attestations” without pasting the UID again. Users on shared devices should be aware this is not a secret store.

## Deployment headers

`vercel.json` sets conservative headers for the static SPA. Adjust if you embed the app in an iframe (today `X-Frame-Options: DENY` prevents that).

Vercel also applies **HTTPS** and **HSTS** for `*.vercel.app` and can be configured for custom domains in the project dashboard — no duplicate HSTS header is set in this repo.

## Content Security Policy

A strict **CSP** is not shipped by default: WalletConnect, RainbowKit, and RPC providers load scripts and connect to many origins. Tightening CSP would require an explicit allowlist and ongoing maintenance. If you add CSP, test wallet connection and network switching thoroughly.
