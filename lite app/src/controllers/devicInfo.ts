import DeviceInfo from "react-native-device-info";

class deviceInfo {
  getConstantDeviceInfo() {
    return [
      {
        name: "uniqueID",
        title: DeviceInfo.getUniqueId(),
      },
      {
        name: "deviceID",
        title: DeviceInfo.getDeviceId(),
      },
      {
        name: "bundleID",
        title: DeviceInfo.getBundleId(),
      },
      {
        name: "systemName",
        title: DeviceInfo.getSystemName(),
      },
      {
        name: "systemVersion",
        title: DeviceInfo.getSystemVersion(),
      },
      {
        name: "readableVersion",
        title: DeviceInfo.getReadableVersion(),
      },
      {
        name: "buildNumber",
        title: DeviceInfo.getBuildNumber(),
      },
      {
        name: "brand",
        title: DeviceInfo.getBrand(),
      },
      {
        name: "model",
        title: DeviceInfo.getModel(),
      },
      {
        name: "deviceType",
        title: DeviceInfo.getDeviceType(),
      },
    ];
  }
}

module.exports = new deviceInfo();
