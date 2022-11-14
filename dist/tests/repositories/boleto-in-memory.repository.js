"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BoletoInMemoryRepository = void 0;
var _boleto = require("../../domain/boleto/entities/boleto");
class BoletoInMemoryRepository {
  constructor() {
    this.boletos = [];
    const boleto1 = _boleto.Boleto.create({
      numeroBoletoBB: '0000000001',
      dataRegistro: '14.11.2022',
      dataVencimento: '15.11.2022',
      valorOriginal: '1000',
      carteiraConvenio: '2',
      variacaoCarteiraConvenio: '3',
      codigoEstadoTituloCobranca: 'PI',
      estadoTituloCobranca: 'PI',
      contrato: '6',
      dataMovimento: '14.11.2022',
      dataCredito: '14.11.2022',
      valorAtual: '1000',
      valorPago: '1000'
    });
    this.boletos.push(boleto1);
    const boleto2 = _boleto.Boleto.create({
      numeroBoletoBB: '0000000002',
      dataRegistro: '14.11.2022',
      dataVencimento: '15.11.2022',
      valorOriginal: '1000',
      carteiraConvenio: '2',
      variacaoCarteiraConvenio: '3',
      codigoEstadoTituloCobranca: 'PI',
      estadoTituloCobranca: 'PI',
      contrato: '6',
      dataMovimento: '14.11.2022',
      dataCredito: '14.11.2022',
      valorAtual: '1000',
      valorPago: '1000'
    });
    this.boletos.push(boleto2);
  }
  async createBoleto({
    BB_API_KEY,
    BB_BASIC_CREDENTIALS,
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
    const boleto = _boleto.Boleto.create({
      numeroBoletoBB: numeroBoleto,
      dataRegistro: '14.11.2022',
      dataVencimento: '15.11.2022',
      valorOriginal: String(total),
      carteiraConvenio: '2',
      variacaoCarteiraConvenio: '3',
      codigoEstadoTituloCobranca: estadoComprador,
      estadoTituloCobranca: estadoComprador,
      contrato: '6',
      dataMovimento: '14.11.2022',
      dataCredito: '14.11.2022',
      valorAtual: String(total),
      valorPago: String(total)
    });
    this.boletos.push(boleto);
    return {
      numero: '1',
      numeroCarteira: Number(BB_WALLET),
      numeroVariacaoCarteira: Number(BB_WALLET_VARIATION),
      codigoCliente: 2,
      linhaDigitavel: '3',
      codigoBarraNumerico: '12345678900000000000',
      numeroContratoCobranca: 4,
      ticketSequence: '1',
      beneficiario: {
        agencia: 5,
        contaCorrente: 123,
        tipoEndereco: 6,
        logradouro: enderecoComprador,
        bairro: bairroComprador,
        cidade: cidadeComprador,
        codigoCidade: 7,
        uf: estadoComprador,
        cep: Number(cepCliente),
        indicadorComprovacao: '8'
      },
      qrCode: {
        url: 'http://boleto-banco-brasil/teste',
        txId: '',
        emv: ''
      }
    };
  }
  async findLastBoleto(agencia, apiKey, basicCredentials, conta, BB_OAUTH_URL, BB_API_URL, BB_APP_KEY) {
    if (BB_OAUTH_URL === '1') return this.boletos[-1];
    return this.boletos[this.boletos.length - 1];
  }
  async findBoletosByConta(conta) {
    throw new Error("Method not implemented.");
  }
}
exports.BoletoInMemoryRepository = BoletoInMemoryRepository;