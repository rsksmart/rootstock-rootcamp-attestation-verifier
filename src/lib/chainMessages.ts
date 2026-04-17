/**
 * Wallet / network guidance shown when EAS config is missing for the active chain.
 */
export function unsupportedHallOfFameMessage(chainId: number): string {
  if (chainId === 30) {
    return "You are connected to Rootstock Mainnet, but this Hall of Fame is not ready on mainnet for this deployment yet. Please switch to Rootstock Testnet or try again after the next update.";
  }
  return "Please switch to Rootstock Testnet or Rootstock Mainnet to view the Builder Rootcamp Hall of Fame.";
}
