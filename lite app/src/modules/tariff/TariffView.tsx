import React, { useEffect } from "react";
import { FlatList, StyleSheet, TouchableOpacity, View, Alert } from "react-native";
import {
  Button,
  Caption,
  Subheading,
  Text,
  Title,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";
import LinearGradient from "react-native-linear-gradient";

import { CustomModal } from "../../components";
import { toMbit } from "../../features";
import storage from "../../controllers/storage";
import { colors, fonts } from "../../styles";

export default function TariffScreen(props) {
  const { t } = useTranslation();
  const ourTheme = useTheme();

  const [tariffData, setTariffData] = React.useState([
    {
      inSpeed: 1024000,
      name: t("noAvailableTariffs"),
      comments: t("writeSupport"),
      period: "month",
      monthFee: 50,
    },
  ]);

  const [modalVisible, setModalVisible] = React.useState(false);
  const [modalInfo, setModalInfo] = React.useState({
    id: 0,
    tpId: 0,
    monthFee: 0,
    dayFee: 0,
    outSpeed: 0,
  })
  const [forceUpdate, setForceUpdate] = React.useState(false);

  function getStorageData() {
    storage.getArray("internetListArray").then((tariffs) => {
      if (tariffs instanceof Array && tariffs.length > 0) {
        setTariffData(tariffs);
      }
    });
  }

  useEffect(() => {
    getStorageData();
  }, []);

  // TODO: add "At the moment, we have no offers for you..."

  Array.prototype.sample = function () {
    return this[Math.floor(Math.random() * this.length)];
  };

  return (
    <View>
      <FlatList
        refreshing={false}
        style={{ backgroundColor: ourTheme.colors.surface }}
        data={tariffData}
        renderItem={renderRow}
      />
      <CustomModal
        theme={ourTheme}
        buttonDisabled={modalInfo.buttonDisabled}
        title={t("aboutTariff")}
        agreeLabel={t(modalInfo.buttonLabel)}
        visible={modalVisible}
        onDismiss={() => setModalVisible(false)}
        onAgree=  {() => {
          Alert.alert(t("inDevelopment") + "!", t("inDevelopmentDesc"));
          setModalVisible(false);
        }}
      >
        <CustomModalContent item={modalInfo}/>
      </CustomModal>
    </View>
  );
  
  function openTariffModal(item) {
    if(item?.error) {
      item.buttonDisabled = true;
      item.buttonLabel = "notEnoughMoney";
    } else {
      item.buttonLabel = "switchTariff";
    }
    setModalInfo(item);
    setModalVisible(!modalVisible);
  }

  function CustomModalContent({item}) {
    return (
      <View>
        <Text style={styles.modalContentCaption}>{t('tariffPlan')}</Text>
        <Text style={styles.modalContentInfo}>{item.name}</Text>

        { item.comments ?
        <Text style={styles.modalContentCaption}>{t('description')}</Text>
          : null }
        { item.comments ?
        <Text style={styles.modalContentInfo}>{item.comments}</Text>
          : null }
        <Text style={styles.modalContentCaption}>{t('cost')}</Text>
        <Text style={styles.modalContentInfo}>{item.dayFee | item.monthFee}{" ₴"}{` ${t("in")} ${t(item.period)}`}</Text>
        
        <Text style={styles.modalContentCaption}>{t('speed')}</Text>
        <Text style={styles.modalContentInfo}>{toMbit(item.outSpeed)}{" "}{t('mbit')}{"/"}{t('perSecond')}</Text>
      </View>
    )
  }

  function renderRow({ item }) {
    item.fee = item.monthFee | item.dayFee;
    item.period = item.monthFee ? "month" : "day";

    let startPosition = Math.random() * 0.6 + 0.1;
    let endPosition =
      Math.random() * (0.9 - startPosition + 0.3) + startPosition + 0.3;

    return (
      <LinearGradient
        start={{ x: 0.1, y: 0.1 }}
        end={{ x: 0.85, y: 0.85 }}
        colors={[gradColors.sample(), gradColors.sample()]}
        locations={[startPosition, endPosition]}
        angle={Math.random() * 75}
        useAngle={true}
        style={[styles.card, { backgroundColor: "#f46079" }]}
      >
        <View style={{ paddingHorizontal: 20, paddingVertical: 12 }}>
          <View style={{ flexDirection: "row", paddingBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Title style={{ fontWeight: "bold", color: "white" }}>
                {item.name}
              </Title>
              <Subheading style={styles.comments}>{item.comments}</Subheading>
              <View style={styles.feePeriodContainer}>
                <Text style={styles.fee}>
                  {item.fee}
                  {" ₴"}
                </Text>
                <Text style={styles.period}>
                  {`  ${t("in")} `}
                  {t(item.period)}
                </Text>
              </View>
            </View>
            <View style={{ flex: 0, width: 76 }}>
              <TouchableOpacity
                onPress={() => setForceUpdate(!forceUpdate)}
                style={[
                  styles.touchableCircle,
                  {
                    borderColor: ourTheme.colors.background,
                  },
                ]}
              >
                <Title style={styles.touchableCircleSpeed}>
                  {toMbit(item.inSpeed)}
                </Title>
                <Caption style={styles.touchableCircleCaption}>
                  {t("mbit")}/{t("perSecond")}
                </Caption>
              </TouchableOpacity>
            </View>
          </View>
          <Button
            labelStyle={styles.buttonLabel}
            contentStyle={{ paddingVertical: 1 }}
            style={styles.button}
            color="#3498DB" // TODO: fix color in dark mode
            mode="contained"
            uppercase={false}
            onPress={() => openTariffModal(item)}
          >
            {t("readMore")}
          </Button>
        </View>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    alignSelf: "center",
    borderRadius: 30,
    elevation: 4,
    marginBottom: 2,
    width: "100%",
  },
  buttonLabel: {
    color: colors.white,
    fontSize: 16,
    letterSpacing: 0,
  },
  card: {
    borderRadius: 15,
    elevation: 6,
    marginBottom: 11,
    marginHorizontal: 10,
    marginTop: 5,
  },
  comments: {
    color: "white",
    fontSize: 13,
    lineHeight: 18,
    marginTop: -2,
  },
  fee: {
    color: "white",
    fontSize: 34,
    fontWeight: "bold",
    letterSpacing: -0.7,
  },
  feePeriodContainer: {
    flex: 1,
    flexDirection: "row",
    marginBottom: -5,
    marginTop: 3,
  },
  period: {
    color: "white",
    fontSize: 16,
    paddingTop: 5,
  },
  touchableCircle: {
    alignItems: "center",
    backgroundColor: "#fff94c",
    borderRadius: 38,
    height: 76,
    justifyContent: "center",
    width: 76,
  },
  touchableCircleCaption: {
    color: "gray",
    fontSize: 12.5,
    lineHeight: 12.5,
    marginBottom: -1,
    marginTop: -3,
  },
  touchableCircleSpeed: {
    color: "black",
    fontSize: 28,
    fontWeight: "bold",
    letterSpacing: -1,
  },
  modalText: {
    color: "red",
    fontSize: 18,
    fontWeight: "bold",
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
  }
});

const gradColors = [
  "#ff6d65",
  "#7535bb",
  "#7335b2",
  "#1e6dd0",
  "#1d56ca",
  "#29d0d2",
  "#22df87",
  "#11bbec",
  "#fc5c7d",
  "#6a82fb",
  "#de6161",
  "#2657eb",
  "#e2dc30",
  "#004ff9",
  "#f46079",
];
