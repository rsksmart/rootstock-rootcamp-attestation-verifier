/**
 * Wallet / network guidance shown when EAS config is missing for the active chain.
 */
export function unsupportedHallOfFameMessage(chainId: number): string {
  if (chainId === 30) {
    return "You are on Rootstock Mainnet, but this build could not load EAS config for chain 30. Redeploy from the latest portal code, or set VITE_SCHEMA_UID_MAINNET / VITE_EAS_START_BLOCK_MAINNET only if you use a custom schema. For reliable Hall of Fame indexing, set VITE_ROOTSTOCK_MAINNET_RPC (supports eth_getLogs). Or switch to Rootstock Testnet (chain 31).";
  }
  return "Switch to Rootstock Testnet (chain 31) or Rootstock Mainnet (chain 30) for the Builder Rootcamp Hall of Fame.";
}
