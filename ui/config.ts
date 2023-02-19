import { goerli } from "wagmi";
import { polygonMumbai } from "wagmi/chains";

export const supportedChains = [goerli, polygonMumbai];

export const chainIdToRPC: {
  [chainId: number]: string;
} = {
  [goerli.id]: process.env.NEXT_PUBLIC_GOERLI_RPC_URL!,
  [polygonMumbai.id]: process.env.NEXT_PUBLIC_MUMBAI_RPC_URL!,
};

export const chainIdToConfig: {
  [chainId: number]: {
    bridgeTogetherAddress: `0x${string}`;
    testTokenAddress: `0x${string}`;
    targetChainConnextId: string;
  };
} = {
  [goerli.id]: {
    bridgeTogetherAddress: "0xf0a3d51006ab104cA0807f5C0c1d75CE20eE12c8",
    testTokenAddress: "0x7ea6eA49B0b0Ae9c5db7907d139D9Cd3439862a1",
    // Mumbai Connext Domain Id
    targetChainConnextId: "9991",
  },
  [polygonMumbai.id]: {
    bridgeTogetherAddress: "0x224D07d7C545034d697074DAb089d997b7B8b7ac",
    testTokenAddress: "0xeDb95D8037f769B72AAab41deeC92903A98C9E16",
    // Goerli Connext Domain Id
    targetChainConnextId: "1735353714",
  },
};
