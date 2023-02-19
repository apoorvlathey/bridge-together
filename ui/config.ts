import { goerli } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

export const supportedChains = [goerli, polygonMumbai];

export const chainIdToRPC = {
  [goerli.id]: process.env.NEXT_PUBLIC_GOERLI_RPC_URL,
  [polygonMumbai.id]: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL,
};
