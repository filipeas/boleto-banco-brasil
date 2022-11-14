"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FindLastBoleto = void 0;
var _boleto = require("../../repositories/boleto/boleto.repository");
var _either = require("../../../core/logic/either");
var _boleto2 = require("../../../domain/boleto/mappers/boleto.mapper");
var _notFound = require("../../../errors/not-found.error");
var _tsyringe = require("tsyringe");
var _dec, _dec2, _dec3, _dec4, _class;
let FindLastBoleto = (_dec = (0, _tsyringe.injectable)(), _dec2 = function (target, key) {
  return (0, _tsyringe.inject)('BoletoRepository')(target, undefined, 0);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof _boleto.IBoletoRepository === "undefined" ? Object : _boleto.IBoletoRepository]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class FindLastBoleto {
  constructor(boletoRepository) {
    this.boletoRepository = boletoRepository;
  }
  async run({
    BB_AGENCIA,
    BB_API_KEY,
    BB_BASIC_CREDENTIALS,
    BB_CONTA,
    BB_OAUTH_URL,
    BB_API_URL,
    BB_APP_KEY
  }) {
    const boleto = await this.boletoRepository.findLastBoleto(BB_AGENCIA, BB_API_KEY, BB_BASIC_CREDENTIALS, BB_CONTA, BB_OAUTH_URL, BB_API_URL, BB_APP_KEY);
    if (!boleto) {
      return (0, _either.left)(new _notFound.NotFoundError("Último boleto não encontrado"));
    }
    return (0, _either.right)(_boleto2.BoletoMapper.toDomain(boleto));
  }
}) || _class) || _class) || _class) || _class);
exports.FindLastBoleto = FindLastBoleto;