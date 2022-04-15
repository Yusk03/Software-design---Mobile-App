import React, { useLayoutEffect } from "react";
import WebView from "react-native-webview";
import { View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { withTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";

function PaysysWebView(props) {
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  const { colors } = props.theme;

  useLayoutEffect(() => {
    const systemTitle = props.route?.params?.paySystem;
    props.navigation.setOptions({
      title: `${t("paying")} ${t("through")} ${systemTitle}`,
      back: true,
      to: "Paysys",
    });
  }, [isFocused]);

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface }}>
      <WebView
        style={{ backgroundColor: colors.surface }}
        source={{ uri: props.route?.params?.paysysLink }}
        textZoom={100}
      />
    </View>
  );
}

export default withTheme(PaysysWebView);
