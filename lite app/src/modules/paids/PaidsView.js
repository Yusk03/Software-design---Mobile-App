import React, { useEffect } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";

import { fonts } from "../../styles";
import storage from "../../controllers/storage";

const PAY_LOGO = require("../../../assets/images/paids/pay.jpg");

export default function PaidScreen(props) {
  const { t } = useTranslation();
  const [paymentsList, setPayments] = React.useState([
    {
      id: 0,
      regDate: t("noPayments"),
      extId: "",
      sum: 0,
    },
  ]);

  const [feesList, setFees] = React.useState([
    {
      id: 0,
      regDate: t("noFees"),
      extId: "",
      sum: 0,
    },
  ]);

  const ourTheme = useTheme();

  function getDataAsyncStorage() {
    storage.getArray("paymentsListArray").then((payments) => {
      if (payments instanceof Array && payments.length > 0) {
        payments.reverse().map((payment) => {
          payment.image = PAY_LOGO;
          payment.info = `${t("payment")} №${payment.id}`;
        });
        setPayments(payments);
      }
    });

    storage.getArray("feesListArray").then((fees) => {
      if (fees instanceof Array && fees.length > 0) {
        fees.reverse().map((fee) => {
          fee.info = `${t("fee")} №${fee.id}`;
        });
        setFees(fees);
      }
    });
  }

  useEffect(() => {
    getDataAsyncStorage();
  }, []);

  function openArticle(article) {
    console.log("pressed Article №", article.id);
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
        <Image source={item.image || PAY_LOGO} style={styles.itemThreeImage} />
        <View style={styles.itemThreeContent}>
          <Text style={styles.itemThreeBrand}>{item.info}</Text>
          <View>
            <Text style={styles.itemThreeTitle}>{item.regDate}</Text>
            <Text style={styles.itemThreeSubtitle} numberOfLines={2}>
              {item.extId}
            </Text>
          </View>
          <View style={styles.itemThreeMetaContainer}>
            <Text style={styles.itemThreePrice}>{`${item.sum.toFixed(
              2
            )} ₴`}</Text>
          </View>
        </View>
      </View>
      <View style={styles.itemThreeHr} />
    </TouchableOpacity>
  );

  function FeesScreen() {
    return (
      <FlatList
        keyExtractor={(item) => item.id}
        style={{
          backgroundColor: ourTheme.colors.surface,
          paddingHorizontal: 15,
        }}
        data={feesList}
        renderItem={renderRow}
      />
    );
  }

  function PaymentsScreen() {
    return (
      <FlatList
        keyExtractor={(item) => item.id}
        style={{
          backgroundColor: ourTheme.colors.surface,
          paddingHorizontal: 15,
        }}
        data={paymentsList}
        renderItem={renderRow}
      />
    );
  }

  const Tab = createMaterialTopTabNavigator();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarIndicatorStyle: { backgroundColor: ourTheme.colors.button },
        tabBarLabelStyle: {
          fontSize: 14,
          fontWeight: "bold",
          color: ourTheme.colors.text,
        },
        tabBarStyle: { backgroundColor: ourTheme.colors.surface },
      }}
    >
      <Tab.Screen name={t("payments")} component={PaymentsScreen} />
      <Tab.Screen name={t("fees")} component={FeesScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  itemThreeBrand: {
    color: "#617ae1",
    fontFamily: fonts.primaryRegular,
    fontSize: 18,
    fontWeight: "bold",
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
  itemThreeImage: {
    height: 100,
    width: 100,
  },
  itemThreeMetaContainer: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemThreePrice: {
    color: "#5f5f5f",
    fontFamily: fonts.primaryRegular,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "right",
  },
  itemThreeSubContainer: {
    flexDirection: "row",
    paddingVertical: 10,
  },
  itemThreeSubtitle: {
    color: "#a4a4a4",
    fontFamily: fonts.primaryRegular,
    fontSize: 12,
  },
  itemThreeTitle: {
    color: "#5F5F5F",
    fontFamily: fonts.primaryBold,
    fontSize: 16,
  },
});
