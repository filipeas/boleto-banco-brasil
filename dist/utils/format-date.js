"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.addDays = addDays;
exports.convertDateToAmericanFormat = convertDateToAmericanFormat;
exports.formatDate = formatDate;
var _dateFns = require("date-fns");
function getDate(date) {
  let parsedDate;
  if (typeof date === 'string') {
    parsedDate = (0, _dateFns.parseISO)(date);
  } else if (typeof date === 'number') {
    parsedDate = new Date(date);
  } else {
    parsedDate = date;
  }
  return parsedDate;
}
function convertDateToAmericanFormat(date) {
  const dataFormatada = date.split(".");
  const novaData = dataFormatada[1] + '-' + dataFormatada[0] + '-' + dataFormatada[2];
  return novaData;
}
function formatDate(date, dateFormat) {
  const parsedDate = getDate(date);
  return (0, _dateFns.format)(parsedDate, dateFormat);
}
function addDays(date, daysCount) {
  const parsedDate = getDate(date);
  return (0, _dateFns.addDays)(parsedDate, daysCount);
}