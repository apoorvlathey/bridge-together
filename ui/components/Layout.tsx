import { Box } from "@chakra-ui/react";
import React from "react";
import Navbar from "./Navbar";

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box pb="10rem">
      <Navbar />
      {children}
    </Box>
  );
}

export default Layout;
