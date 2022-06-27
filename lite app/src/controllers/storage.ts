import AsyncStorage from "@react-native-async-storage/async-storage";
import errorExceptions from "./errorExceptions";

// Controller for Storage
export default {
  // set value string
  setValue: async (name, value) => {
    try {
      await AsyncStorage.setItem(name, value);
    } catch (e) {
      console.log(e);
      throw new errorExceptions.ErrException(
        1000,
        `AsyncStorage Failed set value ${name}`
      );
    }
  },

  // set object
  setObject: async (name, value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem(name, jsonValue);
    } catch (e) {
      console.log(e);
      throw new errorExceptions.ErrException(
        1001,
        `AsyncStorage Failed set object ${name}`
      );
    }
  },

  // get value string
  getValue: async (name) => {
    try {
      return await AsyncStorage.getItem(name);
    } catch (e) {
      console.log(e);
      throw new errorExceptions.ErrException(
        1002,
        `AsyncStorage Failed get value ${name}`
      );
    }
  },

  // get object
  getObject: async (name) => {
    try {
      const jsonValue = await AsyncStorage.getItem(name);
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch (e) {
      console.log(e);
      throw new errorExceptions.ErrException(
        1003,
        `AsyncStorage Failed get object ${name}`
      );
    }
  },

  // delete one value
  removeValue: async (name) => {
    try {
      await AsyncStorage.removeItem(name);
    } catch (e) {
      console.log(e);
      throw new errorExceptions.ErrException(
        1004,
        `AsyncStorage Failed remove value ${name}`
      );
    }
  },

  // delete all data from storage
  clearAll: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.log(e);
      throw new errorExceptions.ErrException(
        1005,
        `AsyncStorage Failed delete all values`
      );
    }
  },

  // get all keys from storage
  getAllKeys: async () => {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (e) {
      console.log(e);
      throw new errorExceptions.ErrException(
        1006,
        `AsyncStorage Failed get all keys`
      );
    }
  },

  setArray: async (name, value) => {
    try {
      await AsyncStorage.setItem(name, JSON.stringify(value));
    } catch (e) {
      console.log(e);
      throw new errorExceptions.ErrException(
        1007,
        `AsyncStorage Failed set array ${name}`
      );
    }
  },

  getArray: async (name) => {
    try {
      return JSON.parse(await AsyncStorage.getItem(name));
    } catch (e) {
      console.log(e);
      throw new errorExceptions.ErrException(
        1008,
        `AsyncStorage Failed get array ${name}`
      );
    }
  },
};
