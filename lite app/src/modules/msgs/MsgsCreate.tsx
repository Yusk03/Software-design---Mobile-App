import React, { useLayoutEffect, useRef } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Card, TextInput, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { colors } from "../../styles";
import API from "../../api/api";

export default function MsgsCreateView(props) {
  const { t } = useTranslation();
  const [text, setText] = React.useState({
    subject: "",
    chapter: 3,
    chapterName: "",
    message: "",
  });

  const ourTheme = useTheme();

  useLayoutEffect(() => {
    props.navigation.setOptions({
      back: true,
      to: "msgsRead",
    });
  }, []);

  const refSubject = useRef();
  const refChapter = useRef();
  const refMessage = useRef();

  return (
    <View
      style={[styles.container, { backgroundColor: ourTheme.colors.surface }]}
    >
      <View style={styles.cardContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <TextInput
              ref={refSubject}
              style={styles.input}
              label={t("subject")}
              placeholderTextColor={colors.placeholderText}
              autoCapitalize={"none"}
              onSubmitEditing={() => refChapter.current.focus()}
              onChangeText={(value) => setText({ ...text, subject: value })}
            />
            <TextInput
              ref={refChapter}
              style={styles.input}
              label={t("section")}
              placeholderTextColor={colors.placeholderText}
              autoCapitalize={"none"}
              onSubmitEditing={() => refMessage.current.focus()}
              onChangeText={(value) => setText({ ...text, chapterName: value })}
            />
            <TextInput
              ref={refMessage}
              multiline={true}
              style={styles.input}
              label={t("msg")}
              placeholderTextColor={colors.placeholderText}
              autoCapitalize={"none"}
              numberOfLines={4}
              onChangeText={(value) => setText({ ...text, message: value })}
            />
          </Card.Content>
        </Card>
        <Button
          labelStyle={{ fontSize: 14, color: colors.white }}
          contentStyle={{ paddingVertical: 4 }}
          style={{ width: "100%", borderRadius: 30 }}
          color="#3498DB"
          mode="contained"
          onPress={async () => {
            await API.msgCreate({ ...text });
            Alert.alert(t("congrats"), t("sendedMsgs"));
            props.navigation.navigate("MsgsRead", { update: true });
          }}
        >
          {t("msgsCreate")}
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 15,
    elevation: 6,
    marginBottom: 10,
  },
  cardContainer: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 10,
  },
  container: {
    flex: 1,
    height: "100%",
  },
  input: {
    backgroundColor: "transparent",
    fontFamily: "Roboto",
    fontSize: 18,
    margin: 5,
  },
});
