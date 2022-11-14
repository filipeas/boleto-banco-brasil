"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createBoleto = createBoleto;
exports.findLastBoleto = findLastBoleto;
require("dotenv/config");
require("reflect-metadata");
var _boleto = require("./infra/repositories/boleto/boleto.repository");
var _createBoleto = require("./application/usecases/boleto/create-boleto");
var _findLastBoleto = require("./application/usecases/boleto/find-last-boleto");
async function createBoleto(environment, BB_API_KEY, BB_BASIC_CREDENTIALS, BB_CONVENIO, BB_WALLET, BB_WALLET_VARIATION, BB_AGENCIA, BB_API_URL, BB_APP_KEY, BB_CONTA, BB_OAUTH_URL, bairroComprador, cepCliente, cidadeComprador, cpfComprador, enderecoComprador, estadoComprador, nomeComprador, total) {
  const boletoRepository = new _boleto.BoletoRepository();
  const createBoleto = new _createBoleto.CreateBoleto(boletoRepository);
  const result = await createBoleto.run({
    environment,
    BB_API_KEY,
    BB_BASIC_CREDENTIALS,
    BB_CONVENIO,
    BB_WALLET,
    BB_WALLET_VARIATION,
    BB_AGENCIA,
    BB_API_URL,
    BB_APP_KEY,
    BB_CONTA,
    BB_OAUTH_URL,
    bairroComprador,
    cepCliente,
    cidadeComprador,
    cpfComprador,
    enderecoComprador,
    estadoComprador,
    nomeComprador,
    total
  });
  return result;
}
async function findLastBoleto(BB_AGENCIA, BB_API_KEY, BB_BASIC_CREDENTIALS, BB_CONTA, BB_OAUTH_URL, BB_API_URL, BB_APP_KEY) {
  const boletoRepository = new _boleto.BoletoRepository();
  const findLastBoleto = new _findLastBoleto.FindLastBoleto(boletoRepository);
  const result = findLastBoleto.run({
    BB_AGENCIA,
    BB_API_KEY,
    BB_BASIC_CREDENTIALS,
    BB_CONTA,
    BB_OAUTH_URL,
    BB_API_URL,
    BB_APP_KEY
  });
  return result;
}