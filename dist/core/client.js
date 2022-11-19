"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Client = void 0;
var _bbClient = require("../adapters/bb-client");
var _formatDate = require("../utils/format-date");
var _generateBoleto = require("../utils/generate-boleto");
var _dateFns = require("date-fns");
class Client {
  constructor({
    BB_API_KEY,
    BB_BASIC_CREDENTIALS,
    BB_CONVENIO,
    BB_WALLET,
    BB_WALLET_VARIATION,
    BB_AGENCIA,
    BB_CONTA,
    ENVIRONMENT
  }) {
    this.bbClient = void 0;
    // instance of client
    this.bbClient = new _bbClient.BBClient({
      BB_API_KEY,
      BB_BASIC_CREDENTIALS,
      BB_CONVENIO,
      BB_WALLET,
      BB_WALLET_VARIATION,
      BB_AGENCIA,
      BB_CONTA,
      ENVIRONMENT
    });
  }
  async CreatePurchase({
    customerNeighborhood,
    customerAddress,
    customerCPF,
    customerCity,
    customerName,
    customerStateCode,
    customerZipCode,
    purchaseValue
  }) {
    // generate a new purchase
    const purchase = await this.bbClient.createPurchase({
      customerNeighborhood,
      customerZipCode,
      customerCity,
      customerCPF,
      customerAddress,
      customerStateCode,
      customerName,
      purchaseValue
    });

    // generate PDF
    const linkBoleto = await (0, _generateBoleto.generateBoleto)({
      environment: this.bbClient.getENVIRONMENT(),
      agencia: this.bbClient.getBB_AGENCIA(),
      conta: this.bbClient.getBB_CONTA(),
      bbConvenio: this.bbClient.getBB_CONVENIO(),
      bbWallet: this.bbClient.getBB_WALLET(),
      cepCliente: customerZipCode,
      cidadeComprador: customerCity,
      codigoBarraNumerico: purchase.purchaseBarCode,
      dataVencimento: (0, _formatDate.formatDate)((0, _dateFns.addDays)(new Date(), 1), 'dd/MM/yyyy'),
      enderecoComprador: customerAddress,
      estadoComprador: customerStateCode,
      nomeComprador: customerName,
      numeroBoleto: purchase.purschaseId,
      total: purchaseValue
    });
    return linkBoleto;
  }
  async SearchLastPurchase() {
    // get last purchase
    return await this.bbClient.searchLastPurchase();
  }
}
exports.Client = Client;