import { Platform, StatusBar, StyleSheet } from "react-native";

import colors from "./colors";

export default StyleSheet.create({
  safeArea: {
    backgroundColor: colors.white,
    flex: 1,
    paddingTop: Platform.select({ ios: 0, android: StatusBar.currentHeight }),
  },
});
