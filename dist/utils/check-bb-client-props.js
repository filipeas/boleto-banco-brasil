"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CheckBBClientProps = CheckBBClientProps;
var _purchaseError = require("../errors/purchase-error");
function CheckBBClientProps({
  BB_API_KEY,
  BB_BASIC_CREDENTIALS,
  BB_CONVENIO,
  BB_WALLET,
  BB_WALLET_VARIATION,
  BB_AGENCIA,
  BB_CONTA,
  ENVIRONMENT
}) {
  if (!BB_API_KEY) {
    throw new _purchaseError.PurchaseError('Informe uma BB_API_KEY');
  }
  if (!BB_BASIC_CREDENTIALS) {
    throw new _purchaseError.PurchaseError('Informe uma BB_BASIC_CREDENTIALS');
  }
  if (!BB_CONVENIO) {
    throw new _purchaseError.PurchaseError('Informe uma BB_CONVENIO');
  }
  if (!BB_WALLET) {
    throw new _purchaseError.PurchaseError('Informe uma BB_WALLET');
  }
  if (!BB_WALLET_VARIATION) {
    throw new _purchaseError.PurchaseError('Informe uma BB_WALLET_VARIATION');
  }
  if (!BB_AGENCIA) {
    throw new _purchaseError.PurchaseError('Informe uma BB_AGENCIA');
  }
  if (!BB_CONTA) {
    throw new _purchaseError.PurchaseError('Informe uma BB_CONTA');
  }
  if (!ENVIRONMENT) {
    throw new _purchaseError.PurchaseError('Informe uma ENVIRONMENT');
  } else if (ENVIRONMENT !== 'dev' && ENVIRONMENT !== 'prod') {
    throw new _purchaseError.PurchaseError('ENVIRONMENT permitidas: "dev" ou "prod');
  }
}