import { IClientProvider } from "../providers/client.provider";

export type ICreateBBPurchase = {
  nomeComprador: string;
  cpfComprador: string;
  cepCliente: string;
  enderecoComprador: string;
  bairroComprador: string;
  cidadeComprador: string;
  estadoComprador: string;
  // numeroBoleto: string;
  total: number;
}

export type IResponseBBPurchase = {
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



  async createPurchase<CreateBBPurchase, IResponseBBPurchase>(data: CreateBBPurchase): Promise<IResponseBBPurchase> {
    console.log(data);
    return {} as IResponseBBPurchase
  }

}