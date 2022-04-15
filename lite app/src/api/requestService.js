import axios from "axios";
import storage from "../controllers/storage";
import apiErrorExceptions from "./apiErrorExceptions";
import { navigate } from "../navigation/Navigator";

export default {
  post: async (path, headers, body, params) => {
    const url = await storage.getValue("url");
    const response = await axios
      .post(`${url}${path}`, { ...body }, { headers: { ...headers } })
      .catch((error) => {
        handleErrors(error, `post${path}`, headers);
      });

    return validateResponse(response, params);
  },
  put: async (path, headers, body, params) => {
    const url = await storage.getValue("url");
    const response = await axios
      .put(`${url}${path}`, { ...body }, { headers: { ...headers } })
      .catch((error) => {
        handleErrors(error, `put${path}`, headers);
      });

    return validateResponse(response, params);
  },
  get: async (path, headers, params) => {
    const url = await storage.getValue("url");
    const response = await axios
      .get(`${url}${path}`, { headers: { ...headers } })
      .catch((error) => {
        handleErrors(error, `get${path}`, headers);
      });

    return validateResponse(response, params);
  },
};

const validateResponse = async (response, params) => {
  //TODO: add unit test for API responses check

  if (params != null && params?.writeToStorage) {
    await writeToStorage(params.writeToStorage, response.data);
  }

  if (response?.data && (response?.data?.errno || response?.data?.error)) {
    if (params?.writeToStorage?.name !== "internetListArray") {
      throw new apiErrorExceptions.ApiRequestError(
        response?.data?.errno || response?.data?.error
      );
    }
  }

  // shitty hardcode
  if(response?.data?.apiVersion && response?.data?.apiVersion < 0.06) {
    throw new apiErrorExceptions.ApiRequestError(302);
  }

  return response.data;
};

const handleErrors = (response, path, headers) => {
  path = path.replace(/\/\d+/g, "/number");

  if (
    response?.response &&
    response.response.status !== 200 &&
    response.response.headers[`content-type`] ===
      "application/json; charset=utf8"
  ) {
    //TODO: add normal messages for different statuses and number request on which crashed

    if (headers && headers?.USERSID) {
      navigate("Login");
      throw new apiErrorExceptions.ApiRequestError("99998");
    } else {
      throw new apiErrorExceptions.ApiRequestException(
        response.response.data.errno,
        path
      );
    }
  } else {
    throw new apiErrorExceptions.ApiRequestException("99999", path);
  }
};

const writeToStorage = async (params, data) => {
  if (params.type === "setObject") {
    await storage.setObject(params.name, data);
  } else if (params.type === "setArray") {
    await storage.setArray(params.name, data);
  } else {
    await storage.setValue(params.name, data);
  }
};
