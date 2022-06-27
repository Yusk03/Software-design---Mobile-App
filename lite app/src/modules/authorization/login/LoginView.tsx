import React, { useRef } from "react";
import { Alert, Image, StyleSheet, View, ScrollView} from "react-native";
import {
  Button,
  Checkbox,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { useTranslation } from "react-i18next";

import { getSample } from "../../../features";
import storage from "../../../controllers/storage";
import EnvVars from "../../../config/env.vars";
import API from "../../../api/api";
import { colors } from "../../../styles";
const iconLogo = require("../../../../assets/images/logo.png");

export default function LoginView(props) {
  const { t } = useTranslation();

  const userLogin = getSample(EnvVars.users);
  // form properties variables
  const [formProps, setFormProps] = React.useState({
    showPassword: true,
    showErrorLogin: false,
    showErrorPassword: false,
    showErrorHost: false,
    showErrorPort: false,
    showModal: false,
  });
  // user and url objects from inputs
  const [userInfo, setUserInfo] = React.useState({
    login: userLogin.login,
    password: userLogin.password,
  });

  const [urlInfo, setUrlInfo] = React.useState({
    host: "demo.abills.net.ua",
    port: "9443",
  });

  const ref_pwd = useRef();
  const ref_login = useRef();
  const [clicked, setClicked] = React.useState(false);
  const [useHttp, setUseHttp] = React.useState(false);
  const ourTheme = useTheme();
  // update user and url objects fields
  const handleOnChangeText = (value, fieldName) => {
    setUserInfo({ ...userInfo, [fieldName]: value });
  };

  // only numbers in port input
  const handleUrlOnChangeText = (value, fieldName) => {
    if (fieldName === "port") {
      if (/^\d+$/.test(value) || value === "") {
        setUrlInfo({ ...urlInfo, [fieldName]: value });
      } else {
        setUrlInfo({ ...urlInfo });
      }
    } else {
      setUrlInfo({ ...urlInfo, [fieldName]: value });
    }
  };

  const checkInputs = () => {
    let returnValue = 1;
    formProps.showErrorLogin = false;
    formProps.showErrorPassword = false;
    formProps.showErrorHost = false;
    formProps.showErrorPort = false;

    if (!userInfo.login.trim()) {
      formProps.showErrorLogin = true;
      returnValue = 0;
    }

    if (!userInfo.password.trim()) {
      formProps.showErrorPassword = true;
      returnValue = 0;
    }

    if (!urlInfo.port.trim()) {
      formProps.showErrorPort = true;
      returnValue = 0;
    }

    if (!urlInfo.host.trim()) {
      formProps.showErrorHost = true;
      returnValue = 0;
    }

    handleOnChangeText(userInfo.login, "login");
    return returnValue;
  };

  // send api req
  const handleLogin = async () => {
    if (!checkInputs()) {
      return 1;
    }

    setClicked(true);
    const url = `${useHttp ? "http" : "https"}://${urlInfo.host}:${
      urlInfo.port
    }/api.cgi`;
    await storage.setValue("url", url);

    try {
      // console.log()
      const res = await API.login(userInfo);
      if (res.uid) {
        // await storage.setValue('stayInSystem', stayInSystem.toString());
        props.navigation.navigate("Homes");
      } else {
        ref_login.current.focus();
        await storage.clearAll();
        Alert.alert(t("error"), t("loginErrorUser")); //FIXME FOR UI MODAL
      }
    } catch (e) {
      setClicked(false);
      if (e.error === "801") {
        await storage.clearAll();
        props.navigation.navigate("Homes");
      }
      return Alert.alert(e.error, e.message);
    }
    setClicked(false);
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.mainContainer,
        { backgroundColor: ourTheme.colors.surface },
      ]}
    >
      <Image style={{ width: 230, height: 121 }} source={iconLogo} />
      <View style={styles.formContainer}>
        <TextInput
          ref={ref_login}
          style={styles.input}
          label={t("login")}
          placeholderTextColor={colors.placeholderText}
          autoCapitalize={"none"}
          onSubmitEditing={() => ref_pwd.current.focus()}
          onChangeText={(value) => handleOnChangeText(value, "login")}
          value={userInfo.login}
          error={formProps.showErrorLogin}
        />
        {formProps.showErrorLogin === true ? (
          <Text style={styles.errorMessage}>{t("enterLogin")}</Text>
        ) : null}
        <TextInput
          ref={ref_pwd}
          style={styles.input}
          label={t("password")}
          placeholderTextColor={colors.placeholderText}
          secureTextEntry={formProps.showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={() => handleLogin()}
          right={
            <TextInput.Icon
              name={formProps.showPassword ? "eye-off" : "eye"}
              onPress={() => {
                formProps.showPassword
                  ? setFormProps({ ...formProps, showPassword: false })
                  : setFormProps({ ...formProps, showPassword: true });
              }}
            />
          }
          onChangeText={(value) => handleOnChangeText(value, "password")}
          value={userInfo.password}
          error={formProps.showErrorPassword}
        />
        {formProps.showErrorPassword === true ? (
          <Text style={styles.errorMessage}>{t("enterPassword")}</Text>
        ) : null}
        <View
          style={{
            display: "flex",
            flexDirection: "row",
          }}
        >
          <View style={{ width: "65%" }}>
            <TextInput
              style={styles.input}
              label={t("URL")}
              placeholderTextColor={colors.placeholderText}
              autoCapitalize={"none"}
              onChangeText={(value) => handleUrlOnChangeText(value, "host")}
              value={urlInfo.host}
              error={formProps.showErrorHost}
            />
            {formProps.showErrorHost === true ? (
              <Text style={styles.errorMessage}>{t("enterHost")}</Text>
            ) : null}
          </View>
          <View style={{ width: "35%" }}>
            <TextInput
              style={styles.input}
              label={t("port")}
              placeholderTextColor={colors.placeholderText}
              autoCapitalize={"none"}
              keyboardType="numeric"
              onChangeText={(value) => handleUrlOnChangeText(value, "port")}
              value={urlInfo.port}
              error={formProps.showErrorPort}
            />
            {formProps.showErrorPort === true ? (
              <Text style={styles.errorMessage}>{t("enterPort")}</Text>
            ) : null}
          </View>
        </View>
        <View style={{ display: "flex", flexDirection: "row" }}>
          <Checkbox
            color="#3498DB"
            status={useHttp ? "checked" : "unchecked"}
            onPress={() => setUseHttp(!useHttp)}
          />
          <Text
            style={{ fontSize: 16, marginTop: 9 }}
            onPress={() => setUseHttp(!useHttp)}
          >
            {t("useHttp")}
          </Text>
        </View>
        {/* <View style={{display: 'flex', flexDirection: 'row'}}>
          <Checkbox
            color='#3498DB'
            status={stayInSystem ? 'checked' : 'unchecked'}
            onPress={() => {
              setStayInSystem(!stayInSystem);
            }}
          />
          <Text style={{fontSize: 16, marginTop: 9}}>
            {t('rememberMe')}
          </Text>
          </View> */}
        <Button
          style={[
            styles.loginButton,
            { backgroundColor: ourTheme.colors.button },
          ]}
          labelStyle={styles.loginButtonLabel}
          loading={clicked}
          mode="contained"
          uppercase={false}
          onPress={() => handleLogin()}
        >
          {t("signIn")}
        </Button>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  errorMessage: {
    color: "#b8243f",
    fontSize: 10,
    marginLeft: 6,
  },
  formContainer: {
    marginTop: "5%",
    width: "95%",
  },
  input: {
    backgroundColor: "transparent",
    fontFamily: "Roboto",
    fontSize: 18,
    margin: 5,
  },
  loginButton: {
    borderRadius: 30,
    marginTop: 8,
  },
  loginButtonLabel: {
    color: "#FFF",
    fontSize: 20,
    letterSpacing: 0,
  },
  mainContainer: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    width: "100%",
  },
});
