import apiErrors from "./apiErrors";

class apiErrorExceptions {
  ApiRequestException(status, path) {
    //TODO check path is not exists
    this.error = `${apiErrors[path]}`;
    this.message = `${status} - ${apiErrors[status]}`;
  }

  ApiRequestError(status) {
    //TODO check path is not exists
    this.error = `${status}`;
    this.message = `${apiErrors[status]}`;
  }
}

module.exports = new apiErrorExceptions();
