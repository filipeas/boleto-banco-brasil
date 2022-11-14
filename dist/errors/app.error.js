"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.AppError = void 0;
class AppError {
  constructor(message, statusCode, type) {
    this.message = void 0;
    this.statusCode = void 0;
    this.type = void 0;
    this.message = message;
    this.statusCode = statusCode;
    this.type = type;
  }
}
exports.AppError = AppError;