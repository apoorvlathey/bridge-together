import { extendTheme, ThemeConfig } from "@chakra-ui/react";

const colors = {
  brand: {
    red: "#F07167",
    redLight: "rgba(240,113,103, 0.6)",
    greenDark: "#48b66e",
    green: "#A7C957",
    greenLight: "rgb(167, 201, 87, 0.7)",
    blue: "#00b4d8",
    blueLight: "#90e0ef",
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
