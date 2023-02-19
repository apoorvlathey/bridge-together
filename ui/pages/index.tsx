import type { NextPage } from "next";
import Head from "next/head";
import React, { useState, useEffect } from "react";
import {
  Center,
  VStack,
  Heading,
  Container,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tbody,
  Box,
} from "@chakra-ui/react";
import Layout from "@/components/Layout";
import TokenInput from "@/components/TokenInput";
import ProgressBar from "@/components/ProgressBar";
import QueueBtn from "@/components/QueueBtn";
import { StoredSigData } from "@/types";
import { formatEther } from "ethers/lib/utils.js";

const storageKey = "bridge-together-sigdata";

const Home: NextPage = () => {
  const appendNewSig = (sigData: StoredSigData) => {
    const currentSigs = getStoredSigs();
    currentSigs.push(sigData);
    storeSig(currentSigs);
    setStoredSigs(currentSigs);
  };

  const getStoredSigs = (): StoredSigData[] => {
    const _storedSigData = localStorage.getItem(storageKey);
    return _storedSigData ? JSON.parse(_storedSigData) : [];
  };

  const storeSig = (newSigData: StoredSigData[]) => {
    localStorage.setItem(storageKey, JSON.stringify(newSigData));
  };

  const [tokenAmount, setTokenAmount] = useState<number>();
  const [storedSigs, setStoredSigs] = useState<StoredSigData[]>();

  useEffect(() => {
    setStoredSigs(getStoredSigs());
  }, []);

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
          <ProgressBar tokenName="DAI" storedSigs={storedSigs} />
          <Container maxW="20rem">
            <TokenInput
              tokenName="DAI"
              tokenAmount={tokenAmount}
              setTokenAmount={setTokenAmount}
            />
            <QueueBtn tokenAmount={tokenAmount} appendNewSig={appendNewSig} />
          </Container>
          <Center width={"50rem"} mt="4rem">
            {storedSigs && (
              <TableContainer width={"50rem"}>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th color="black" fontFamily={"Poppins"}>
                        User
                      </Th>
                      <Th color="black" fontFamily={"Poppins"}>
                        Amount
                      </Th>
                      <Th color="black" fontFamily={"Poppins"}>
                        Signature
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody color="blackAlpha.700" fontFamily={"Poppins"}>
                    {storedSigs.map((sig, i) => (
                      <Tr key={i}>
                        <Td>{sig.user}</Td>
                        <Td>{formatEther(sig.amount)}</Td>
                        <Td>{sig.sig}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </Center>
        </VStack>
      </Center>
    </Layout>
  );
};

export default Home;
