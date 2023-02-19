import { chainIdToConfig } from "@/config";
import { Button, HStack, Link, useToast, Text } from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import {
  useChainId,
  useNetwork,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { constants } from "ethers";
import ERC20ABI from "@/abis/ERC20.json";

interface Props {
  refetchApproval: () => void;
}

export default function ApproveBtn({ refetchApproval }: Props) {
  const toast = useToast();
  const chainId = useChainId();
  const { chain } = useNetwork();

  const { config } = usePrepareContractWrite({
    address: chainIdToConfig[chainId].testTokenAddress ?? constants.AddressZero,
    abi: ERC20ABI,
    functionName: "approve",
    args: [
      chainIdToConfig[chainId].bridgeTogetherAddress,
      constants.MaxUint256,
    ],
  });

  const { data, write, isLoading } = useContractWrite({
    ...config,
    async onSuccess(data) {
      toast({
        title: "Approval initiated",
        status: "info",
        position: "bottom-right",
        isClosable: true,
        duration: 5_000,
      });
      await data.wait();
      refetchApproval();
      toast({
        title: "Token approved",
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
    },
  });

  const { isLoading: isTransactionPending } = useWaitForTransaction({
    hash: data?.hash,
  });

  return (
    <Button
      mr="1rem"
      bg="brand.blue"
      _hover={{
        bg: "brand.blueLight",
      }}
      color="white"
      onClick={() => write?.()}
      isDisabled={!write}
      isLoading={isLoading || isTransactionPending}
    >
      Approve
    </Button>
  );
}
