/**
 *
 */

import lang from "../translations/lang";

const apiErrors = {
  // path to error
  "post/users/login": 901,
  "get/user/number/pi": 902,
  "get/user/number": 903,
  "get/user/number/internet": 904,
  "get/user/number/payments": 905,
  "get/user/number/fees": 906,
  "get/version": 907,
  "get/user/number/internet/speed": 908,
  "get/user/number/internet/tariffs/all": 909,
  "get/user/number/internet/speed/number": 910,
  "get/user/number/credit": 912,
  "post/user/number/credit": 913,
  "get/user/number/msgs": 915,
  "post/user/number/msgs": 916,
  "get/user/number/msgs/number/reply": 917,
  "post/user/number/msgs/number/reply": 918,

  // errors
  300: "Can't load config file config.pl",
  301: lang.t("enableAPI"),
  302: lang.t("needNewAPI"),
  
  10: lang.t("accessDenied"),
  600: lang.t("paymentMethodNotSupported"),
  601: lang.t("paysysPaySystemId"),
  602: lang.t("paysysPaySySum"),
  603: lang.t("paysysPaySyOperationId"),
  610: lang.t("paymentMethodNotSupported"),
  99998: lang.t("yourSessionExpired"),
  99999: lang.t("fatalRequestError"),
};

export default apiErrors;
