import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { fallback, http, type Transport } from "viem";
import {
  getRootstockMainnetRpcUrls,
  getRootstockTestnetRpcUrls,
} from "@/lib/rootstockRpcUrls";
import { rootstockMainnet } from "@/lib/utils/RootstockMainnet";
import { rsktestnet } from "@/lib/utils/RootstockTestnet";

const RPC_TIMEOUT_MS = 30_000;

/**
 * RainbowKit's default `http()` transport only uses one URL per chain. Use the
 * same ordered fallback list as EAS reads so `eth_getBalance` (wallet popup)
 * succeeds when the primary RPC errors or rate-limits.
 */
function transportFromRpcUrls(urls: string[]): Transport {
  if (urls.length === 0) return http();
  if (urls.length === 1) return http(urls[0], { timeout: RPC_TIMEOUT_MS });
  return fallback(
    urls.map((url) => http(url, { timeout: RPC_TIMEOUT_MS })),
  );
}

export const rainbowkitConfig = getDefaultConfig({
  appName: "Builder Rootcamp Verifier",
  projectId: import.meta.env.VITE_WC_PROJECT_ID ?? "",
  /** Testnet first so the default Builder Rootcamp schema (31) loads without switching. */
  chains: [rsktestnet, rootstockMainnet],
  transports: {
    [rsktestnet.id]: transportFromRpcUrls(getRootstockTestnetRpcUrls()),
    [rootstockMainnet.id]: transportFromRpcUrls(getRootstockMainnetRpcUrls()),
  },
});
