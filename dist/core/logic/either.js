"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.right = exports.left = exports.Right = exports.Left = void 0;
class Left {
  constructor(value) {
    this.value = void 0;
    this.value = value;
  }
  isLeft() {
    return true;
  }
  isRight() {
    return false;
  }
}
exports.Left = Left;
class Right {
  constructor(value) {
    this.value = void 0;
    this.value = value;
  }
  isLeft() {
    return false;
  }
  isRight() {
    return true;
  }
}
exports.Right = Right;
const left = l => {
  return new Left(l);
};
exports.left = left;
const right = a => {
  return new Right(a);
};
exports.right = right;