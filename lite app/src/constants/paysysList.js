const STRIPE_LOGO = require("../../assets/images/paysys/stripe.png");
const LIQPAY_LOGO = require("../../assets/images/paysys/liqpay.png");
const IPAY_LOGO = require("../../assets/images/paysys/ipay.png");
const P24_LOGO = require("../../assets/images/paysys/privat24.png");
const EASYPAY_LOGO = require("../../assets/images/paysys/easypay.png");
const FONDY_LOGO = require("../../assets/images/paysys/fondy.png");

//Available payment systems list
export const PaymentSystems = {
  Easypay: {
    title: "Easypay",
    logo: EASYPAY_LOGO,
  },
  Stripe: {
    title: "Stripe",
    logo: STRIPE_LOGO,
  },
  Privat_terminal: {
    title: "P24",
    logo: P24_LOGO,
  },
  Liqpay: {
    title: "Liqpay",
    logo: LIQPAY_LOGO,
  },
  Ipay_mp: {
    title: "iPay",
    logo: IPAY_LOGO,
  },
  Fondy: {
    title: "Fondy",
    logo: FONDY_LOGO,
  },
};
