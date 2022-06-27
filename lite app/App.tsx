import React from "react";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { persistor, store } from "./src/redux/store";
import { colors } from "./src/styles";
import AppView from "./src/modules/AppView";
import AppContextProvider from "./src/modules/AppContextProvider";

export default function App() {
  return (
    <AppContextProvider>
      <SafeAreaProvider>
        <Provider store={store}>
          <PersistGate
            loading={
              // eslint-disable-next-line react/jsx-wrap-multilines
              <View style={styles.container}>
                <ActivityIndicator color={colors.secondary} />
              </View>
            }
            persistor={persistor}
          >
            <AppView />
          </PersistGate>
        </Provider>
      </SafeAreaProvider>
    </AppContextProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    backgroundColor: "white",
    flex: 1,
    justifyContent: "center",
  },
});
