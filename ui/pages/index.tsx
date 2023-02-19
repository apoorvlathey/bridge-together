import type { NextPage } from "next";
import Head from "next/head";
import React, { useState } from "react";
import { Center, VStack, Heading, Container } from "@chakra-ui/react";
import Layout from "@/components/Layout";
import TokenInput from "@/components/TokenInput";
import ProgressBar from "@/components/ProgressBar";
import QueueBtn from "@/components/QueueBtn";
import { StoredSigData } from "@/types";

const storageKey = "bridge-together-sigdata";

const Home: NextPage = () => {
  const [tokenAmount, setTokenAmount] = useState<number>();

  const appendNewSig = (sigData: StoredSigData) => {
    const currentSigs = getStoredSigs();
    currentSigs.push(sigData);
    storeSig(currentSigs);
  };

  const getStoredSigs = (): StoredSigData[] => {
    const _storedSigData = localStorage.getItem(storageKey);
    return _storedSigData ? JSON.parse(_storedSigData) : [];
  };

  const storeSig = (newSigData: StoredSigData[]) => {
    localStorage.setItem(storageKey, JSON.stringify(newSigData));
  };

  return (
    <Layout>
      <Head>
        <title>BridgeTogether</title>
      </Head>
      <Center flexDir="column">
        <VStack spacing="2rem">
          <Heading
            mt="4rem"
            fontSize="4xl"
            color="brand.red"
            textTransform={"uppercase"}
            fontWeight="extrabold"
          >
            Bridge Together
          </Heading>
          <ProgressBar tokenName="DAI" />
          <Container maxW="20rem">
            <TokenInput
              tokenName="DAI"
              tokenAmount={tokenAmount}
              setTokenAmount={setTokenAmount}
            />
            <QueueBtn tokenAmount={tokenAmount} appendNewSig={appendNewSig} />
          </Container>
        </VStack>
      </Center>
    </Layout>
  );
};

export default Home;
