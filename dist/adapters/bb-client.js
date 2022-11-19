"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BBClient = void 0;
var _axios = _interopRequireWildcard(require("axios"));
var _crypto = _interopRequireDefault(require("crypto"));
var _formatDate = require("../utils/format-date");
var _dateFns = require("date-fns");
var _checkBbClientProps = require("../utils/check-bb-client-props");
var _checkBbCreatePurchase = require("../utils/check-bb-create-purchase");
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
function _getRequireWildcardCache(nodeInterop) { if (typeof WeakMap !== "function") return null; var cacheBabelInterop = new WeakMap(); var cacheNodeInterop = new WeakMap(); return (_getRequireWildcardCache = function (nodeInterop) { return nodeInterop ? cacheNodeInterop : cacheBabelInterop; })(nodeInterop); }
function _interopRequireWildcard(obj, nodeInterop) { if (!nodeInterop && obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(nodeInterop); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (key !== "default" && Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }
class BBClient {
  /**
   * Método construtor responsável por receber as váriaveis de conexão com a API do Banco do Brasil.
   * 
   * @param BB_API_KEY API KEY do Banco do Brasil.
   * @param BB_BASIC_CREDENTIALS BASIC CREDENTIALS do Banco do Brasil.
   * @param  BB_CONVENIO, CONVENIO do Banco do Brasil.
   * @param  BB_WALLET WALLET do Banco do Brasil.
   * @param  BB_WALLET_VARIATION WALLET VARIATION do Banco do Brasil.
   * @param  BB_AGENCIA AGENCIA DO Banco do Brasil.
   * @param  BB_CONTA CONTA do Banco do Brasil.
   * @param  ENVIRONMENT Mecanismo de controle do client ('dev' para ambiente de desenvolvimento e 'prod' para ambiente de produção).
   */
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
    this.BB_API_KEY = void 0;
    this.BB_BASIC_CREDENTIALS = void 0;
    this.BB_CONVENIO = void 0;
    this.BB_WALLET = void 0;
    this.BB_WALLET_VARIATION = void 0;
    this.BB_AGENCIA = void 0;
    this.BB_API_URL = void 0;
    this.BB_APP_KEY = void 0;
    this.BB_CONTA = void 0;
    this.BB_OAUTH_URL = void 0;
    this.ENVIRONMENT = void 0;
    // verify params
    (0, _checkBbClientProps.CheckBBClientProps)({
      BB_API_KEY,
      BB_BASIC_CREDENTIALS,
      BB_CONVENIO,
      BB_WALLET,
      BB_WALLET_VARIATION,
      BB_AGENCIA,
      BB_CONTA,
      ENVIRONMENT
    });

    // set attributes
    this.BB_API_KEY = BB_API_KEY;
    this.BB_BASIC_CREDENTIALS = BB_BASIC_CREDENTIALS;
    this.BB_CONVENIO = BB_CONVENIO;
    this.BB_WALLET = BB_WALLET;
    this.BB_WALLET_VARIATION = BB_WALLET_VARIATION;
    this.BB_AGENCIA = BB_AGENCIA;
    this.BB_CONTA = BB_CONTA;
    this.ENVIRONMENT = ENVIRONMENT;

    // verify environment
    if (this.ENVIRONMENT === 'dev') {
      this.BB_API_URL = 'https://api.hm.bb.com.br/cobrancas/v2';
      this.BB_APP_KEY = 'gw-dev-app-key';
      this.BB_OAUTH_URL = 'https://oauth.sandbox.bb.com.br/oauth/token';
    } else {
      this.BB_API_URL = 'https://api.hm.bb.com.br/cobrancas/v2';
      this.BB_APP_KEY = 'gw-dev-app-key';
      this.BB_OAUTH_URL = 'https://oauth.sandbox.bb.com.br/oauth/token';
    }
  }

  /**
   * Método responsável por realizar autenticação com a API do Banco do Brasil.
   * 
   * @param bbBasicCredentials BASIC CREDENTIAL inserida na instância da classe.
   * @returns Retorna objeto de autenticação.
   */
  async auth() {
    const dataAuth = {
      grant_type: 'client_credentials',
      scope: 'cobrancas.boletos-info cobrancas.boletos-requisicao'
    };
    try {
      const urlAuth = this.BB_OAUTH_URL;
      const content = String(new URLSearchParams(dataAuth));
      return await _axios.default.post(`${urlAuth}`, content, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `${this.BB_BASIC_CREDENTIALS}`
        }
      });
    } catch (err) {
      throw new Error('Houve um erro na autenticação com a API. Por favor, verifique sua BB_BASIC_CREDENTIALS.');
    }
  }

  /**
   * Método responsável por buscar o último boleto válido da API do Banco do Brasil.
   * 
   * @returns IPurchase Boleto
   */
  async searchLastPurchase() {
    // set authentication
    const auth = await this.auth();
    const accessToken = auth.data.access_token;
    let purchase;
    const increment = 3;
    let newDays = 0; // increments the range of days for search the last purchase
    let interval = increment; // range of 3 days
    let checkLastInterval = false;

    // execute até achar pelo menos um boleto
    do {
      try {
        const yesterday = (0, _formatDate.formatDate)((0, _dateFns.addDays)(new Date(), -interval), 'dd.MM.yyyy');
        const today = (0, _formatDate.formatDate)((0, _dateFns.addDays)(new Date(), newDays), 'dd.MM.yyyy');
        const url = `${this.BB_API_URL}/boletos?${this.BB_APP_KEY}=${this.BB_API_KEY}&indicadorSituacao=B&agenciaBeneficiario=${this.BB_AGENCIA}&contaBeneficiario=${this.BB_CONTA}&dataInicioMovimento=${yesterday}&dataFimMovimento=${today}`;
        const res = await _axios.default.get(`${url}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`
          }
        });
        if (res.data) {
          checkLastInterval = true;
          purchase = res.data;
        }
        newDays -= increment;
        interval += increment;
      } catch (err) {
        throw new Error('Houve um erro ao buscar intervalo de boletos. Verifique os atributos de autenticação.');
      }
    } while (!checkLastInterval);

    // ordering by numeroBoletoBB
    const boletos = purchase.boletos.sort((a, b) => Number(a.numeroBoletoBB) - Number(b.numeroBoletoBB));

    // retorn the last purchase
    return boletos[boletos.length - 1];
  }

  /**
   * Método responsável por realizar requisição para criação de boleto na API do Banco do Brasil.
   * 
   * @param customerName Nome do comprador.
   * @param customerCPF CPF do comprador.
   * @param customerZipCode CEP do comprador.
   * @param customerAddress Endereço do comprador.
   * @param customerNeighborhood Bairro do comprador.
   * @param customerCity Cidade do comprador.
   * @param customerStateCode Sigla do estado do comprador.
   * @param purchaseValue Valor da compra em reais.
   * @returns Objeto do boleto.
   */
  async createPurchase(data) {
    // verify params
    (0, _checkBbCreatePurchase.CheckBBCreatePurchase)(data);
    try {
      const auth = await this.auth();
      const accessToken = auth.data.access_token;
      let ticket;
      if (this.ENVIRONMENT === 'dev') {
        ticket = String(_crypto.default.randomInt(10000, 1000000)).padStart(10, '0');
      } else {
        const lastPurchase = await this.searchLastPurchase();
        ticket = String(Number(lastPurchase.numeroBoletoBB.substring(10)) + 1).padStart(10, '0'); // increment 1 in for create a new purchase
      }

      const requestData = {
        numeroConvenio: this.BB_CONVENIO,
        numeroCarteira: this.BB_WALLET,
        numeroVariacaoCarteira: this.BB_WALLET_VARIATION,
        codigoModalidade: 1,
        dataEmissao: (0, _formatDate.formatDate)(new Date(), 'dd.MM.yyyy'),
        dataVencimento: (0, _formatDate.formatDate)((0, _dateFns.addDays)(new Date(), 1), 'dd.MM.yyyy'),
        // vencimento padrão de 1 dia
        valorOriginal: Number(data.purchaseValue),
        codigoAceite: 'A',
        codigoTipoTitulo: 2,
        indicadorPermissaoRecebimentoParcial: 'N',
        numeroTituloCliente: `000${this.BB_CONVENIO}${ticket}`,
        pagador: {
          tipoInscricao: 1,
          nome: data.customerName,
          numeroInscricao: data.customerCPF,
          cep: data.customerZipCode,
          endereco: data.customerAddress,
          cidade: data.customerCity,
          bairro: data.customerNeighborhood,
          uf: data.customerStateCode
        }
      };
      const response = await _axios.default.post(`${this.BB_API_URL}/boletos?${this.BB_APP_KEY}=${this.BB_API_KEY}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        }
      });
      return {
        purschaseId: response.data.numero,
        wallet: response.data.numeroCarteira,
        walletVariation: response.data.numeroVariacaoCarteira,
        customerCode: response.data.codigoCliente,
        purchaseNumber: response.data.linhaDigitavel,
        purchaseBarCode: response.data.codigoBarraNumerico,
        billingAccount: response.data.numeroContratoCobranca,
        ticketSequence: ticket,
        recipient: {
          angency: response.data.beneficiario.agencia,
          currentAccount: response.data.beneficiario.contaCorrente,
          addressType: response.data.beneficiario.tipoEndereco,
          address: response.data.beneficiario.logradouro,
          neighborhood: response.data.beneficiario.bairro,
          city: response.data.beneficiario.cidade,
          cityCode: response.data.beneficiario.codigoCidade,
          stateCode: response.data.beneficiario.uf,
          zipcode: response.data.beneficiario.cep,
          paymentVoucher: response.data.beneficiario.indicadorComprovacao
        },
        qrCode: {
          url: response.data.qrCode.url,
          txId: response.data.qrCode.txId,
          emv: response.data.qrCode.emv
        }
      };
    } catch (error) {
      // console.log({ error })
      const isAppError = error instanceof _axios.AxiosError;
      const message = isAppError ? `Houve um erro na geração do boleto pela API do Banco do Brasil. Err: ${error.response?.data.erros[0].mensagem} - ${error.response?.data.erros[0].ocorrencia}` : 'Não gerar um registro de boleto.';
      throw Error(message);
    }
  }
  getENVIRONMENT() {
    return this.ENVIRONMENT;
  }
  getBB_AGENCIA() {
    return this.BB_AGENCIA;
  }
  getBB_CONTA() {
    return this.BB_CONTA;
  }
  getBB_CONVENIO() {
    return this.BB_CONVENIO;
  }
  getBB_WALLET() {
    return this.BB_WALLET;
  }
}
exports.BBClient = BBClient;