import { left } from '@core/logic/either';
import { IBoleto } from '@domain/boleto/dto/boleto.dto';
import { BadRequestError } from '@errors/bad-request.error';
import axios from 'axios';
import { addDays } from 'date-fns';
import { formatDate } from './format-date';

type IRequestSearchBoleto = {
  bbBasicCredentials: string;
  bbApiKey: string;
  bbAgencia: string;
  bbConta: string;
};

export type IResponseSearchBoleto = {
  indicadorContinuidade: string;
  quantidadeRegistros: string;
  proximoIndice: string;
  boletos: IBoleto[];
};

type IRequestCreateBoleto = {
  bbApiKey: string;
  bbBasicCredentials: string;
  bbConvenio: string;
  bbWallet: string;
  bbWalletVariation: string;
  total: number;
  numeroBoleto: string;
  cepCliente: string;
  nomeComprador: string;
  cpfComprador: string;
  enderecoComprador: string;
  cidadeComprador: string;
  bairroComprador: string;
  estadoComprador: string;
};

export type IResponseCreateBoleto = {
  numero: string;
  numeroCarteira: number;
  numeroVariacaoCarteira: number;
  codigoCliente: number;
  linhaDigitavel: string;
  codigoBarraNumerico: string;
  numeroContratoCobranca: number;
  ticketSequence: string;
  beneficiario: {
    agencia: number;
    contaCorrente: number;
    tipoEndereco: number;
    logradouro: string;
    bairro: string;
    cidade: string;
    codigoCidade: number;
    uf: string;
    cep: number;
    indicadorComprovacao: string;
  };
  qrCode: {
    url: string;
    txId: string;
    emv: string;
  };
};

export class BB {
  private BB_OAUTH_URL: string;
  private BB_API_URL: string;
  private BB_APP_KEY: string;

  constructor(BB_OAUTH_URL: string, BB_API_URL: string, BB_APP_KEY: string) {
    this.BB_OAUTH_URL = BB_OAUTH_URL;
    this.BB_API_URL = BB_API_URL;
    this.BB_APP_KEY = BB_APP_KEY;
  }

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
      throw Error(`Houve um erro na autenticação com o Banco do Brasil. Err: ${err.response.data.erros[0].mensagem} - ${err.response.data.erros[0].ocorrencia}`);
    }
  }

  /**
   * Search boletos in interval
   * @param IRequestSearchBoleto
   * @return IResponseSearchBoleto
   */
  async searchBoleto({
    bbBasicCredentials,
    bbApiKey,
    bbAgencia,
    bbConta,
  }: IRequestSearchBoleto): Promise<IResponseSearchBoleto> {
    const auth = await this.auth(bbBasicCredentials);
    const accessToken = auth.data.access_token;

    let boleto;
    const increment = 3;
    let newDays = 0; // incrementa o intervalo de dias para buscar o ultimo boleto
    let interval = increment; // intervalo de 15 dias
    let checkLastInterval = false;
    do {
      try {
        const yesterday = formatDate(addDays(new Date(), -interval), 'dd.MM.yyyy');
        const today = formatDate(addDays(new Date(), newDays), 'dd.MM.yyyy');

        const url = `${this.BB_API_URL}/boletos?${this.BB_APP_KEY}=${bbApiKey}&indicadorSituacao=B&agenciaBeneficiario=${bbAgencia}&contaBeneficiario=${bbConta}&dataInicioMovimento=${yesterday}&dataFimMovimento=${today}`;
        const res = await axios.get(`${url}`, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (res.data) {
          checkLastInterval = true;
          boleto = res.data;
          console.log('Boletos encontrados');
        }

        newDays -= increment;
        interval += increment;
      } catch (err) {
        throw Error(`Houve um erro na pesquisa de boletos do Banco do Brasil. Err: ${err.response.data.erros[0].mensagem} - ${err.response.data.erros[0].ocorrencia}`);
      }
    } while (!checkLastInterval);

    return boleto;
  }

  /**
   * Create a new boleto in account of Banco do Brasil
   * @param IRequestCreateBoleto 
   * @return IResponseCreateBoleto
   */
  async createBoleto({
    bbApiKey,
    bbBasicCredentials,
    bbConvenio,
    bbWallet,
    bbWalletVariation,
    nomeComprador,
    cpfComprador,
    cepCliente,
    enderecoComprador,
    bairroComprador,
    cidadeComprador,
    estadoComprador,
    numeroBoleto,
    total,
  }: IRequestCreateBoleto): Promise<IResponseCreateBoleto> {
    if (!bbConvenio || !bbWallet || !bbWalletVariation) {
      throw Error('Não foi informado o convêncio ou wallet, que são necessários para criar boleto');
    }

    try {
      const request = {
        numeroConvenio: bbConvenio,
        numeroCarteira: bbWallet,
        numeroVariacaoCarteira: bbWalletVariation,
        codigoModalidade: 1,
        dataEmissao: formatDate(new Date(), 'dd.MM.yyyy'),
        dataVencimento: formatDate(addDays(new Date(), 1), 'dd.MM.yyyy'), // vencimento padrão de 1 dia
        valorOriginal: Number(total),
        codigoAceite: 'A',
        codigoTipoTitulo: 2,
        indicadorPermissaoRecebimentoParcial: 'N',
        numeroTituloCliente: `000${bbConvenio}${numeroBoleto}`,
        pagador: {
          tipoInscricao: 1,
          nome: nomeComprador,
          numeroInscricao: cpfComprador,
          cep: cepCliente,
          endereco: enderecoComprador,
          cidade: cidadeComprador,
          bairro: bairroComprador,
          uf: estadoComprador,
        },
      };

      const auth = await this.auth(bbBasicCredentials);
      const accessToken = auth.data.access_token;

      const url = `${this.BB_API_URL}/boletos?${this.BB_APP_KEY}=${bbApiKey}`;
      const res = await axios.post(`${url}`, request, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return {
        numero: res.data.numero,
        numeroCarteira: res.data.numeroCarteira,
        numeroVariacaoCarteira: res.data.numeroVariacaoCarteira,
        codigoCliente: res.data.codigoCliente,
        linhaDigitavel: res.data.linhaDigitavel,
        codigoBarraNumerico: res.data.codigoBarraNumerico,
        numeroContratoCobranca: res.data.numeroContratoCobranca,
        ticketSequence: numeroBoleto,
        beneficiario: {
          agencia: res.data.beneficiario.agencia,
          contaCorrente: res.data.beneficiario.contaCorrente,
          tipoEndereco: res.data.beneficiario.tipoEndereco,
          logradouro: res.data.beneficiario.logradouro,
          bairro: res.data.beneficiario.bairro,
          cidade: res.data.beneficiario.cidade,
          codigoCidade: res.data.beneficiario.codigoCidade,
          uf: res.data.beneficiario.uf,
          cep: res.data.beneficiario.cep,
          indicadorComprovacao: res.data.beneficiario.indicadorComprovacao,
        },
        qrCode: {
          url: res.data.qrCode.url,
          txId: res.data.qrCode.txId,
          emv: res.data.qrCode.emv,
        },
      }
    } catch (err) {
      throw Error(`Houve um erro na geração do boleto pela API do Banco do Brasil. Err: ${err.response.data.erros[0].mensagem} - ${err.response.data.erros[0].ocorrencia}`);
    }
  }
}
