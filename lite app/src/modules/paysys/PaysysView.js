import React, { useEffect, useLayoutEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  Alert,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { Text, TextInput, withTheme } from "react-native-paper";
import { useSharedValue } from "react-native-reanimated";
import Carousel from "react-native-reanimated-carousel";
import API from "../../api/api";

import { PaginationItem } from "../../components";
import { PaymentSystems } from "../../constants/paysysList";
import storage from "../../controllers/storage";
import { fonts } from "../../styles";

function PaysysView(props) {
  const progressValue = useSharedValue(0);
  const { t } = useTranslation();

  const { width: PAGE_WIDTH } = Dimensions.get("window");

  const [sum, setSum] = React.useState("1");
  const [paysysNames, setPaysysNames] = React.useState("Liqpay");
  const [systems, setSystems] = React.useState([PaymentSystems.Liqpay]);

  const { colors } = props.theme;

  useLayoutEffect(() => {
    props.navigation.setOptions({ back: true });
  }, []);

  //Generate fast payment link for WebView pay
  function onChangeWebViewLink({ systemId, title }) {
    API.paysysPay({ systemId, sum, operationId: Date.now() })
      .then((res) => {
        storage
          .setValue("paysysLink", res.url)
          .then(() => {})
          .catch((e) => {
            console.error(e);
          });

        return props.navigation.navigate("PaysysWeb", {
          paySystem: title,
          paysysLink: res.url,
        });
      })
      .catch((e) => {
        Alert.alert(e.error, e.message);
      });
  }

  //Get payment systems
  function paysysListArray() {
    storage
      .getArray("paysysList")
      .then((paysysList) => {
        if (paysysList instanceof Array && paysysList.length > 0) {
          const paySystems = [];
          let paysysName = "";
          paysysList.reverse().map((paysys) => {
            paysys.module = paysys.module.replace(/.pm/g, "");
            const status = PaymentSystems?.[paysys.module];
            if (status) {
              let paySystem = PaymentSystems[`${paysys.module}`];
              paysysName = `${paysysName}  ${paySystem.title}`;
              paySystem.systemId = paysys.id;
              paySystems.push(paySystem);
            }
          });
          setPaysysNames(paysysName);
          setSystems([...paySystems]);
        }
      })
      .catch((e) => {
        console.error(e);
      });
  }

  //Generate payment list
  function PaysysList() {
    return (
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("ChoosePayMethod")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.text }]}>
          {paysysNames}
        </Text>
        <TextInput
          mode="outlined"
          placeholderTextColor={colors.placeholderText}
          keyboardType="numeric"
          label={t("topUp")}
          style={[styles.input, { backgroundColor: colors.card }]}
          onChangeText={(sum) => setSum(sum)}
          value={sum}
        />

        <Carousel
          width={PAGE_WIDTH}
          height={PAGE_WIDTH / 1.2}
          data={[...systems]}
          mode={"parallax"}
          modeConfig={{
            parallaxScrollingScale: 0.9,
            parallaxScrollingOffset: 50,
          }}
          onProgressChange={(_, absoluteProgress) =>
            (progressValue.value = absoluteProgress)
          }
          renderItem={renderItem}
        />

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            width: 100,
            alignSelf: "center",
          }}
        >
          {systems.map((item, index) => {
            return (
              <PaginationItem
                backgroundColor={colors.primary}
                animValue={progressValue}
                index={index}
                key={index}
                isRotate={false}
                length={systems.length}
              />
            );
          })}
        </View>
      </View>
    );
  }

  //Render item for one payment system
  function renderItem({ item }) {
    return (
      <View
        style={{
          height: PAGE_WIDTH / 1.5,
          paddingVertical: 12,
          borderRadius: 15,
        }}
      >
        <TouchableOpacity onPress={() => onChangeWebViewLink(item)}>
          <Image
            source={item.logo}
            style={{
              height: PAGE_WIDTH / 1.5,
              width: "97%",
              resizeMode: "contain",
            }}
          />
          <Text style={[styles.paysysTitle, { color: colors.text }]}>
            {item.title}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  useEffect(() => {
    paysysListArray();
  }, []);

  return (
    <View style={{ height: "100%", backgroundColor: colors.surface }}>
      <ScrollView
        style={styles.scrollview}
        scrollEventThrottle={200}
        directionalLockEnabled={true}
      >
        <PaysysList />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 30,
  },
  input: {
    fontSize: 24,
    marginLeft: "5%",
    marginTop: 5,
    width: "90%",
  },
  paysysTitle: {
    color: "black",
    fontFamily: fonts.primaryRegular,
    fontSize: 35,
    fontWeight: "bold",
    overflow: "hidden",
    textAlign: "center",
  },
  scrollview: {
    flex: 1,
  },
  subtitle: {
    backgroundColor: "transparent",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 5,
    paddingHorizontal: 30,
    textAlign: "center",
  },
  title: {
    backgroundColor: "transparent",
    fontSize: 20,
    fontWeight: "bold",
    paddingHorizontal: 30,
    textAlign: "center",
  },
});

export default withTheme(PaysysView);
