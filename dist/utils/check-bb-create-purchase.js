"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CheckBBCreatePurchase = CheckBBCreatePurchase;
function CheckBBCreatePurchase(data) {
  if (!data.customerName) {
    throw new Error('Informe o nome do cliente');
  }
  if (!data.customerCPF) {
    throw new Error('Informe um CPF');
  }
  if (!data.customerZipCode) {
    throw new Error('Informe um CEP');
  }
  if (!data.customerAddress) {
    throw new Error('Informe um endereço');
  }
  if (!data.customerNeighborhood) {
    throw new Error('Informe um bairro');
  }
  if (!data.customerCity) {
    throw new Error('Informe uma cidade');
  }
  if (!data.customerStateCode) {
    throw new Error('Informe a sigla do estado');
  }
  if (!data.purchaseValue) {
    throw new Error('Informe o valor da compra');
  }
}