import React, { useLayoutEffect } from "react";
import {
  Alert,
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Card, List, Text, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function HelpView(props) {
  const ourTheme = useTheme();
  const { t } = useTranslation();

  const helpActionsData = [
    {
      name: t("FAQ"),
      icon: "help",
      pressMethod: () => Alert.alert(t("inDevelopment")),
    },
    {
      name: t("justAnotherOption"),
      icon: "help",
      pressMethod: () => Alert.alert(t("inDevelopment")),
    },
    {
      name: t("msgsCreate"),
      icon: "help",
      pressMethod: () => props.navigation.navigate("MsgsNew"),
    },
  ];

  useLayoutEffect(() => {
    props.navigation.setOptions({ color: "#3498D8", fontColor: "white" });
  }, []);

  return (
    <View
      style={[styles.container, { backgroundColor: ourTheme.colors.surface }]}
    >
      <View style={styles.halfBackground} />
      <View style={styles.upperButtons}>
        <Card style={styles.card}>
          {helpActionsData.map((item, idx) => (
            <TouchableOpacity
              key={`opt${idx}`}
              style={styles.upperMenu}
              onPress={item.pressMethod}
            >
              <List.Item
                title={item.name}
                left={() => (
                  <Icon
                    name={item.icon}
                    size={32}
                    color={ourTheme.colors.onSurface}
                  />
                )}
                right={() => (
                  <Icon name={"chevron-right"} size={32} color="#01a699" />
                )}
              />
            </TouchableOpacity>
          ))}
        </Card>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    elevation: 6,
    marginBottom: 10,
    width: "90%",
  },
  container: {
    flex: 1,
    height: "100%",
  },
  halfBackground: {
    alignItems: "center",
    backgroundColor: "#3498DB",
    height: "50%",
    justifyContent: "center",
  },
  upperButtons: {
    alignItems: "center",
    height: "100%",
    justifyContent: "center",
    position: "absolute",
    width: "100%",
  },
  upperMenu: {
    borderRadius: 15,
  },
});
