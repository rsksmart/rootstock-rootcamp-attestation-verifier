import { defineChain } from "viem";
import { rootstock as rootstockViem } from "viem/chains";

/**
 * Rootstock mainnet with RPC fallbacks aligned to EAS read client.
 * Prefer {@link https://dev.rootstock.io/developers/rpc-api/rootstock/setup/ Rootstock RPC Service}
 * via `VITE_ROOTSTOCK_MAINNET_RPC` for `eth_getLogs` (public-node may omit it).
 */
export const rootstockMainnet = defineChain({
  ...rootstockViem,
  rpcUrls: {
    default: {
      http: [
        import.meta.env.VITE_ROOTSTOCK_MAINNET_RPC?.trim(),
        "https://rootstock.drpc.org",
        "https://public-node.rsk.co",
      ].filter((u): u is string => Boolean(u)),
    },
  },
});
