"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.BBClient = void 0;
var _axios = _interopRequireWildcard(require("axios"));
var _crypto = _interopRequireDefault(require("crypto"));
var _dateFns = require("date-fns");
var _path = _interopRequireDefault(require("path"));
var _htmlPdf = _interopRequireDefault(require("html-pdf"));
var _handlebars = _interopRequireDefault(require("handlebars"));
var _jsbarcode = _interopRequireDefault(require("jsbarcode"));
var _xmldom = require("xmldom");
var _svg = _interopRequireDefault(require("svg64"));
var _fs = _interopRequireDefault(require("fs"));
var _formatDate = require("../utils/format-date");
var _checkBbClientProps = require("../utils/check-bb-client-props");
var _checkBbCreatePurchase = require("../utils/check-bb-create-purchase");
var _urls = require("../config/urls");
var _appKey = require("../config/app-key");
var _generateBoleto = require("../utils/generate-boleto");
var _generateLink = require("../utils/generate-link");
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
    this.BB_APP_KEY = _appKey.APP_KEY;

    // verify environment
    this.BB_API_URL = _urls.BB_URLS[ENVIRONMENT].API_URL;
    this.BB_OAUTH_URL = _urls.BB_URLS[ENVIRONMENT].OAUTH_URL;
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
  async SearchLastPurchase() {
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
  async CreatePurchase(data) {
    // verify params
    (0, _checkBbCreatePurchase.CheckBBCreatePurchase)(data);
    try {
      const auth = await this.auth();
      const accessToken = auth.data.access_token;
      let ticket;
      if (this.ENVIRONMENT === 'dev') {
        ticket = String(_crypto.default.randomInt(10000, 1000000)).padStart(10, '0');
      } else {
        const lastPurchase = await this.SearchLastPurchase();
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

  /**
   * Método responsável por gerar o modelo em PDF do boleto.
   * @param data ICreateBBPurchaseTicketProps
   * @return string Path do arquivo gerado
   */
  async CreatePurchaseTicket(data) {
    const codigoBanco = '001';
    const numMoeda = '9';
    const valor = data.ticketValue.toLocaleString('pt-br', {
      minimumFractionDigits: 2
    });
    const dataBoleto = {
      // nosso_numero: numBoleto,
      numero_documento: data.purchaseId,
      // Num do pedido ou do documento
      data_vencimento: data.dueDate,
      // Data de Vencimento do Boleto - REGRA: Formato DD/MM/AAAA
      data_documento: (0, _formatDate.formatDate)(new Date(), 'dd/MM/yyyy'),
      // Data de emissão do Boleto
      data_processamento: (0, _formatDate.formatDate)(new Date(), 'dd/MM/yyyy'),
      // Data de processamento do boleto (opcional)
      valor_boleto: valor,
      // Valor do Boleto - REGRA: Com vírgula e sempre com duas casas depois da virgula

      codigo_barras: data.numericBarcode,
      // linha_digitavel: linhaDigitavel,

      // DADOS DO SEU CLIENTE
      sacado: data.customerName,
      endereco1: data.customerAddress,
      endereco2: `${data.customerCity} - ${data.customerStateCode} - CEP: ${data.customerZipcode}`,
      // INFORMACOES PARA O CLIENTE
      demonstrativo1: '',
      demonstrativo2: '',
      demonstrativo3: '',
      // INSTRUÇÕES PARA O CAIXA
      instrucoes1: '- Sr. Caixa, não receber após o vencimento',
      instrucoes2: '',
      instrucoes3: '',
      instrucoes4: '',
      // DADOS OPCIONAIS DE ACORDO COM O BANCO OU CLIENTE
      quantidade: '',
      valor_unitario: '',
      aceite: 'N',
      especie: 'R$',
      especie_doc: 'DM',
      // ---------------------- DADOS FIXOS DE CONFIGURAÇÃO DO SEU BOLETO --------------- //

      // DADOS DA SUA CONTA - BANCO DO BRASIL
      agencia: this.BB_AGENCIA,
      // Num da agencia, sem digito
      conta: this.BB_CONTA,
      // Num da conta, sem digito

      // DADOS PERSONALIZADOS - BANCO DO BRASIL
      convenio: this.BB_CONVENIO,
      // Num do convênio - REGRA: 6 ou 7 ou 8 dígitos
      contrato: '999999',
      // Num do seu contrato
      carteira: this.BB_WALLET,
      variacao_carteira: '',
      // Variação da Carteira, com traço (opcional)

      // TIPO DO BOLETO
      formatacao_convenio: '7',
      // REGRA: 8 p/ Convênio c/ 8 dígitos, 7 p/ Convênio c/ 7 dígitos, ou 6 se Convênio c/ 6 dígitos
      formatacao_nosso_numero: '2',
      // REGRA: Usado apenas p/ Convênio c/ 6 dígitos: informe 1 se for NossoNúmero de até 5 dígitos ou 2 para opção de até 17 dígitos

      // SEUS DADOS
      identificacao: '',
      cpf_cnpj: '32.063.701/0001-66',
      endereco: '',
      cidade_uf: 'Teresina / PI',
      cedente: 'M & F COMERCIO DE LIVROS E ALIMENTOS LTDA',
      linha_digitavel: (0, _generateBoleto.montaLinhaDigitavel)(data.numericBarcode),
      agencia_codigo: `${this.BB_AGENCIA}-${(0, _generateBoleto.modulo11)(this.BB_AGENCIA)} / ${this.BB_CONTA}-${(0, _generateBoleto.modulo11)(this.BB_CONTA)}`,
      nosso_numero: (0, _generateBoleto.formatacaoConvenio7)(codigoBanco, numMoeda, String((0, _generateBoleto.fatorVencimento)(data.dueDate)), (0, _generateBoleto.formataNumero)(String(valor), 10, 0, 'valor'), '000000', this.BB_CONVENIO, data.purchaseId, this.BB_WALLET),
      codigo_banco_com_dv: (0, _generateBoleto.geraCodigoBanco)(codigoBanco)
    };
    const templatePath = _path.default.resolve(__dirname, '..', 'views', 'banco-do-brasil', 'boleto.hbs');

    // gerando barcode
    const xmlSerializer = new _xmldom.XMLSerializer();
    const document = new _xmldom.DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null);
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    (0, _jsbarcode.default)(svgNode, dataBoleto.linha_digitavel, {
      xmlDocument: document,
      height: 50,
      width: 1,
      displayValue: false
    });
    const svgText = xmlSerializer.serializeToString(svgNode);
    const b64 = (0, _svg.default)(svgText);

    // read logo banco do brasil
    const logoPath = _path.default.resolve(__dirname, '..', 'public', 'images', 'logobb.jpg');
    const logoBase64 = _fs.default.readFileSync(logoPath, {
      encoding: 'base64'
    });
    const templateHtml = _fs.default.readFileSync(templatePath).toString('utf-8');
    const templateHTML = _handlebars.default.compile(templateHtml);
    const html = templateHTML({
      dataBoleto,
      barcode: b64,
      logobb: logoBase64
    });
    // const html = templateHTML({ data, images });

    const pdfRootPath = _path.default.resolve(process.cwd(), 'tmp', 'uploads', 'boletos');
    if (!_fs.default.existsSync(pdfRootPath)) {
      _fs.default.mkdirSync(pdfRootPath, {
        recursive: true
      });
    }
    const milis = new Date().getTime();
    const pdfPath = _path.default.join(pdfRootPath, `boleto-${milis}.pdf`);
    _htmlPdf.default.create(html, {
      format: 'A4'
      // width: '22cm',
      // height: '29.7cm',
    }).toFile(pdfPath, (err, fileData) => {
      console.log(`Salvando PDF.`);
      if (err) return console.log(err);
      console.log('Pdf generated.');
      return fileData;
    });
    return (0, _generateLink.generateLink)('boletos', `boleto-${milis}.pdf`);
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