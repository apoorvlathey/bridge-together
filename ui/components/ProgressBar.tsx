import { useState } from "react";
import { Box, Progress, Text } from "@chakra-ui/react";

export default function ProgressBar({ tokenName }: { tokenName: string }) {
  const [tokenPooled, setTokenPooled] = useState(400);

  const targetPoolAmount = 1000;

  return (
    <Box pt="1.5rem" w="100%">
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
  );
}
