import { DarkTheme, DefaultTheme } from "react-native-paper";

export const LightAppTheme = {
  dark: false,
  name: "light",
  mode: "adaptive",
  ...DefaultTheme,
  roundness: 2,
  colors: {
    ...DefaultTheme.colors,
    primary: "#0d6efd",
    accent: "#03DAC6",
    background: "#E5E5E5",
    button: "#2869fc",
    surface: "#FFFFFF",
    card: "#FFFFFF",
    leftMenu: "#f0f0f0",
    red: "#e01919",
    blue: "#5A81F7",
    balancePositive: "#66BB6A",
    balanceNegative: "#EF5350",
    placeholderText: "#485460",
  },
  animation: {
    scale: 1,
  },
};

export const DarkAppTheme = {
  dark: true,
  name: "dark",
  mode: "adaptive",
  ...DarkTheme,
  roundness: 2,
  colors: {
    ...DarkTheme.colors,
    primary: "#2860de", // type some more cool colorx
    accent: "#536DFE",
    background: "#181a20",
    button: "#2860de",
    surface: "#181a20",
    card: "#2c2c3c",
    leftMenu: "#181a20",
    red: "#e02626",
    blue: "#5A81F7",
    balancePositive: "#66BB6A",
    balanceNegative: "#EF5350",
    placeholderText: "#485460",
  },
  animation: {
    scale: 1,
  },
};
