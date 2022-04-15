import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Button, Card, Title } from "react-native-paper";
import Modal from "react-native-modal";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CustomModal({
  title,
  visible,
  onDismiss,
  onAgree,
  dismissLabel,
  agreeLabel,
  theme,
  buttonDisabled,
  children,
}) {
  const inits = useSafeAreaInsets();

  const { colors } = theme;

  const deviceHeight = Dimensions.get("window").height + 100;
  const deviceWidth = Dimensions.get("window").width;

  return (
    <Modal
      isVisible={visible}
      deviceHeight={deviceHeight}
      deviceWidth={deviceWidth}
      animationInTiming={400}
      animationOutTiming={1000}
      backdropTransitionInTiming={400}
      backdropTransitionOutTiming={1000}
      onBackButtonPress={onDismiss}
      onBackdropPress={onDismiss}
      useNativeDriver={true}
      statusBarTranslucent={true}
      style={[styles.modal, { paddingBottom: inits.bottom }]}
      hideModalContentWhileAnimating={true}
    >
      <Card
        style={[
          styles.modalCard,
          { backgroundColor: colors?.card || "white" },
        ]}
      >
        <View style={styles.modalContent}>
          <Title style={styles.modalTitle}>{title}</Title>
          <ScrollView style={styles.modalReadContent}>
            {children}
          </ScrollView>
          <View style={styles.buttonList}>
            <Button
              disabled={buttonDisabled}
              labelStyle={styles.buttonLabel}
              contentStyle={{ backgroundColor: buttonDisabled ? colors.disabled : colors.button }}
              style={[styles.button, { width: dismissLabel ? "42%" : "100%"}]}
              mode="contained"
              uppercase={false}
              onPress={onAgree}
            >
              {agreeLabel}
            </Button>
            {dismissLabel && <Button
              labelStyle={styles.buttonLabel}
              contentStyle={{  backgroundColor: colors.button }}
              style={styles.button}
              mode="contained"
              uppercase={false}
              onPress={onDismiss}
            >
              {dismissLabel}
            </Button>}
          </View>
        </View>
      </Card>
    </Modal>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 50,
    width: "42%",
  },
  buttonLabel: {
    fontSize: 20,
  },
  buttonList: {
    flexDirection: "row",
    justifyContent: "space-between",
    minWidth: "100%",
    maxWidth: "100%",
  },
  modalCard: {
    alignItems: "center",
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
    justifyContent: "flex-end",
    maxHeight: "75%",
  },
  modalContent: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginBottom: 25,
    marginHorizontal: 25,
    marginTop: 15,
  },
  modal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold" 
  },
  modalReadContent: {
    flexGrow: 0,
    marginBottom: 20,
    paddingHorizontal: 15,
    marginTop: 20,
    minWidth: "100%",
    maxWidth: "100%"
  },
});
