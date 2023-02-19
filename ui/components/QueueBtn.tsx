import { Box, Button, Center } from "@chakra-ui/react";
import { useAccount, useSignTypedData } from "wagmi";
import { utils } from "ethers";

interface Props {
  tokenAmount: number | undefined;
}

export default function QueueBtn({ tokenAmount }: Props) {
  const { address } = useAccount();

  // GOERLI
  const domain = {
    name: "BridgeTogether",
    chainId: 5,
    verifyingContract: "0x48d076f2ea59EB0797640E65d405496e3B376aF0",
  } as const;

  const types = {
    BridgeDetails: [{ name: "amount", type: "uint256" }],
    Bridge: [
      { name: "details", type: "BridgeDetails" },
      { name: "user", type: "address" },
    ],
  } as const;

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
    });

  return (
    <Center mt="1rem">
      <Button
        bg="white"
        _hover={{
          bg: "whiteAlpha.700",
        }}
        color="black"
        isDisabled={!address || !tokenAmount}
        isLoading={isLoading}
        onClick={() => signTypedData()}
      >
        Queue
      </Button>
      <Box>
        <Box>data: {data}</Box>
        <Box>isError: {isError ? "true" : "false"}</Box>
        <Box>isSuccess: {isSuccess ? "true" : "false"}</Box>
      </Box>
    </Center>
  );
}
