import { IBoletoRepository, ICreateBoleto } from "@application/repositories/boleto/boleto.repository";
import { AsyncMaybe } from "@core/logic/maybe";
import { IBoleto } from "@domain/boleto/dto/boleto.dto";
import { Boleto } from "@domain/boleto/entities/boleto";
import { IResponseCreateBoleto } from "@infra/utils/bb";

export class BoletoInMemoryRepository implements IBoletoRepository {
  private boletos: Boleto[] = [];

  constructor() {
    const boleto1 = Boleto.create({
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
      valorPago: '1000',
    });
    this.boletos.push(boleto1);

    const boleto2 = Boleto.create({
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
      valorPago: '1000',
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
  }: ICreateBoleto): Promise<IResponseCreateBoleto> {
    const boleto = Boleto.create({
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
      valorPago: String(total),
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
        emv: '',
      }
    }
  }

  async findLastBoleto(agencia: string, apiKey: string, basicCredentials: string, conta: string, BB_OAUTH_URL: string, BB_API_URL: string, BB_APP_KEY: string): AsyncMaybe<IBoleto> {
    if (BB_OAUTH_URL === '1')
      return this.boletos[-1];
    return this.boletos[this.boletos.length - 1];
  }

  async findBoletosByConta(conta: string): Promise<IBoleto[]> {
    throw new Error("Method not implemented.");
  }
}