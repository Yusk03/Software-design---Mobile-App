class errorException {
  ErrException(number, name) {
    this.error = `${number}`;
    this.message = `${name}`;
  }
}

module.exports = new errorException();
