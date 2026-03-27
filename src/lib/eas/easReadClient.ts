import { createPublicClient, fallback, http, type PublicClient } from "viem";
import { rootstock } from "viem/chains";
import {
  getRootstockMainnetRpcUrls,
  getRootstockTestnetRpcUrls,
} from "@/lib/rootstockRpcUrls";
import { rsktestnet } from "@/lib/utils/RootstockTestnet";

/**
 * Ordered RPC URLs (shared with Wagmi transports in `rainbowkitConfig.ts`).
 *
 * - **First:** `VITE_ROOTSTOCK_*_RPC` via [Rootstock RPC Service](https://dev.rootstock.io/developers/rpc-api/rootstock/setup/)
 * - **Fallbacks:** dRPC, then `public-node.*.rsk.co` (often **no** `eth_getLogs`, JSON-RPC -32601).
 *
 * @see https://dev.rootstock.io/node-operators/public-nodes/
 */
const TESTNET_EAS_READ_URLS = getRootstockTestnetRpcUrls();
const MAINNET_EAS_READ_URLS = getRootstockMainnetRpcUrls();

/**
 * JSON-RPC client for `getLogs` / `getAttestation` / `multicall`, independent of the
 * wallet’s provider so log scans use a fallback-capable URL list.
 */
export function createEasPublicClient(chainId: number): PublicClient | null {
  if (chainId === 31) {
    return createPublicClient({
      chain: rsktestnet,
      transport: fallback(
        TESTNET_EAS_READ_URLS.map((url) => http(url, { timeout: 60_000 })),
      ),
    });
  }
  if (chainId === 30) {
    return createPublicClient({
      chain: rootstock,
      transport: fallback(
        MAINNET_EAS_READ_URLS.map((url) => http(url, { timeout: 60_000 })),
      ),
    });
  }
  return null;
}
