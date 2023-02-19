import { Box, Center, Flex, HStack, Progress, Text } from "@chakra-ui/react";
import { ChainSigData } from "@/types";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import BridgeBtn from "./BridgeBtn";

export default function ProgressBar({
  tokenName,
  storedSigs,
  clearStoredSigs,
  storeTransferId,
  setPendingTargetTx,
}: {
  tokenName: string;
  storedSigs: ChainSigData[] | undefined;
  clearStoredSigs: () => void;
  storeTransferId: (txHash: string) => Promise<void>;
  setPendingTargetTx: (value: boolean) => void;
}) {
  const tokenPooled =
    storedSigs && storedSigs.length > 0
      ? storedSigs.reduce(
          (sum, sigData) =>
            parseFloat(
              formatEther(
                parseEther(sum.toString()).add(BigNumber.from(sigData.amount))
              )
            ),
          0
        )
      : 0;

  const targetPoolAmount = 1000;

  return (
    <Center pt="1.5rem" w="100%">
      <Flex direction={"row"} alignItems="flex-end">
        <Box>
          <Text color="gray.600" fontWeight={"bold"}>
            {tokenName} Pooled: {tokenPooled} / {targetPoolAmount}
          </Text>
          <Progress
            bg="white"
            colorScheme={"green"}
            value={(tokenPooled * 100) / targetPoolAmount}
            borderBottom="2px solid"
            borderLeft="1px solid"
            borderColor="green.200"
            h="2rem"
            w="40rem"
            rounded="full"
          />
        </Box>
        {tokenPooled >= targetPoolAmount && (
          <BridgeBtn
            storedSigs={storedSigs}
            clearStoredSigs={clearStoredSigs}
            storeTransferId={storeTransferId}
            setPendingTargetTx={setPendingTargetTx}
          />
        )}
      </Flex>
    </Center>
  );
}
