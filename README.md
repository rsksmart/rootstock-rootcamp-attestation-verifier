# Builder Rootcamp Attestation Verifier

Open-source **frontend** for the Builder Rootcamp Graduates **Attestation Verifier** and public **Hall of Fame** on [Rootstock](https://rootstock.io/). It reads [Ethereum Attestation Service (EAS)](https://attest.org/) data from [Rootstock RAS](https://explorer.rootstock.io/ras), lets visitors search graduates, and opens a modal with explorer links, QR codes, and optional PNG/PDF export. See also [RAS developer docs](https://dev.rootstock.io/dev-tools/attestations/ras/).

**Thinkific** remains the system of record for official course certificates (PDFs and student records). This app does **not** replace [Thinkific](https://rootstock.thinkific.com/courses/blockchain-dev-course). It helps anyone **verify the same completion on Rootstock** using the shared **credential ID** (e.g. `BR-001`), an attestation UID, or a wallet address.

Deployed as a static **Vite + React** SPA; designed for **[Vercel](https://vercel.com/)**.

## Features

- Public leaderboard of Builder Rootcamp attestations (mainnet by default; Rootstock Testnet still available in the wallet network picker).
- Search by wallet address, name, credential ID, or attestation UID.
- Wallet connect (RainbowKit) and **My attestations** for the connected recipient address (with optional UID memory in `localStorage`).
- Certificate modal: RAS explorer link, QR, branded layout layer, export helpers.
- Security-oriented HTTP headers via `vercel.json` (see [SECURITY.MD](./SECURITY.MD)).

## Stack

- React 18, Vite 5, TypeScript  
- wagmi + viem, RainbowKit  
- Tailwind CSS, Radix UI primitives  

## Prerequisites

- **Node.js** 18 or newer (see `package.json` `engines`)
- npm (this repo uses `package-lock.json`)

## Project setup (local)

1. **Clone** the repository:

   ```shell
   git clone <your-fork-or-upstream-url>
   cd rootcamp-graduate-portal
   ```

2. **Install** dependencies:

   ```shell
   npm install
   ```

3. **Environment file:** copy the example and fill in values:

   ```shell
   cp .env.example .env
   ```

   At minimum set `VITE_WC_PROJECT_ID` from [Reown / WalletConnect Cloud](https://cloud.reown.com/). For reliable `eth_getLogs` (leaderboard indexing), set `VITE_ROOTSTOCK_TESTNET_RPC` using [Rootstock RPC Service](https://dev.rootstock.io/developers/rpc-api/rootstock/setup/). See `.env.example` for all options.

4. **Run the dev server:**

   ```shell
   npm run dev
   ```

   Open the URL Vite prints (usually `http://localhost:5173`).

5. **Production build (sanity check):**

   ```shell
   npm run build
   npm run preview
   ```

6. **Lint:**

   ```shell
   npm run lint
   ```

## Environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `VITE_WC_PROJECT_ID` | Yes (wallets) | WalletConnect project ID. Public in the bundle. |
| `VITE_ROOTSTOCK_TESTNET_RPC` | Strongly recommended | RPC URL with `eth_getLogs` support when visitors switch to Rootstock Testnet (31). |
| `VITE_SCHEMA_UID_TESTNET` | Optional override | Override testnet schema UID when rotating cohorts without shipping code first. |
| `VITE_EAS_START_BLOCK_TESTNET` | Optional override | Decimal block to begin scanning testnet logs for the override schema. |
| `VITE_EAS_CONTRACT_TESTNET` | Optional | Override testnet EAS contract address if needed. |
| `VITE_RAS_ATTESTATION_BASE_TESTNET` | Optional | Override testnet explorer base URL for attestation links. |
| `VITE_SITE_URL` | Recommended for production | HTTPS origin, no trailing slash. Used at **build** time for Open Graph, Twitter cards, and canonical URL. |
| `VITE_SCHEMA_UID_MAINNET` | Optional override | Defaults are baked in for the current graduate schema; set only if you change the on-chain schema without shipping new code. |
| `VITE_EAS_START_BLOCK_MAINNET` | Optional override | Same as above; decimal registration block from the RAS explorer. |
| `VITE_ROOTSTOCK_MAINNET_RPC` | Recommended on mainnet | Same role as testnet RPC for reliable `eth_getLogs` Hall of Fame scans. |
| `VITE_EAS_CONTRACT_MAINNET` | Optional | Override EAS core address if RAS deployments change. |
| `VITE_RAS_ATTESTATION_BASE_MAINNET` | Optional | Override explorer base URL for attestation links. |

User-facing copy about Thinkific vs on-chain verification lives in `src/constants/publicCopy.ts`.

For the current graduate schema (`0x4fbc...fc58`), `completionDate` is stored as a `uint16` year-style value (for example `2026`) and shown in the UI as **Year**.

## Trust and verification (official attester)

Official Builder Rootcamp on-chain attestations are expected to be signed by the wallet in `ROOTCAMP_OFFICIAL_ATTESTER` in [`src/constants/eas.ts`](./src/constants/eas.ts). The footer and certificate modal (“On-chain verification and technical details”) help graduates and support staff compare that address to the `attester` field read from EAS.

## Deploy to Vercel

1. Push this repo to **GitHub** (or GitLab/Bitbucket supported by Vercel).
2. In Vercel: **Add New Project**, import the repo. Framework preset: **Vite**.
3. **Environment Variables:** add the same keys you use locally (`VITE_*`). Use the **Production** environment for your live site. Optionally use **Preview** for PRs with separate RPC keys or without `VITE_SITE_URL` if you do not care about preview OG URLs.
4. **Deploy.** After any change to `VITE_*`, trigger a **new deployment** so the client bundle is rebuilt.
5. **Mainnet/Testnet schemas:** defaults are in `src/constants/eas.ts` for both chains. If you rotate schema before shipping code, set `VITE_SCHEMA_UID_*` + `VITE_EAS_START_BLOCK_*` env overrides and redeploy. Add `VITE_ROOTSTOCK_MAINNET_RPC` and `VITE_ROOTSTOCK_TESTNET_RPC` in Production for reliable indexing.

### Production checklist

- [ ] `VITE_WC_PROJECT_ID` set for Production  
- [ ] `VITE_ROOTSTOCK_TESTNET_RPC` (and mainnet RPC if using chain 30) set for reliable indexing  
- [ ] `VITE_SITE_URL` matches your public HTTPS URL (no trailing slash)  
- [ ] `VITE_ROOTSTOCK_MAINNET_RPC` set in Production if you expect a full mainnet Hall of Fame (optional overrides: schema UID / start block env vars)  
- [ ] If the production attester wallet changes, update `ROOTCAMP_OFFICIAL_ATTESTER` in `src/constants/eas.ts` and redeploy  

## Social / SEO

`index.html` contains placeholders (`__OG_IMAGE__`, `__OG_URL_META__`, `__CANONICAL_LINK__`) that `vite.config.ts` replaces at **build** time when `VITE_SITE_URL` is set.

## Troubleshooting

- **`eth_getLogs` or method not found:** Point `VITE_ROOTSTOCK_*_RPC` at Rootstock RPC Service or another provider that supports log queries.
- **Empty leaderboard on mainnet:** Confirm schema UID and start block exist on Vercel Production and redeploy; wallet on chain 30.
- **Wrong preview when sharing links:** Set `VITE_SITE_URL` to the URL you share and rebuild.

## Project structure

```text
src/
  components/graduates/   # Leaderboard, CertificateModal
  components/ui/tooltip.tsx # Radix tooltips (InfoTip, TermTip)
  constants/eas.ts        # RAS addresses, schema, optional mainnet env merge
  constants/publicCopy.ts # Hero, tooltips, Thinkific vs verifier copy
  hooks/useGraduates.ts
  lib/eas/                # fetchGraduates, easReadClient
  lib/chainMessages.ts    # Guidance when EAS config is missing for the chain
```

## Security

See [SECURITY.MD](./SECURITY.MD).

## Contributing

This is an **open** repository: issues and pull requests are welcome. Keep changes focused, run `npm run lint` and `npm run build` before opening a PR, and avoid committing `.env` or real API keys (`.env` is gitignored).

## License

[MIT](./LICENSE). Copyright (c) RootstockLabs (see file for full text).
