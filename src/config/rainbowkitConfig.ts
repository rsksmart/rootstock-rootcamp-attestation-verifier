import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { rootstockMainnet } from "@/lib/utils/RootstockMainnet";
import { rsktestnet } from "@/lib/utils/RootstockTestnet";

export const rainbowkitConfig = getDefaultConfig({
  appName: "Builder Rootcamp Verifier",
  projectId: import.meta.env.VITE_WC_PROJECT_ID ?? "",
  /** Testnet first so the default Builder Rootcamp schema (31) loads without switching. */
  chains: [rsktestnet, rootstockMainnet],
});
