"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Boleto = void 0;
var _entity = require("../../../core/domain/entity");
class Boleto extends _entity.Entity {
  constructor(props) {
    super(props);
  }
  get numeroBoletoBB() {
    return this.props.numeroBoletoBB;
  }
  get dataRegistro() {
    return this.props.dataRegistro;
  }
  get dataVencimento() {
    return this.props.dataVencimento;
  }
  get valorOriginal() {
    return this.props.valorOriginal;
  }
  get carteiraConvenio() {
    return this.props.carteiraConvenio;
  }
  get variacaoCarteiraConvenio() {
    return this.props.variacaoCarteiraConvenio;
  }
  get codigoEstadoTituloCobranca() {
    return this.props.codigoEstadoTituloCobranca;
  }
  get estadoTituloCobranca() {
    return this.props.estadoTituloCobranca;
  }
  get contrato() {
    return this.props.contrato;
  }
  get dataMovimento() {
    return this.props.dataMovimento;
  }
  get dataCredito() {
    return this.props.dataCredito;
  }
  get valorAtual() {
    return this.props.valorAtual;
  }
  get valorPago() {
    return this.props.valorPago;
  }
  static create(props) {
    const boleto = new Boleto(props);
    return boleto;
  }
}
exports.Boleto = Boleto;