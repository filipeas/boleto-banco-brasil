"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CreateBoleto = void 0;
var _boleto = require("../../repositories/boleto/boleto.repository");
var _either = require("../../../core/logic/either");
var _boleto2 = require("../../../domain/boleto/entities/boleto");
var _boleto3 = require("../../../domain/boleto/mappers/boleto.mapper");
var _notFound = require("../../../errors/not-found.error");
var _tsyringe = require("tsyringe");
var _crypto = _interopRequireDefault(require("crypto"));
var _dec, _dec2, _dec3, _dec4, _class;
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
let CreateBoleto = (_dec = (0, _tsyringe.injectable)(), _dec2 = function (target, key) {
  return (0, _tsyringe.inject)('BoletoRepository')(target, undefined, 0);
}, _dec3 = Reflect.metadata("design:type", Function), _dec4 = Reflect.metadata("design:paramtypes", [typeof _boleto.IBoletoRepository === "undefined" ? Object : _boleto.IBoletoRepository]), _dec(_class = _dec2(_class = _dec3(_class = _dec4(_class = class CreateBoleto {
  constructor(boletoRepository) {
    this.boletoRepository = boletoRepository;
  }
  async run({
    environment,
    BB_API_KEY,
    BB_BASIC_CREDENTIALS,
    BB_CONVENIO,
    BB_WALLET,
    BB_WALLET_VARIATION,
    BB_AGENCIA,
    BB_CONTA,
    BB_OAUTH_URL,
    BB_API_URL,
    BB_APP_KEY,
    nomeComprador,
    cpfComprador,
    cepCliente,
    cidadeComprador,
    estadoComprador,
    enderecoComprador,
    bairroComprador,
    total
  }) {
    const lastBoleto = await this.boletoRepository.findLastBoleto(BB_AGENCIA, BB_API_KEY, BB_BASIC_CREDENTIALS, BB_CONTA, BB_OAUTH_URL, BB_API_URL, BB_APP_KEY);
    if (!lastBoleto) {
      return (0, _either.left)(new _notFound.NotFoundError("Último boleto não encontrado"));
    }

    // size of numero do boleto must be 10 characters (get the last 10 characters and add 1 for take next boleto)
    console.log('Executando em modo: ' + environment);
    let numeroBoleto;
    if (environment === 'dev') {
      numeroBoleto = String(_crypto.default.randomInt(10000, 1000000)).padStart(10, '0');
    } else {
      numeroBoleto = String(Number(lastBoleto.numeroBoletoBB.substring(10)) + 1).padStart(10, '0');
    }
    const data = await this.boletoRepository.createBoleto({
      environment,
      BB_API_KEY,
      BB_BASIC_CREDENTIALS,
      BB_AGENCIA,
      BB_CONTA,
      BB_CONVENIO,
      BB_WALLET,
      BB_WALLET_VARIATION,
      BB_OAUTH_URL,
      BB_API_URL,
      BB_APP_KEY,
      nomeComprador,
      cpfComprador,
      cepCliente,
      enderecoComprador,
      bairroComprador,
      cidadeComprador,
      estadoComprador,
      numeroBoleto,
      total
    });

    // create boleto
    const boleto = _boleto2.Boleto.create({
      carteiraConvenio: BB_CONVENIO,
      codigoEstadoTituloCobranca: '',
      contrato: '',
      dataCredito: '',
      dataMovimento: '',
      dataRegistro: '',
      dataVencimento: '',
      estadoTituloCobranca: '',
      numeroBoletoBB: '',
      valorAtual: '',
      valorOriginal: '',
      valorPago: '',
      variacaoCarteiraConvenio: ''
    });
    return (0, _either.right)(_boleto3.BoletoMapper.toDto(boleto));
  }
}) || _class) || _class) || _class) || _class);
exports.CreateBoleto = CreateBoleto;