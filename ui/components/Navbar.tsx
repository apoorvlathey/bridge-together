import React from "react";
import { useRouter } from "next/router";
import { Flex, Heading, Spacer } from "@chakra-ui/react";
import WalletLogin from "./WalletLogin";
import SwitchChains from "./SwitchNetwork";

function Navbar() {
  const router = useRouter();

  return (
    <Flex py="4" px={["2", "4", "10", "10"]}>
      <Spacer />
      <SwitchChains />
      <WalletLogin />
    </Flex>
  );
}

export default Navbar;
