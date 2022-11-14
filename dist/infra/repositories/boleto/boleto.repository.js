"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoletoRepository = void 0;
var _bb = require("../../utils/bb");
var _generateBoleto = require("../../utils/generate-boleto");
var _formatDate = require("../../utils/format-date");
var _dateFns = require("date-fns");
class BoletoRepository {
  async createBoleto({
    environment,
    BB_API_KEY,
    BB_BASIC_CREDENTIALS,
    BB_AGENCIA,
    BB_CONTA,
    BB_CONVENIO,
    BB_WALLET,
    BB_WALLET_VARIATION,
    BB_API_URL,
    BB_APP_KEY,
    BB_OAUTH_URL,
    nomeComprador,
    cpfComprador,
    cepCliente,
    enderecoComprador,
    bairroComprador,
    cidadeComprador,
    estadoComprador,
    numeroBoleto,
    total
  }) {
    // instance of class Banco do Brasil (BB)
    const bb = new _bb.BB(BB_OAUTH_URL, BB_API_URL, BB_APP_KEY);

    // call function for create a boleto
    const request = await bb.createBoleto({
      bairroComprador,
      bbApiKey: BB_API_KEY,
      bbBasicCredentials: BB_BASIC_CREDENTIALS,
      bbConvenio: BB_CONVENIO,
      bbWallet: BB_WALLET,
      bbWalletVariation: BB_WALLET_VARIATION,
      cepCliente,
      cidadeComprador,
      cpfComprador,
      enderecoComprador,
      estadoComprador,
      nomeComprador,
      numeroBoleto,
      total
    });

    // generate PDF
    const linkBoleto = await (0, _generateBoleto.generateBoleto)({
      environment,
      agencia: BB_AGENCIA,
      conta: BB_CONTA,
      bbConvenio: BB_CONVENIO,
      bbWallet: BB_WALLET,
      cepCliente,
      cidadeComprador,
      codigoBarraNumerico: request.codigoBarraNumerico,
      dataVencimento: (0, _formatDate.formatDate)((0, _dateFns.addDays)(new Date(), 1), 'dd/MM/yyyy'),
      enderecoComprador,
      estadoComprador,
      nomeComprador,
      numeroBoleto: request.numero,
      total
    });

    // return boleto
    return request;
  }
  async findLastBoleto(agencia, apiKey, basicCredentials, conta, BB_OAUTH_URL, BB_API_URL, BB_APP_KEY) {
    // instance of class Banco do Brasil (BB)
    const bb = new _bb.BB(BB_OAUTH_URL, BB_API_URL, BB_APP_KEY);

    // get list of boletos generated in the last 3 days
    const request = await bb.searchBoleto({
      bbAgencia: agencia,
      bbApiKey: apiKey,
      bbBasicCredentials: basicCredentials,
      bbConta: conta
    });

    // ordering by numeroBoletoBB
    const boletos = request.boletos.sort((a, b) => Number(a.numeroBoletoBB) - Number(b.numeroBoletoBB));

    // retornar boleto
    return boletos[boletos.length - 1];
  }
  async findBoletosByConta(conta) {
    throw new Error("Method not implemented.");
  }
}
exports.BoletoRepository = BoletoRepository;