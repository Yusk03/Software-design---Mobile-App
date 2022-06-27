import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { Card, List, useTheme } from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useTranslation } from "react-i18next";

import deviceInfo from "../../controllers/devicInfo";
import storage from "../../controllers/storage";
import { colors } from "../../styles";

export default function ProfileScreen(props) {
  const [profileProps, setProfileProps] = useState({
    PIB: "Жмишенко Валерій",
    addressFull: "Дом Скворцова",
    email: "test@gmail.com",
    phone: "0959999999",
  });
  const [billInfo, setBillInfo] = useState({
    apiVersion: 0.06,
    billing: "ABillS",
    version: "0.92",
  });

  const { t } = useTranslation();
  const deviceProps = deviceInfo.getConstantDeviceInfo();

  function getDataAsyncStorage() {
    storage
      .getObject("subInfoPiObj")
      .then((subInfoPi) => {
        setProfileProps({
          PIB: subInfoPi.fio || "",
          addressFull: subInfoPi.addressFull || "",
          email: subInfoPi.email[0] || "",
          phone: subInfoPi.phone[0] || subInfoPi.cellPhone[0] || "",
        });
      })
      .catch((e) => {
        console.error(e);
      });

    storage
      .getObject("versionObj")
      .then((version) => {
        setBillInfo(version);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  useEffect(() => {
    getDataAsyncStorage();
  }, []);

  const profileData = [
    {
      title: t("fullName"),
      description: profileProps.PIB,
    },
    {
      title: t("phoneNumber"),
      description: profileProps.phone,
    },
    {
      title: t("address"),
      description: profileProps.addressFull,
    },
    {
      title: `${billInfo.billing} ${billInfo.version}`,
      description: `API: ${billInfo.apiVersion}`,
    },
  ];

  const ourTheme = useTheme();

  return (
    <ScrollView>
      <View style={styles.container}>
        <Card style={[styles.card, { backgroundColor: ourTheme.colors.card }]}>
          <List.Section style={styles.section}>
            {profileData.map((item, idx) => (
              <List.Item
                key={idx}
                title={t(item.title)}
                titleStyle={styles.itemTitle}
                description={item.description}
                descriptionStyle={styles.itemDescription}
                style={idx ? styles.border : ""}
              />
            ))}

            <List.Accordion
              title={t("deviceInfo")}
              titleStyle={styles.itemDescription}
              style={{ backgroundColor: ourTheme.colors.card }}
              left={(props) => (
                <Icon
                  size={40}
                  color={ourTheme.colors.onSurface}
                  name="cellphone"
                />
              )}
            >
              {deviceProps.map((item, idx) => (
                <List.Item
                  key={idx}
                  title={t(item.name)}
                  titleStyle={styles.itemTitle}
                  description={item.title}
                  descriptionStyle={styles.itemDescription}
                  style={[styles.border, { paddingLeft: 10 }]}
                />
              ))}
            </List.Accordion>
          </List.Section>
        </Card>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  border: {
    borderTopColor: colors.specialGray,
    borderTopEndRadius: 15,
    borderTopStartRadius: 15,
    borderTopWidth: 1,
  },
  card: {
    borderRadius: 15,
    elevation: 6,
    marginBottom: 10,
    marginLeft: 5,
    marginRight: 5,
  },
  container: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
  },
  itemDescription: {
    fontSize: 17,
    //color: '#3E4958'
  },
  itemTitle: {
    fontSize: 15,
    //color: '#97ADB6'
  },
  section: {
    paddingLeft: 10,
    paddingRight: 10,
  },
});
