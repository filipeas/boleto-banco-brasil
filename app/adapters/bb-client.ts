import axios, { AxiosError } from "axios";
import crypto from 'crypto';
import { addDays } from "date-fns";
import path from 'path';
import pdf from 'html-pdf';
import handlebars from 'handlebars';
import JSBarcode from 'jsbarcode';
import { DOMImplementation, XMLSerializer } from 'xmldom';
import svg64 from 'svg64';
import fs from 'fs';

import { formatDate } from "../utils/format-date";

import { IClientProvider, ICreateBBPurchaseProps, ICreateBBPurchaseTicketProps, IPurchase, IResponseBBPurchaseProps, IResponseSearchBBPurchase } from "../providers/client.provider";

import { CheckBBClientProps } from "../utils/check-bb-client-props";
import { CheckBBCreatePurchase } from "../utils/check-bb-create-purchase";
import { BB_URLS } from "../config/urls";
import { APP_KEY } from "../config/app-key";
import { fatorVencimento, formatacaoConvenio7, formataNumero, geraCodigoBanco, modulo11, montaLinhaDigitavel } from "../utils/generate-boleto";
import { generateLink } from "../utils/generate-link";

export type IBBClientProps = {
  BB_API_KEY: string,
  BB_BASIC_CREDENTIALS: string,
  BB_CONVENIO: string,
  BB_WALLET: string,
  BB_WALLET_VARIATION: string,
  BB_AGENCIA: string,
  BB_CONTA: string,
  ENVIRONMENT: 'dev' | 'prod'
}

