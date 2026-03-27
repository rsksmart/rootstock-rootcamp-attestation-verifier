/**
 * Ordered Rootstock JSON-RPC URLs (env first, then public fallbacks).
 * Shared by Wagmi/RainbowKit transports and the EAS read client so balance
 * and log queries use the same fallback behavior.
 */
export function getRootstockTestnetRpcUrls(): string[] {
  return [
    import.meta.env.VITE_ROOTSTOCK_TESTNET_RPC?.trim(),
    "https://rootstock-testnet.drpc.org",
    "https://public-node.testnet.rsk.co",
  ].filter((u): u is string => Boolean(u));
}

export function getRootstockMainnetRpcUrls(): string[] {
  return [
    import.meta.env.VITE_ROOTSTOCK_MAINNET_RPC?.trim(),
    "https://rootstock.drpc.org",
    "https://public-node.rsk.co",
  ].filter((u): u is string => Boolean(u));
}
