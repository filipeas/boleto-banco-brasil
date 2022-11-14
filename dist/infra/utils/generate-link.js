"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateLink = generateLink;
function generateLink(folder, filename) {
  if (filename) return `${process.env.APP_URL}/uploads/${folder}/${filename}`;
  return ``;
}