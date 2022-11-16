import axios, { AxiosError } from "axios";
import crypto from 'crypto';

import { PurchaseError } from "../errors/purchase-error";
import { formatDate } from "../utils/format-date";

import { IClientProvider, ICreateBBPurchaseProps, IResponseBBPurchaseProps } from "../providers/client.provider";
import { addDays } from "date-fns";

type IBBClientProps = {
  BB_API_KEY: string,
  BB_BASIC_CREDENTIALS: string,
  BB_CONVENIO: string,
  BB_WALLET: string,
  BB_WALLET_VARIATION: string,
  BB_AGENCIA: string,
  BB_API_URL: string,
  BB_APP_KEY: string,
  BB_CONTA: string,
  BB_OAUTH_URL: string
}


/**
 * Essa classe vai servir como nosso cliente de aplicação, então os métodos vão estar dentro dela.
 * Essa classe vai ser instanciada com os dados da conta que o usuário vai acessar, assim, sempre que precisar buscar
 * ou criar um boleto não vou precisar informar os dados da conta, basta eu buscar o client daquela conta que quero fazer
 * as operações.
 */

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
  private environment?: 'dev' | 'prod';

  
  constructor({
    BB_API_KEY,
    BB_BASIC_CREDENTIALS,
    BB_CONVENIO,
    BB_WALLET,
    BB_WALLET_VARIATION,
    BB_AGENCIA,
    BB_API_URL,
    BB_APP_KEY,
    BB_CONTA,
    BB_OAUTH_URL,
  }: IBBClientProps) {
    this.BB_API_KEY = BB_API_KEY;
    this.BB_BASIC_CREDENTIALS = BB_BASIC_CREDENTIALS;
    this.BB_CONVENIO = BB_CONVENIO;
    this.BB_WALLET = BB_WALLET;
    this.BB_WALLET_VARIATION = BB_WALLET_VARIATION;
    this.BB_AGENCIA = BB_AGENCIA;
    this.BB_API_URL = BB_API_URL;
    this.BB_APP_KEY = BB_APP_KEY;
    this.BB_CONTA = BB_CONTA;
    this.BB_OAUTH_URL = BB_OAUTH_URL;
  }


  /**
   * Aqui eu tou recebendo os dados para gerar uma purchase/boleto como um objeto data,
   * pois passando parâmetros nomeados como um objeto em vez de parâmetros é melhor pois se da forma como tá hoje,
   * se passar algum parâmetro na sequência errada pode gerar erro. 
   */

  private async auth(bbBasicCredentials: string) {
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
          Authorization: `${bbBasicCredentials}`,
        },
      });
    } catch (err) {
      const isAppError = err instanceof AxiosError
      const message = isAppError ? `${err.response?.data.erros[0].mensagem} - ${err.response?.data.erros[0].ocorrencia}` : 'Não foi possível se autenticar.'
      throw new PurchaseError(message);
      // throw Error(`Houve um erro na autenticação com o Banco do Brasil. Err: ${err.response.data.erros[0].mensagem} - ${err.response.data.erros[0].ocorrencia}`);
    }
  }

  async createPurchase(data: ICreateBBPurchaseProps): Promise<IResponseBBPurchaseProps> {

    try {
      const auth = await this.auth(this.BB_BASIC_CREDENTIALS);
      const accessToken = auth.data.access_token;

      const ticket = String(crypto.randomInt(10000, 1000000)).padStart(10, '0');

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
      console.log({ error })
      const isAppError = error instanceof AxiosError
      const message = isAppError ? `Houve um erro na geração do boleto pela API do Banco do Brasil. Err: ${error.response?.data.erros[0].mensagem} - ${error.response?.data.erros[0].ocorrencia}` : 'Não gerar um registro de boleto.'
      throw Error(message);
    }

  }

}