export class BBClient implements IClientProvider {
  private BB_API_KEY!: string;
  private BB_BASIC_CREDENTIALS!: string;
  private BB_CONVENIO!: string;
  private BB_WALLET!: string;
  private BB_WALLET_VARIATION!: string;
  private BB_AGENCIA!: string;
  private BB_API_URL!: string;
  private BB_APP_KEY!: string;
  private BB_CONTA!: string;
  private BB_OAUTH_URL!: string;
  private ENVIRONMENT!: 'dev' | 'prod';

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
  }: IBBClientProps) {
    // verify params
    CheckBBClientProps({
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
    this.BB_APP_KEY = APP_KEY;

    // verify environment
    this.BB_API_URL = BB_URLS[ENVIRONMENT].API_URL;
    this.BB_OAUTH_URL = BB_URLS[ENVIRONMENT].OAUTH_URL;
  }
  
  /**
   * Método responsável por realizar autenticação com a API do Banco do Brasil.
   * 
   * @param bbBasicCredentials BASIC CREDENTIAL inserida na instância da classe.
   * @returns Retorna objeto de autenticação.
   */
  private async auth() {
    const dataAuth = {
      grant_type: 'client_credentials',
      scope: 'cobrancas.boletos-info cobrancas.boletos-requisicao',
    };

    try {
      const urlAuth = this.BB_OAUTH_URL;
      const content = String(new URLSearchParams(dataAuth));
      return await axios.post(`${urlAuth}`, content, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `${this.BB_BASIC_CREDENTIALS}`,
        },
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
  async SearchLastPurchase(): Promise<IPurchase> {
    // set authentication
    const auth = await this.auth();
    const accessToken = auth.data.access_token;

    let purchase: IResponseSearchBBPurchase;
    const increment = 3;
    let newDays = 0; // increments the range of days for search the last purchase
    let interval = increment; // range of 3 days
    let checkLastInterval = false;

    // execute até achar pelo menos um boleto
    do {
      try {
        const yesterday = formatDate(addDays(new Date(), -interval), 'dd.MM.yyyy');
        const today = formatDate(addDays(new Date(), newDays), 'dd.MM.yyyy');

        const url = `${this.BB_API_URL}/boletos?${this.BB_APP_KEY}=${this.BB_API_KEY}&indicadorSituacao=B&agenciaBeneficiario=${this.BB_AGENCIA}&contaBeneficiario=${this.BB_CONTA}&dataInicioMovimento=${yesterday}&dataFimMovimento=${today}`;
        const res = await axios.get(`${url}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
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
    const boletos = purchase!.boletos.sort((a, b) => Number(a.numeroBoletoBB) - Number(b.numeroBoletoBB));

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
  async CreatePurchase(data: ICreateBBPurchaseProps): Promise<IResponseBBPurchaseProps> {
    // verify params
    CheckBBCreatePurchase(data);

    try {
      const auth = await this.auth();
      const accessToken = auth.data.access_token;

      let ticket;
      if (this.ENVIRONMENT === 'dev') {
        ticket = String(crypto.randomInt(10000, 1000000)).padStart(10, '0');
      } else {
        const lastPurchase = await this.SearchLastPurchase();
        ticket = String(Number(lastPurchase.numeroBoletoBB.substring(10)) + 1).padStart(10, '0'); // increment 1 in for create a new purchase
      }

      const requestData = {
        numeroConvenio: this.BB_CONVENIO,
        numeroCarteira: this.BB_WALLET,
        numeroVariacaoCarteira: this.BB_WALLET_VARIATION,
        codigoModalidade: 1,
        dataEmissao: formatDate(new Date(), 'dd.MM.yyyy'),
        dataVencimento: formatDate(addDays(new Date(), 1), 'dd.MM.yyyy'), // vencimento padrão de 1 dia
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
          uf: data.customerStateCode,
        },
      }

      const response = await axios.post(`${this.BB_API_URL}/boletos?${this.BB_APP_KEY}=${this.BB_API_KEY}`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
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
          paymentVoucher: response.data.beneficiario.indicadorComprovacao,
        },
        qrCode: {
          url: response.data.qrCode.url,
          txId: response.data.qrCode.txId,
          emv: response.data.qrCode.emv,
        },
      }
    } catch (error) {
      // console.log({ error })
      const isAppError = error instanceof AxiosError
      const message = isAppError ? `Houve um erro na geração do boleto pela API do Banco do Brasil. Err: ${error.response?.data.erros[0].mensagem} - ${error.response?.data.erros[0].ocorrencia}` : 'Não gerar um registro de boleto.'
      throw Error(message);
    }
  }

  /**
   * Método responsável por gerar o modelo em PDF do boleto.
   * @param data ICreateBBPurchaseTicketProps
   * @return string Path do arquivo gerado
   */
  async CreatePurchaseTicket(data: ICreateBBPurchaseTicketProps): Promise<string> {
    const codigoBanco = '001';
    const numMoeda = '9';
    const valor = data.ticketValue.toLocaleString('pt-br', {
      minimumFractionDigits: 2,
    });
    const dataBoleto = {
      // nosso_numero: numBoleto,
      numero_documento: data.purchaseId, // Num do pedido ou do documento
      data_vencimento: data.dueDate, // Data de Vencimento do Boleto - REGRA: Formato DD/MM/AAAA
      data_documento: formatDate(new Date(), 'dd/MM/yyyy'), // Data de emissão do Boleto
      data_processamento: formatDate(new Date(), 'dd/MM/yyyy'), // Data de processamento do boleto (opcional)
      valor_boleto: valor, // Valor do Boleto - REGRA: Com vírgula e sempre com duas casas depois da virgula

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
      agencia: this.BB_AGENCIA, // Num da agencia, sem digito
      conta: this.BB_CONTA, // Num da conta, sem digito

      // DADOS PERSONALIZADOS - BANCO DO BRASIL
      convenio: this.BB_CONVENIO, // Num do convênio - REGRA: 6 ou 7 ou 8 dígitos
      contrato: '999999', // Num do seu contrato
      carteira: this.BB_WALLET,
      variacao_carteira: '', // Variação da Carteira, com traço (opcional)

      // TIPO DO BOLETO
      formatacao_convenio: '7', // REGRA: 8 p/ Convênio c/ 8 dígitos, 7 p/ Convênio c/ 7 dígitos, ou 6 se Convênio c/ 6 dígitos
      formatacao_nosso_numero: '2', // REGRA: Usado apenas p/ Convênio c/ 6 dígitos: informe 1 se for NossoNúmero de até 5 dígitos ou 2 para opção de até 17 dígitos

      // SEUS DADOS
      identificacao: '',
      cpf_cnpj: '32.063.701/0001-66',
      endereco: '',
      cidade_uf: 'Teresina / PI',
      cedente: 'M & F COMERCIO DE LIVROS E ALIMENTOS LTDA',

      linha_digitavel: montaLinhaDigitavel(data.numericBarcode),
      agencia_codigo: `${this.BB_AGENCIA}-${modulo11(this.BB_AGENCIA)} / ${this.BB_CONTA}-${modulo11(
        this.BB_CONTA,
      )}`,
      nosso_numero: formatacaoConvenio7(
        codigoBanco,
        numMoeda,
        String(fatorVencimento(data.dueDate)),
        formataNumero(String(valor), 10, 0, 'valor'),
        '000000',
        this.BB_CONVENIO,
        data.purchaseId,
        this.BB_WALLET,
      ),
      codigo_banco_com_dv: geraCodigoBanco(codigoBanco),
    };

    const templatePath = path.resolve(
      __dirname,
      '..',
      'views',
      'banco-do-brasil',
      'boleto.hbs',
    );

    // gerando barcode
    const xmlSerializer = new XMLSerializer();
    const document = new DOMImplementation().createDocument(
      'http://www.w3.org/1999/xhtml',
      'html',
      null,
    );
    const svgNode = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    JSBarcode(svgNode, dataBoleto.linha_digitavel, {
      xmlDocument: document,
      height: 50,
      width: 1,
      displayValue: false,
    });

    const svgText = xmlSerializer.serializeToString(svgNode);

    const b64 = svg64(svgText);

    // read logo banco do brasil
    const logoPath = path.resolve(
      __dirname,
      '..',
      'public',
      'images',
      'logobb.jpg',
    );
    const logoBase64 = fs.readFileSync(logoPath, { encoding: 'base64' });

    const templateHtml = fs.readFileSync(templatePath).toString('utf-8');
    const templateHTML = handlebars.compile(templateHtml);
    const html = templateHTML({ dataBoleto, barcode: b64, logobb: logoBase64 });
    // const html = templateHTML({ data, images });

    const pdfRootPath = path.resolve(
      process.cwd(),
      'tmp',
      'uploads',
      'boletos',
    );

    if (!fs.existsSync(pdfRootPath)) {
      fs.mkdirSync(pdfRootPath, { recursive: true });
    }

    const milis = new Date().getTime();
    const pdfPath = path.join(pdfRootPath, `boleto-${milis}.pdf`);

    pdf
      .create(html, {
        format: 'A4',
        // width: '22cm',
        // height: '29.7cm',
      })
      .toFile(pdfPath, (err, fileData) => {
        console.log(`Salvando PDF.`);
        if (err) return console.log(err);
        console.log('Pdf generated.');
        return fileData;
      });

    return generateLink('boletos', `boleto-${milis}.pdf`);
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