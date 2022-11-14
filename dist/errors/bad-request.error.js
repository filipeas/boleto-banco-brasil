"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BadRequestError = void 0;
var _app = require("./app.error");
class BadRequestError extends _app.AppError {
  constructor(message) {
    super(message, 400, 'bab_request_error');
  }
}
exports.BadRequestError = BadRequestError;