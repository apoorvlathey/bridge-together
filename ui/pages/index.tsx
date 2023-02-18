import type { NextPage } from "next";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import { Center, Box, VStack, Heading } from "@chakra-ui/react";
import Layout from "../components/Layout";

const Home: NextPage = () => {
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
        </VStack>
      </Center>
    </Layout>
  );
};

export default Home;
