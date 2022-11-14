"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoletoMapper = void 0;
var _boleto = require("../entities/boleto");
class BoletoMapper {
  static toDto(boleto) {
    const {
      carteiraConvenio,
      codigoEstadoTituloCobranca,
      contrato,
      dataCredito,
      dataMovimento,
      dataRegistro,
      dataVencimento,
      estadoTituloCobranca,
      numeroBoletoBB,
      valorAtual,
      valorOriginal,
      valorPago,
      variacaoCarteiraConvenio
    } = boleto;
    return {
      carteiraConvenio,
      codigoEstadoTituloCobranca,
      contrato,
      dataCredito,
      dataMovimento,
      dataRegistro,
      dataVencimento,
      estadoTituloCobranca,
      numeroBoletoBB,
      valorAtual,
      valorOriginal,
      valorPago,
      variacaoCarteiraConvenio
    };
  }
  static toDomain(boleto) {
    const {
      ...rest
    } = boleto;
    return _boleto.Boleto.create({
      ...rest
    });
  }
}
exports.BoletoMapper = BoletoMapper;