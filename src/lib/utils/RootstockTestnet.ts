import { defineChain } from "viem";
import { getRootstockTestnetRpcUrls } from "@/lib/rootstockRpcUrls";

/** For `eth_getLogs`, prefer Rootstock RPC Service: `https://rpc.testnet.rootstock.io/<api-key>`. */
export const rsktestnet = defineChain({
  id: 31,
  name: "Rootstock Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "Rootstock Smart Bitcoin",
    symbol: "tRBTC",
  },
  rpcUrls: {
    default: {
      http: getRootstockTestnetRpcUrls(),
    },
  },
  blockExplorers: {
    default: {
      name: "Rootstock Explorer",
      url: "https://explorer.testnet.rootstock.io",
    },
  },
  contracts: {
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 2771150,
    },
  },
});
