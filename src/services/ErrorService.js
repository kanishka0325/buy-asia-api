const { ISE, BAD } = require('../constants/http_codes');

class ErrorService {
  constructor(code, message, type) {
    this.code = code;
    this.message = message;
    this.type = type;
  }

  static badRequest(msg) {
    return new ErrorService(400, msg, BAD);
  }

  static internal(msg) {
    return new ErrorService(500, msg, ISE);
  }
}

module.exports = ErrorService;
