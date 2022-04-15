import React, { useEffect, useLayoutEffect } from "react";
import { Alert, ToastAndroid } from "react-native";
import { useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import {
  Bubble,
  Composer,
  GiftedChat,
  InputToolbar,
  MessageText,
  Send,
} from "react-native-gifted-chat";
import Clipboard from "@react-native-clipboard/clipboard";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import API from "../../api/api";

export default function MsgsOneView(props) {
  const { t } = useTranslation();
  const message = props.route.params.msg;

  const ourTheme = useTheme();
  const providerLogo = require("../../../assets/images/icon.png");

  const stockUser = {
    _id: 1,
    createdAt: new Date(),
    admin: 0,
    text: "...",
    user: {
      _id: 1,
      name: "abills",
    },
  };

  const [ticketList, setTicket] = React.useState([stockUser]);

  useLayoutEffect(() => {
    props.navigation.setOptions({
      title: `${t("msgsRequest")} №${message.id}`,
      //fontColor: ourTheme.colors.text,
      back: true,
      to: "msgsRead",
    });
  }, [message]);

  useEffect(() => {
    getStorageData();
    return () => setTicket([stockUser]);
  }, [message]);

  function getStorageData() {
    API.ticket(message.id)
      .then((msg) => {
        if (msg instanceof Array && msg.length > 0) {
          let ticketMsgs = [];
          let sameTicket = {};

          msg.reverse().map((ticket) => {
            sameTicket._id = ticket.id;
            sameTicket.createdAt = new Date(Date.parse(ticket.datetime));
            sameTicket.admin = ticket.admin ? 1 : 0;
            sameTicket.user = {
              _id: ticket.aid ? 2 : 1,
              name: ticket.creatorFio,
              avatar: ticket.aid ? providerLogo : "",
            };
            sameTicket.text = ticket.text;
            ticketMsgs.push(sameTicket);
            sameTicket = {};
          });
          setTicket([...ticketMsgs]);
        } else {
          console.log("we caught empty ticket, that's bug!");
          console.log(msg);
        }
      })
      .catch((e) => {
        console.log(e);
        Alert.alert(e.error, e.message);
      });
  }

  const renderBubble = (props) => {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: "#33393F",
          },
          right: {
            backgroundColor: "#2A2F33",
          },
        }}
      />
    );
  };

  const renderMessageText = (props) => {
    return (
      <MessageText
        {...props}
        textStyle={{
          left: {
            fontSize: 16,
            color: "#FFFFFF",
          },
          right: {
            fontSize: 16,
            color: "#FFFFFF",
          },
        }}
      />
    );
  };

  const sendMessage = (props) => {
    API.ticketReply(message.id, { reply_text: props[0].text }).then((msg) => {
      if (msg.affected) {
        let ticketMsgs = [];
        let sameTicket = {};

        sameTicket._id = msg.insertId;
        sameTicket.text = props[0].text;
        sameTicket.user = props[0].user;
        sameTicket.createdAt = new Date();
        ticketMsgs.push(sameTicket);

        setTicket((firstMsgs) => [...ticketMsgs, ...firstMsgs]);
        getStorageData();
      } else {
        Alert.alert(t("error"));
      }
    });
  };

  const renderSend = (props) => {
    return (
      <Send
        {...props}
        containerStyle={{ marginRight: 5, justifyContent: "center" }}
      >
        <Icon size={36} color={"tomato"} name={"send"} />
      </Send>
    );
  };

  const renderInputToolbar = (props) => {
    return (
      <InputToolbar
        {...props}
        containerStyle={{
          backgroundColor: ourTheme.colors.card,
        }}
      />
    );
  };

  const renderComposer = (props) => {
    return (
      <Composer
        {...props}
        textInputStyle={{
          color: ourTheme.colors.text,
        }}
      />
    );
  };

  const copyToClipboard = (props, pressedMessage) => {
    ToastAndroid.showWithGravity(
      t("copiedSuccess"),
      ToastAndroid.SHORT,
      ToastAndroid.BOTTOM
    );
    Clipboard.setString(pressedMessage.text);
  };

  return (
    <GiftedChat
      messages={ticketList}
      onSend={sendMessage}
      placeholder={`${t("msg")}...`}
      user={{
        _id: 1,
        name: "User",
      }}
      messagesContainerStyle={{
        backgroundColor: ourTheme.colors.surface,
      }}
      onLongPress={copyToClipboard}
      onPressAvatar={() =>
        ToastAndroid.showWithGravity(
          "abills.net.ua",
          ToastAndroid.SHORT,
          ToastAndroid.BOTTOM
        )
      }
      onLongPressAvatar={() => Alert.alert(t("congrats"), t("easterEgg"))}
      renderSend={renderSend}
      renderBubble={renderBubble}
      renderMessageText={renderMessageText}
      renderInputToolbar={renderInputToolbar}
      renderComposer={renderComposer}
      timeFormat="HH:mm"
    />
  );
}
