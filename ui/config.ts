import { chain } from "wagmi";

export const supportedChains = [chain.mainnet, chain.polygon];

export const chainIdToRPC = {
  [chain.mainnet.id]: process.env.NEXT_PUBLIC_MAINNET_RPC_URL,
  [chain.polygon.id]: process.env.NEXT_PUBLIC_POLYGON_RPC_URL,
};
