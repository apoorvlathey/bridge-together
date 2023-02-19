import { Box, Button, Center } from "@chakra-ui/react";
import { useAccount, useSignTypedData, useChainId } from "wagmi";
import { utils } from "ethers";
import { chainIdToConfig } from "@/config";
import { StoredSigData } from "@/types";

interface Props {
  tokenAmount: number | undefined;
  appendNewSig: (sigData: StoredSigData) => void;
}

export default function QueueBtn({ tokenAmount, appendNewSig }: Props) {
  const { address } = useAccount();
  const chainId = useChainId();

  const domain = {
    name: "BridgeTogether",
    chainId,
    verifyingContract: chainIdToConfig[chainId].bridgeTogetherAddress,
  } as const;

  const types = {
    BridgeDetails: [{ name: "amount", type: "uint256" }],
    Bridge: [
      { name: "details", type: "BridgeDetails" },
      { name: "user", type: "address" },
    ],
  };

  const value = {
    details: {
      amount: utils.parseEther((tokenAmount ?? 0).toString()),
    },
    user: address!,
  } as const;

  const { data, isError, isLoading, isSuccess, signTypedData } =
    useSignTypedData({
      domain,
      types,
      value,
      onSuccess(data, args) {
        appendNewSig({
          sig: data,
          user: args.value.user as string,
          amount: (args.value.details as any).amount.toString(),
        });
      },
    });

  return (
    <Center mt="1rem">
      <Button
        bg="brand.blue"
        _hover={{
          bg: "brand.blueLight",
        }}
        color="white"
        isDisabled={!address || !tokenAmount}
        isLoading={isLoading}
        onClick={() => {
          signTypedData();
          // const hashedDomain = utils._TypedDataEncoder.hashDomain(domain);
          // const hashedValue = utils._TypedDataEncoder.from(types).hash(value);
          // const encoded = utils._TypedDataEncoder.encode(domain, types, value);
          // const hashed = utils._TypedDataEncoder.hash(domain, types, value);
          // console.log({ hashedDomain, hashedValue, encoded, hashed });
        }}
      >
        Queue
      </Button>
    </Center>
  );
}
