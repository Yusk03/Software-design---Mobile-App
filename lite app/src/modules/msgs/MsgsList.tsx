import React, { useEffect, useLayoutEffect } from "react";
import {
  Alert,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import API from "../../api/api";
import { fonts } from "../../styles";

export default function MsgsReadView(props) {
  const { t } = useTranslation();

  const [msgsList, setMsgs] = React.useState([
    {
      id: 0,
      date: t("noMsgs"),
      chapterId: "",
      subject: "",
      message: "",
      chapterName: "",
      icon: "closed-not-done",
      info: "",
    },
  ]);

  let forceUpdate = props.route?.params?.update;
  const ourTheme = useTheme();

  function getDataAsyncStorage() {
    API.msgsList()
      .then((msgs) => {
        if (msgs instanceof Array && msgs.length > 0) {
          msgs.reverse().map((msg) => {
            msg.info = `${t("msgsRequest")} №${msg.id}`;
            if (msg.state == 0) {
              msg.icon = "opened";
            } else if (msg.state == 2) {
              msg.icon = "closed-done";
            } else if (msg.state == 6) {
              msg.icon = "opened-not-read";
            }
          });
          setMsgs(msgs);
        } else {
          console.log("we caught empty list");
        }
      })
      .catch((e) => {
        console.log(e);
        Alert.alert(e.error, e.message);
      });
  }

  const statuses = {
    opened: "message",
    "opened-in-work": "message-text",
    "opened-not-read": "message-badge",
    "closed-done": "message-star",
    "closed-not-done": "message-text-lock",
  };

  useLayoutEffect(() => {
    props.navigation.setOptions({
      right: {
        icon: "plus",
        function: () => props.navigation.navigate("MsgsNew"),
      },
    });
  }, []);

  useEffect(() => {
    forceUpdate = false;
    getDataAsyncStorage();
  }, [forceUpdate]);

  function openArticle(item) {
    props.navigation.navigate("MsgsOne", { msg: item });
    console.log(`You pressed №${item.id}!`);
  }

  const renderRow = ({ item }) => (
    <TouchableOpacity
      key={item.id}
      style={[
        styles.itemThreeContainer,
        { backgroundColor: ourTheme.colors.surface },
      ]}
      onPress={() => openArticle(item)}
    >
      <View style={styles.itemThreeSubContainer}>
        <View
          style={{
            justifyContent: "center",
            alignItems: "center",
            flex: 1,
            maxWidth: 76,
          }}
        >
          <Icon
            size={64}
            name={statuses[item.icon]}
            color={ourTheme.colors.text}
          />
        </View>
        <View style={styles.itemThreeContent}>
          <Text style={styles.itemThreeBrand}>{item.subject}</Text>
          <View>
            <Text style={styles.itemThreeTitle}>{item.info}</Text>
          </View>
          <View style={styles.itemThreeMetaContainer}>
            <Text style={styles.itemThreePrice}>{item.date}</Text>
          </View>
        </View>
      </View>
      <View style={styles.itemThreeHr} />
    </TouchableOpacity>
  );

  function MsgsList() {
    return (
      <View
        style={{ height: "100%", backgroundColor: ourTheme.colors.surface }}
      >
        <FlatList
          keyExtractor={(item) => item.id}
          style={{
            backgroundColor: ourTheme.colors.surface,
            paddingHorizontal: 15,
          }}
          data={msgsList}
          renderItem={renderRow}
        />
      </View>
    );
  }

  return <MsgsList />;
}

const styles = StyleSheet.create({
  itemThreeBrand: {
    color: "#617ae1",
    fontFamily: fonts.primaryRegular,
    fontSize: 15,
  },
  itemThreeContainer: {
    //seems like unused
  },
  itemThreeContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingLeft: 15,
  },
  itemThreeHr: {
    backgroundColor: "#e3e3e3",
    flex: 1,
    height: 1,
    marginRight: -15,
  },
  itemThreeMetaContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemThreePrice: {
    color: "#5f5f5f",
    fontFamily: fonts.primaryRegular,
    fontSize: 15,
    textAlign: "right",
  },
  itemThreeSubContainer: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  itemThreeTitle: {
    color: "#5F5F5F",
    fontFamily: fonts.primaryBold,
    fontSize: 16,
  },
});
