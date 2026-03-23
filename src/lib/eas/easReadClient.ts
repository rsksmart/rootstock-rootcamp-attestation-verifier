import { createPublicClient, fallback, http, type PublicClient } from "viem";
import { rootstock } from "viem/chains";
import { rsktestnet } from "@/lib/utils/RootstockTestnet";

/**
 * Ordered RPC URLs for EAS reads only.
 *
 * - **First:** `VITE_ROOTSTOCK_*_RPC` via [Rootstock RPC Service](https://dev.rootstock.io/developers/rpc-api/rootstock/setup/)
 *   testnet URL `https://rpc.testnet.rootstock.io/<api-key>` (API key in the path).
 * - **Fallbacks:** dRPC, then `public-node.*.rsk.co` (often **no** `eth_getLogs`, JSON-RPC -32601).
 *
 * @see https://dev.rootstock.io/node-operators/public-nodes/
 */
const TESTNET_EAS_READ_URLS = [
  import.meta.env.VITE_ROOTSTOCK_TESTNET_RPC?.trim(),
  "https://rootstock-testnet.drpc.org",
  "https://public-node.testnet.rsk.co",
].filter((u): u is string => Boolean(u));

const MAINNET_EAS_READ_URLS = [
  import.meta.env.VITE_ROOTSTOCK_MAINNET_RPC?.trim(),
  "https://rootstock.drpc.org",
  "https://public-node.rsk.co",
].filter((u): u is string => Boolean(u));

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
