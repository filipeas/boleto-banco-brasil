"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateLink = generateLink;
function generateLink(folder, filename) {
  if (filename) return `${process.cwd()}/tmp/uploads/${folder}/${filename}`;
  return ``;
}