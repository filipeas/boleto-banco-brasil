"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.UnauthozitedError = void 0;
var _app = require("./app.error");
class UnauthozitedError extends _app.AppError {
  constructor(message, type = 'auth_error') {
    super(message, 401, type);
  }
}
exports.UnauthozitedError = UnauthozitedError;