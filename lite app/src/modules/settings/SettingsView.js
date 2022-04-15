import React, { useContext, useEffect } from "react";
import { StyleSheet, View } from "react-native";
import { List, RadioButton, useTheme } from "react-native-paper";
import { useTranslation } from "react-i18next";
import { useDispatch } from "react-redux";
import { setLocale } from "../../actions/settings";
import { store } from "../../redux/store";

import { AppContext } from "../AppContextProvider";
import * as Themes from "../../config/themes";
import storage from "../../controllers/storage";

export default function SettingsView(props) {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = React.useState("");
  const { theme, changeTheme } = useContext(AppContext);

  const dispatch = useDispatch();
  const ourTheme = useTheme();

  function changeOurTheme(choice) {
    switch (choice) {
      case "dark": {
        changeTheme(Themes.DarkAppTheme);
        break;
      }
      case "light": {
        changeTheme(Themes.LightAppTheme);
        break;
      }
    }
  }

  const changeLanguage = async (lng) => {
    const state = await store.getState();
    console.log(state);
    // await i18n.changeLanguage(lng);
    dispatch(setLocale(lng));
    setLanguage(lng);
    props.navigation.setOptions({ title: t("settings") });
  };

  function getDataAsyncStorage() {
    storage
      .getValue("languageTag")
      .then((languageTag) => {
        setLanguage(languageTag);
      })
      .catch((e) => {
        console.error(e);
      });
  }

  useEffect(() => {
    getDataAsyncStorage();
  }, []);

  return (
    <View
      style={[
        styles.mainContainer,
        { backgroundColor: ourTheme.colors.surface },
      ]}
    >
      <List.Accordion
        title={t("language")}
        style={[styles.listAccor, { backgroundColor: ourTheme.colors.card }]}
        left={(props) => <List.Icon {...props} icon="translate" />}
      >
        <RadioButton.Group
          onValueChange={(language) => changeLanguage(language)}
          value={language}
        >
          <RadioButton.Item label={"English"} value="en" />
          <RadioButton.Item label={"Українська"} value="uk" />
          <RadioButton.Item label={"Русский"} value="ru" />
        </RadioButton.Group>
      </List.Accordion>
      <List.Accordion
        title={t("themes")}
        style={[styles.listAccor, { backgroundColor: ourTheme.colors.card }]}
        left={(props) => <List.Icon {...props} icon="theme-light-dark" />}
      >
        <RadioButton.Group
          onValueChange={(choice) => changeOurTheme(choice)}
          value={theme.name}
        >
          <RadioButton.Item label={t("themeDark")} value="dark" />
          <RadioButton.Item label={t("themeLight")} value="light" />
        </RadioButton.Group>
      </List.Accordion>
    </View>
  );
}

const styles = StyleSheet.create({
  listAccor: {
    borderBottomColor: "rgba(0, 0, 0, 0.3)",
    borderBottomWidth: 1,
    minWidth: "100%",
  },
  mainContainer: {
    alignItems: "center",
    borderTopColor: "rgba(0, 0, 0, 0.3)",
    borderTopWidth: 1,
    flex: 1,
    width: "100%",
  },
});
