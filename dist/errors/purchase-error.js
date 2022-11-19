"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PurchaseError = void 0;
class PurchaseError {
  constructor(message, code) {
    this.message = void 0;
    this.code = void 0;
    this.message = message;
    if (code) {
      this.code = code;
    }
  }
}
exports.PurchaseError = PurchaseError;