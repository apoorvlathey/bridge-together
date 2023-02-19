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
  HStack,
} from "@chakra-ui/react";
import { useChainId, useAccount, useContractRead } from "wagmi";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import Layout from "@/components/Layout";
import TokenInput from "@/components/TokenInput";
import ProgressBar from "@/components/ProgressBar";
import QueueBtn from "@/components/QueueBtn";
import { ChainSigData } from "@/types";
import ERC20ABI from "@/abis/ERC20.json";
import { chainIdToConfig } from "@/config";
import ApproveBtn from "@/components/ApproveBtn";

const storageKey = "bridge-together-sigdata";

const Home: NextPage = () => {
  const chainId = useChainId();
  const { address } = useAccount();

  const appendNewSig = (sigData: ChainSigData) => {
    const currentSigs = getStoredSigs();
    currentSigs.push(sigData);
    storeSig(currentSigs);
  };

  const clearStoredSigs = () => {
    storeSig([]);
  };

  const getStoredSigs = (): ChainSigData[] => {
    const _storedSigData = localStorage.getItem(storageKey);
    const _formatted = _storedSigData ? JSON.parse(_storedSigData) : {};
    return _formatted[chainId] ?? [];
  };

  const storeSig = (newSigData: ChainSigData[]) => {
    setStoredSigs(newSigData);

    const _storedSigData = localStorage.getItem(storageKey);
    const _formatted = _storedSigData ? JSON.parse(_storedSigData) : {};

    localStorage.setItem(
      storageKey,
      JSON.stringify({
        ..._formatted,
        [chainId]: newSigData,
      })
    );
  };

  const [isApproved, setIsApproved] = useState(true);
  const [tokenAmount, setTokenAmount] = useState<number>();
  const [storedSigs, setStoredSigs] = useState<ChainSigData[]>();

  const {
    data: allowance,
    isError,
    isLoading,
    refetch,
  } = useContractRead({
    address: chainIdToConfig[chainId].testTokenAddress,
    abi: ERC20ABI,
    functionName: "allowance",
    args: [address, chainIdToConfig[chainId].bridgeTogetherAddress],
    enabled: !!address,
  });

  useEffect(() => {
    setStoredSigs(getStoredSigs());
  }, [chainId]);

  useEffect(() => {
    if (address) {
      refetch();
    }
  }, [address, chainId]);

  useEffect(() => {
    if (allowance) {
      if (tokenAmount) {
        setIsApproved(
          (allowance as BigNumber).gte(parseEther(tokenAmount.toString()))
        );
      }
    }
  }, [allowance, tokenAmount]);

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
          <ProgressBar
            tokenName="TEST"
            storedSigs={storedSigs}
            clearStoredSigs={clearStoredSigs}
          />
          <Container maxW="20rem">
            <TokenInput
              tokenName="TEST"
              tokenAmount={tokenAmount}
              setTokenAmount={setTokenAmount}
            />
            <Center mt="1rem">
              {!isApproved && <ApproveBtn refetchApproval={refetch} />}
              <QueueBtn
                tokenAmount={tokenAmount}
                appendNewSig={appendNewSig}
                isApproved={isApproved}
              />
            </Center>
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
