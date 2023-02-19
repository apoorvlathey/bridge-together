import { useEffect, useState } from "react";
import { Button, Flex, HStack, Link, useToast, Text } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  usePrepareContractWrite,
  useContractWrite,
  useChainId,
  useWaitForTransaction,
  usePrepareSendTransaction,
  useSendTransaction,
  useNetwork,
} from "wagmi";
import { BigNumber, constants, ethers, utils } from "ethers";
import { parseEther } from "ethers/lib/utils.js";
import { chainIdToConfig } from "@/config";
import BridgeTogetherABI from "@/abis/BridgeTogether.json";
import { ChainSigData } from "@/types";

export default function BridgeBtn({
  storedSigs,
  clearStoredSigs,
  storeTransferId,
  setPendingTargetTx,
}: {
  storedSigs: ChainSigData[] | undefined;
  clearStoredSigs: () => void;
  storeTransferId: (txHash: string) => Promise<void>;
  setPendingTargetTx: (value: boolean) => void;
}) {
  const toast = useToast();
  const chainId = useChainId();
  const { chain } = useNetwork();

  const { config } = usePrepareContractWrite({
    address:
      chainIdToConfig[chainId].bridgeTogetherAddress ?? constants.AddressZero,
    abi: BridgeTogetherABI,
    functionName: "bridge",
    args: [
      storedSigs!.map(({ amount, user, sig: signature }) => ({
        bridge: {
          details: {
            amount,
          },
          user,
        },
        signature,
      })),
      chainIdToConfig[chainId].targetChainConnextId,
    ],
    overrides: {
      value: parseEther("0.0001"),
    },
    enabled: !!storedSigs,
  });

  const { data, write, isLoading } = useContractWrite({
    ...config,
    async onSuccess(data) {
      toast({
        title: "Transaction initiated",
        status: "info",
        position: "bottom-right",
        isClosable: true,
        duration: 5_000,
      });
      await data.wait();
      clearStoredSigs();
      toast({
        title: "Transaction confirmed on source chain",
        description: (
          <Link
            href={`${chain!.blockExplorers!.etherscan.url}/tx/${data.hash}`}
            isExternal
          >
            <HStack>
              <Text>View on {chain!.blockExplorers!.etherscan.name}</Text>
              <ExternalLinkIcon />
            </HStack>
          </Link>
        ),
        status: "success",
        position: "bottom-right",
        isClosable: true,
        duration: 10_000,
      });
      storeTransferId(data.hash);
      setPendingTargetTx(true);
    },
  });

  const { isLoading: isTransactionPending } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <Flex flex="1" pl="1rem">
      <Button
        bg="brand.greenDark"
        _hover={{
          bg: "green.300",
        }}
        color="white"
        shadow={"lg"}
        onClick={() => write?.()}
        isDisabled={!write}
        isLoading={isLoading || isTransactionPending}
      >
        Bridge!
      </Button>
    </Flex>
  );
}
