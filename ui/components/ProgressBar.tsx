import { useState } from "react";
import { Box, Center, Progress, Text } from "@chakra-ui/react";
import { StoredSigData } from "@/types";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";

export default function ProgressBar({
  tokenName,
  storedSigs,
}: {
  tokenName: string;
  storedSigs: StoredSigData[] | undefined;
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
    <Center flexDir={"column"} pt="1.5rem" w="100%">
      <Box>
        <Text color="gray.600" fontWeight={"bold"}>
          {tokenName} Pooled: {tokenPooled} / {targetPoolAmount}
        </Text>
        <Progress
          bg="white"
          colorScheme={"green"}
          value={(tokenPooled * 100) / targetPoolAmount}
          h="2rem"
          w="40rem"
          rounded="full"
        />
      </Box>
    </Center>
  );
}
