import request from "./requestService";
import storage from "../controllers/storage";

/**
 * For future
 */
// const queryString = (obj) => {
//   return Object.entries(obj)
//     .map(([index, val]) => `${index}=${val}`)
//     .join("&");
// };

class Router {
  login = async (body) => {
    const res = await request.post("/users/login", {}, body, {
      writeToStorage: { type: "setObject", name: "userObj" },
    });
    await this.version();
    await this.user();
    await this.userPi();
    await this.internetInfo();
    await this.internetSpeed();
    await this.internetList();
    await this.feesList();
    await this.paymentsList();
    await this.paysysList();
    return res;
  };

  // Basic requests
  version = async () =>
    await request.get(
      "/version",
      {},
      { writeToStorage: { type: "setObject", name: "versionObj" } }
    );

  // Basic user info
  user = async () => {
    const user = await storage.getObject("userObj");
    return await request.get(
      `/user/${user.uid}`,
      { USERSID: user.sid || "" },
      { writeToStorage: { type: "setObject", name: "subInfoObj" } }
    );
  };
  userPi = async () => {
    const user = await storage.getObject("userObj");
    return await request.get(
      `/user/${user.uid}/pi`,
      { USERSID: user.sid || "" },
      { writeToStorage: { type: "setObject", name: "subInfoPiObj" } }
    );
  };

  // Credit info
  userCredit = async () => {
    const user = await storage.getObject("userObj");
    return await request.get(
      `/user/${user.uid}/credit`,
      { USERSID: user.sid || "" },
      { writeToStorage: { type: "setObject", name: "creditObj" } }
    );
  };
  userGetCredit = async () => {
    const user = await storage.getObject("userObj");
    return await request.post(
      `/user/${user.uid}/credit`,
      { USERSID: user.sid || "" },
    );
  };

  // Messages
  msgsList = async () => {
    const user = await storage.getObject("userObj");
    return await request.get(`/user/${user.uid}/msgs`, {
      USERSID: user.sid || "",
    });
  };
  msgCreate = async (body) => {
    const user = await storage.getObject("userObj");
    return await request.post(
      `/user/${user.uid}/msgs`,
      { USERSID: user.sid || "" },
      body
    );
  };
  ticket = async (id) => {
    const user = await storage.getObject("userObj");
    return await request.get(`/user/${user.uid}/msgs/${id}/reply`, {
      USERSID: user.sid || "",
    });
  };
  ticketReply = async (id, body) => {
    const user = await storage.getObject("userObj");
    return await request.post(
      `/user/${user.uid}/msgs/${id}/reply`,
      { USERSID: user.sid || "" },
      body
    );
  };

  // Internet
  internetSpeed = async () => {
    const user = await storage.getObject("userObj");
    return await request.get(
      `/user/${user.uid}/internet/speed`,
      { USERSID: user.sid || "" },
      { writeToStorage: { type: "setObject", name: "internetSpeedObj" } }
    );
  };
  internetInfo = async () => {
    const user = await storage.getObject("userObj");
    return await request.get(
      `/user/${user.uid}/internet`,
      { USERSID: user.sid || "" },
      { writeToStorage: { type: "setObject", name: "internetInfoObj" } }
    );
  };
  internetList = async () => {
    const user = await storage.getObject("userObj");
    return await request.get(
      `/user/${user.uid}/internet/tariffs/all`,
      { USERSID: user.sid || "" },
      { writeToStorage: { type: "setArray", name: "internetListArray" } }
    );
  };
  changeTariff = async (id, body) => {
    const user = await storage.getObject("userObj");
    return await request.put(
      `/user/${user.uid}/internet/${id}`,
      { USERSID: user.sid || "" },
      body
    );
  };

  // Fees
  feesList = async () => {
    const user = await storage.getObject("userObj");
    return await request.get(
      `/user/${user.uid}/fees`,
      { USERSID: user.sid || "" },
      { writeToStorage: { type: "setArray", name: "feesListArray" } }
    );
  };

  // Payments
  paymentsList = async () => {
    const user = await storage.getObject("userObj");
    return await request.get(
      `/user/${user.uid}/payments`,
      { USERSID: user.sid || "" },
      { writeToStorage: { type: "setArray", name: "paymentsListArray" } }
    );
  };

  // Paysys
  paysysList = async () => {
    const user = await storage.getObject("userObj");
    return await request.get(
      `/user/${user.uid}/paysys/systems`,
      { USERSID: user.sid },
      { writeToStorage: { type: "setArray", name: "paysysList" } }
    );
  };
  paysysPay = async (body) => {
    const user = await storage.getObject("userObj");
    return await request.post(
      `/user/${user.uid}/paysys/pay`,
      { USERSID: user.sid },
      body
    );
  };
}

module.exports = new Router();
