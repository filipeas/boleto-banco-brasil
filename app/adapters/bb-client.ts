import axios, { AxiosError } from "axios";
import crypto from 'crypto';

import { PurchaseError } from "../errors/purchase-error";
import { formatDate } from "../utils/format-date";

import { IClientProvider, ICreateBBPurchaseProps, IPurchase, IResponseBBPurchaseProps, IResponseSearchBBPurchase } from "../providers/client.provider";
import { addDays } from "date-fns";

import { CheckBBClientProps } from "../utils/check-bb-client-props";
import { CheckBBCreatePurchase } from "../utils/check-bb-create-purchase";

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
  private ENVIRONMENT?: 'dev' | 'prod';
  private AUTHENTICATION!: string;

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
  async searchLastPurchase(): Promise<IPurchase> {
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
        console.log(url)
        const res = await axios.get(`${url}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.data) {
          checkLastInterval = true;
          purchase = res.data;
          console.log('Boletos encontrados.');
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
  async createPurchase(data: ICreateBBPurchaseProps): Promise<IResponseBBPurchaseProps> {
    // verify params
    CheckBBCreatePurchase(data);

    try {
      const auth = await this.auth();
      const accessToken = auth.data.access_token;

      let ticket;
      if (this.ENVIRONMENT === 'dev') {
        ticket = String(crypto.randomInt(10000, 1000000)).padStart(10, '0');
      } else {
        const lastPurchase = await this.searchLastPurchase();
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

}