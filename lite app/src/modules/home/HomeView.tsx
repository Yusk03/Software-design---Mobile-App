import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, TouchableOpacity, View } from "react-native";
import {
  Button,
  Card,
  List,
  Paragraph,
  ProgressBar,
  Text,
  Title,
  useTheme,
  withTheme,
} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";

import { CustomModal } from "../../components";
import storage from "../../controllers/storage";
import { colors } from "../../styles";
import API from "../../api/api";
import { toMbit, pluralDays, addDays } from "../../features";

function HomeScreen(props) {
  const { t } = useTranslation();

  const [homeProps, setHomeProps] = useState({
    balance: 92.04,
    wallet: "грн",
  });

  const [internetInfo, setInternetInfo] = useState({
    tpName: t("noTariff"),
    monthFee: 0,
  });
  const [userInfo, setUserInfo] = useState({
    PIB: "Жмишенко Валерій",
  });
  const [speedInfo, setSpeedInfo] = useState({
    inSpeed: 1,
  });
  const [speedInfoPercentages, setSpeedInfoPercentages] = useState(100);
  const [visibleCreditModal, setVisibleCreditModal] = React.useState(false);
  const [visibleSuspenseModal, setVisibleSuspenseModal] = React.useState(false);
  const [modalButtonDisabled, setModalButtonDisabled] = useState(false);
  const [creditInfo, setCreditInfo] = useState({});

  const ourTheme = useTheme();
  
  function takeCredit() {
    setModalButtonDisabled(true);
    API.userGetCredit().then((res) => {
      console.log(res);
      setVisibleCreditModal(false);
      setModalButtonDisabled(false);
      if(res.error) {
        if(res.error === 4303) {
          Alert.alert(t("error"), "Вы не имеете права взять кредит :(");
        } else {
          Alert.alert(t("error"), "У вас уже есть кредит.");
        }
        return;
      }
      Alert.alert(t("congrats"), 
      `Вы взяли кредит на ${creditInfo.creditSum} ₴, на период ${creditInfo.creditDays} ${t(pluralDays(creditInfo.creditDays))}`)
    })
  }

  function CustomModalContent() {
    console.log(creditInfo);
    return (
      <View>
        <Text style={styles.modalContentCaption}>{"Кредит"}</Text>
        <Text style={styles.modalContentInfo}>{creditInfo.creditSum}{" ₴"}</Text>
        
        <Text style={styles.modalContentCaption}>{"Период"}</Text>
        <Text style={styles.modalContentInfo}>
          {creditInfo.creditDays}
          {" "+ t(pluralDays(creditInfo.creditDays))}
          {`, ${t("to")} ${addDays(new Date(), creditInfo.creditDays)}`}
        </Text>
        
        { creditInfo.creditChgPrice &&
        <Text style={styles.modalContentCaption}>{t('cost')}</Text> }
        
        { creditInfo.creditChgPrice &&
        <Text style={styles.modalContentInfo}>{creditInfo.creditChgPrice}{" ₴"}</Text> }
        
        <View style={{alignItems: "center"}}>
          <Text style={styles.modalText}>{t("anotherRedText")}</Text>
        </View>
      </View>
    )
  }

  function getDataAsyncStorage() {
    storage.getObject("subInfoPiObj").then((subInfoPi) => {
      if (subInfoPi.fio.length > 0) {
        setUserInfo({ PIB: subInfoPi.fio });
      } else {
        storage.getObject("userObj").then((userObj) => {
          setUserInfo({ PIB: userObj.login });
        });
      }
    });

    storage.getObject("subInfoObj").then((subInfo) => {
      setHomeProps({ ...homeProps, 
        balance: subInfo.deposit.toFixed(2), 
        credit: subInfo.credit,
        creditDate: subInfo.creditDate.slice(0, 10)
      });
    });

    storage.getObject("internetInfoObj").then((internetInfo) => {
      if (internetInfo instanceof Array && internetInfo.length > 0) {
        setInternetInfo(
          {
            tpName: internetInfo[0].tpName || t("noTariff"),
            monthFee: internetInfo[0].monthFee,
          } || ""
        );
      }
    });

    let speed = 0;
    storage.getObject("internetSpeedObj").then((internetSpeed) => {
      if (internetSpeed instanceof Array && internetSpeed.length > 0) {
        setSpeedInfo({ inSpeed: internetSpeed[0].inSpeed });
        speed = internetSpeed[0].inSpeed;
      }
    });

    storage.getArray("internetListArray").then((tariffs) => {
      if (tariffs instanceof Array && tariffs.length > 0) {
        let maxSpeed = 0;
        tariffs.map((tariff) => {
          if (tariff.inSpeed > maxSpeed) {
            maxSpeed = tariff.inSpeed;
          }
        });

        const percentage = speed / maxSpeed;
        setSpeedInfoPercentages(percentage);
      }
    });
  }

  function updateAboutCredit() {
    API.userCredit().then((info) => setCreditInfo(info));
  }

  useEffect(() => {
    getDataAsyncStorage();
    updateAboutCredit();
  }, []);

  const homeActionsData = [
    {
      name: homeProps.credit ? `Кредит: ${homeProps.credit} ₴ до ${homeProps.creditDate}` : t("getCredit") ,
      icon: "currency-usd",
      pressMethod: () => setVisibleCreditModal(true),
    },
    {
      name: t("operationHistory"),
      icon: "history",
      pressMethod: () => Alert.alert(t("inDevelopment") + "!"),
    },
    {
      name: t("suspendTariff"),
      icon: "close-network-outline",
      pressMethod: () => setVisibleSuspenseModal(true),
    },
  ];

  const homeModals = [
    {
      title: t("doYouWantCredit"),
      dismissLabel: t("no"),
      agreeLabel: t("yes"),
      visible: visibleCreditModal,
      onDismiss: () => setVisibleCreditModal(false),
      onAgree: () => takeCredit(),
      children: <CustomModalContent />,
    },
    {
      title: t("doYouWantSuspend"),
      dismissLabel: t("no"),
      agreeLabel: t("yes"),
      visible: visibleSuspenseModal,
      onDismiss: () => setVisibleSuspenseModal(false),
      onAgree: () => {
        Alert.alert(t("inDevelopment") + "!", t("inDevelopmentDesc"));
        setVisibleSuspenseModal(false);
      },
      children: <Text style={styles.modalText}>{t("anotherRedText")}</Text>
    },
  ];

  return (
    <ScrollView>
      <View style={styles.container}>
        <Card style={[styles.card, { backgroundColor: ourTheme.colors.card }]}>
          <Card.Content style={{ textAlign: "center", alignItems: "center" }}>
            <Title style={styles.titlePIB}>{userInfo.PIB}</Title>
            <Paragraph style={styles.balance}>
              <Paragraph
                style={[
                  styles.balanceText,
                  {
                    color:
                      homeProps.balance > 0
                        ? colors.balancePositive
                        : colors.balanceNegative,
                  },
                ]}
              >
                {homeProps.balance}
              </Paragraph>
              <Paragraph style={styles.walletLabel}>
                {" " + homeProps.wallet}
              </Paragraph>
            </Paragraph>
            <Button
              labelStyle={styles.topUpButtonLabel}
              contentStyle={{
                paddingVertical: 2,
                backgroundColor: ourTheme.colors.button,
              }}
              style={styles.topUpButton}
              mode="contained"
              uppercase={false}
              onPress={() => props.navigation.navigate("Paysys")}
            >
              {t("topUp")}
            </Button>
          </Card.Content>
        </Card>
        <Card style={[styles.card, { backgroundColor: ourTheme.colors.card }]}>
          {homeActionsData.map((item, idx) => (
            <TouchableOpacity
              key={`opt${idx}`}
              style={{ borderRadius: 15 }}
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
        <Card style={[styles.card, { backgroundColor: ourTheme.colors.card }]}>
          <Card.Title
            titleStyle={styles.cardTitle}
            title={internetInfo.tpName}
          />
          <Card.Content>
            <Card.Title
              titleStyle={{ fontSize: 18, fontWeight: "normal" }}
              title={`${t("speed")}: ${toMbit(speedInfo.inSpeed)} ${t(
                "mbit"
              )}/${t("s")}`}
            />
            <ProgressBar
              progress={speedInfoPercentages}
              color={ourTheme.colors.red}
            />
          </Card.Content>
        </Card>
      </View>
      {homeModals.map((item, idx) => (
        <CustomModal
          buttonDisabled={homeProps.credit ? true : modalButtonDisabled}
          theme={ourTheme}
          key={`modal${idx}`}
          title={item.title}
          dismissLabel={item.dismissLabel}
          agreeLabel={item.agreeLabel}
          visible={item.visible}
          onDismiss={item.onDismiss}
          onAgree={item.onAgree}
        >
          {item.children}
        </CustomModal>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  balance: {
    alignItems: "center",
    paddingBottom: "2%",
    paddingTop: "16%",
    textAlign: "center",
  },
  balanceText: {
    color: colors.balancePositive,
    fontSize: 60,
    fontWeight: "700",
    textAlign: "center",
  },
  card: {
    borderRadius: 15,
    elevation: 6,
    marginBottom: 16,
  },
  cardTitle: {
    color: colors.blue,
    fontSize: 24,
    marginTop: 10,
    textAlign: "center",
  },
  container: {
    marginLeft: 10,
    marginRight: 10,
    marginTop: 5,
  },
  modalText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10
  },
  titlePIB: {
    fontSize: 22,
    letterSpacing: -0.5,
  },
  topUpButton: {
    borderRadius: 45,
    width: "100%",
  },
  topUpButtonLabel: {
    color: "#FFF",
    fontSize: 20,
    letterSpacing: 0,
  },
  walletLabel: {
    fontSize: 28,
    letterSpacing: -0.4,
  },
  modalContentCaption: {
    fontSize: 17,
    marginTop: 5
  },
  modalContentInfo: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
    letterSpacing: -0.2
  },
});

export default withTheme(HomeScreen);
