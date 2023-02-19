import type { NextPage } from "next";
import Head from "next/head";
import React, { useState } from "react";
import { Center, VStack, Heading, Container } from "@chakra-ui/react";
import Layout from "@/components/Layout";
import TokenInput from "@/components/TokenInput";
import ProgressBar from "@/components/ProgressBar";
import QueueBtn from "@/components/QueueBtn";

const Home: NextPage = () => {
  const [tokenAmount, setTokenAmount] = useState<number>();

  return (
    <Layout>
      <Head>
        <title>BridgeTogether</title>
      </Head>
      <Center flexDir="column">
        <VStack spacing="2rem">
          <Heading
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
            <QueueBtn tokenAmount={tokenAmount} />
          </Container>
        </VStack>
      </Center>
    </Layout>
  );
};

export default Home;
