/**
 * Wallet / network guidance shown when EAS config is missing for the active chain.
 */
export function unsupportedHallOfFameMessage(chainId: number): string {
  if (chainId === 30) {
    return "You are on Rootstock Mainnet, but this deployment has no mainnet Hall of Fame config yet. In Vercel: Project Settings, Environment Variables (Production). Set VITE_SCHEMA_UID_MAINNET and VITE_EAS_START_BLOCK_MAINNET from your RAS schema on the mainnet explorer, plus VITE_ROOTSTOCK_MAINNET_RPC for reliable eth_getLogs. Redeploy. Or switch to Rootstock Testnet (chain 31) for the default Builder Rootcamp cohort.";
  }
  return "Switch to Rootstock Testnet (chain 31) for the default Builder Rootcamp Hall of Fame, or set mainnet variables in Vercel and redeploy.";
}
