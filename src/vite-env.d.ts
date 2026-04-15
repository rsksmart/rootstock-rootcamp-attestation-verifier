/// <reference types="vite/client" />

interface ImportMetaEnv {
  /**
   * Production site origin for Open Graph / Twitter images at build time, e.g.
   * `https://your-app.vercel.app` (no trailing slash, https only).
   */
  readonly VITE_SITE_URL?: string;
  readonly VITE_WC_PROJECT_ID?: string;
  /**
   * Testnet JSON-RPC URL, e.g. Rootstock RPC Service
   * `https://rpc.testnet.rootstock.io/<api-key>` (see dev.rootstock.io RPC API setup).
   */
  readonly VITE_ROOTSTOCK_TESTNET_RPC?: string;
  /** Mainnet JSON-RPC URL, e.g. `https://rpc.rootstock.io/<api-key>`. */
  readonly VITE_ROOTSTOCK_MAINNET_RPC?: string;
  readonly VITE_EAS_CONTRACT_MAINNET?: string;
  readonly VITE_SCHEMA_UID_MAINNET?: string;
  readonly VITE_EAS_START_BLOCK_MAINNET?: string;
  readonly VITE_RAS_ATTESTATION_BASE_MAINNET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
