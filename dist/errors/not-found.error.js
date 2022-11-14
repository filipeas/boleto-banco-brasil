"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.NotFoundError = void 0;
var _app = require("./app.error");
class NotFoundError extends _app.AppError {
  constructor(message) {
    super(message, 404, 'not_found_error');
  }
}
exports.NotFoundError = NotFoundError;