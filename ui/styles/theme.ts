import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const colors = {
  brand: {
    red: "#F07167",
    green: "#A7C957",
    bg: "#FED9B7",
  },
};

const fonts = {
  brand: "Poppins",
};

const config: ThemeConfig = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

const customTheme = extendTheme({
  styles: {
    global: {
      body: {
        bg: "brand.bg",
        fontFamily: "Poppins",
        color: "white",
      },
    },
  },
  config,
  colors,
  fonts,
});

export default customTheme;
