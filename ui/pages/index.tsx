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
  useToast,
  Link,
  HStack,
  Text,
  Box,
  Progress,
  ToastId,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { useChainId, useAccount, useContractRead } from "wagmi";
import { goerli } from "wagmi";
import { polygonMumbai } from "wagmi/chains";
import { BigNumber } from "ethers";
import { formatEther, parseEther } from "ethers/lib/utils.js";
import axios from "axios";
import { poll } from "poll";
import Layout from "@/components/Layout";
import TokenInput from "@/components/TokenInput";
import ProgressBar from "@/components/ProgressBar";
import QueueBtn from "@/components/QueueBtn";
import { ChainSigData } from "@/types";
import ERC20ABI from "@/abis/ERC20.json";
import { chainIdToConfig } from "@/config";
import ApproveBtn from "@/components/ApproveBtn";

const storageKey = "bridge-together-sigdata";

const goerliGraphUrl =
  "https://api.thegraph.com/subgraphs/name/connext/nxtp-amarok-runtime-v0-goerli";
const mumbaiGraphUrl =
  "https://api.thegraph.com/subgraphs/name/connext/nxtp-amarok-runtime-v0-mumbai";

const Home: NextPage = () => {
  const chainId = useChainId();
  const { address } = useAccount();
  const toast = useToast();
  const toastIdRef = React.useRef<ToastId>();

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

  const [transferId, setTransferId] = useState<string>();
  const [pendingTargetTx, setPendingTargetTx] = useState(false);
  const [targetTxHash, setTargetTxHash] = useState<string>();

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

  const storeTransferId = async (txHash: string) => {
    poll(
      async () => {
        let tid: string | undefined;

        try {
          tid = await getTransferId(txHash);
          setTransferId(tid);
        } catch (e: any) {}
      },
      5000,
      () => {
        console.log(!!transferId);
        return !!transferId; // FIXME: stop polling
      }
    );
  };

  const getTransferId = async (txHash: string): Promise<string> => {
    const res = await axios({
      method: "post",
      url: goerliGraphUrl,
      data: {
        operationName: "originTransfers",
        query: `{
            originTransfers(
              where: {
                transactionHash: "${txHash}"
              }
            ) {
              # Meta Data
              chainId
              transferId
              nonce
              to
              delegate
              receiveLocal
              callData
              slippage
              originSender
              originDomain
              destinationDomain
              # Asset Data
              asset {
                id
                adoptedAsset
                canonicalId
                canonicalDomain
              }
              bridgedAmt
              normalizedIn
              status
              transactionHash
              timestamp
            }
          }`,
        variables: {},
      },
    });

    return res.data.data.originTransfers[0].transferId as string;
  };

  const getTargetTxHash = async (transferId: string): Promise<string> => {
    const res = await axios({
      method: "post",
      url: mumbaiGraphUrl,
      data: {
        operationName: "destinationTransfers",
        query: `{
          destinationTransfers(
            where: {
              transferId: "${transferId}"
            }
          ) {
            # Meta Data
            chainId
            transferId
            nonce
            to
            delegate
            receiveLocal
            callData
            slippage
            originSender
            originDomain
            destinationDomain
            # Asset Data
            asset {
              id
            }
            bridgedAmt
            # Executed event Data
            status
            routers {
              id
            }
            # Executed Transaction
            executedCaller
            executedTransactionHash
            executedTimestamp
            executedGasPrice
            executedGasLimit
            executedBlockNumber
            # Reconciled Transaction
            reconciledCaller
            reconciledTransactionHash
            reconciledTimestamp
            reconciledGasPrice
            reconciledGasLimit
            reconciledBlockNumber
          }
        }`,
        variables: {},
      },
    });

    return res.data.data.destinationTransfers[0]
      .executedTransactionHash as string;
  };

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

  useEffect(() => {
    if (transferId) {
      poll(
        async () => {
          let hash: string | undefined;

          try {
            hash = await getTargetTxHash(transferId);
            setPendingTargetTx(false);
            setTargetTxHash(hash);
          } catch (e: any) {}
        },
        5000,
        () => {
          console.log(!!targetTxHash);
          return !!targetTxHash; // FIXME: stop polling
        }
      );
    }
  }, [transferId]);

  useEffect(() => {
    if (pendingTargetTx) {
      toastIdRef.current = toast({
        title: "Bridging Initiated",
        description: (
          <Box>
            <Center fontWeight={"bold"}>
              ⌛ Waiting for tokens to reach target chain...
            </Center>
            <Progress isIndeterminate />
          </Box>
        ),
        status: "info",
        position: "bottom-right",
        isClosable: true,
        duration: 200_000,
      });
    } else {
      if (toastIdRef.current) {
        toast.close(toastIdRef.current);
      }
    }
  }, [pendingTargetTx, toastIdRef]);

  useEffect(() => {
    if (targetTxHash) {
      toast({
        title: "Bridged Successfully to target chain",
        description: (() => {
          const targetChain = chainId === goerli.id ? polygonMumbai : goerli;

          return (
            <Link
              href={`${targetChain.blockExplorers.etherscan.url}/tx/${targetTxHash}`}
              isExternal
            >
              <HStack>
                <Text>View on {targetChain.blockExplorers.etherscan.name}</Text>
                <ExternalLinkIcon />
              </HStack>
            </Link>
          );
        })(),
        status: "success",
        position: "bottom-right",
        isClosable: true,
        duration: 10_000,
      });
    }
  }, [targetTxHash]);

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
            storeTransferId={storeTransferId}
            setPendingTargetTx={setPendingTargetTx}
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
