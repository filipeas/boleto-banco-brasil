import { IBoletoRepository, ICreateBoleto } from "@application/repositories/boleto/boleto.repository";
import { Either, left, right } from "@core/logic/either";
import { IBoleto } from "@domain/boleto/dto/boleto.dto";
import { Boleto } from "@domain/boleto/entities/boleto";
import { BoletoMapper } from "@domain/boleto/mappers/boleto.mapper";
import { NotFoundError } from "@errors/not-found.error";
import { inject, injectable } from "tsyringe";
import crypto from 'crypto';
import { generateBoleto } from "@infra/utils/generate-boleto";
import { formatDate } from "@infra/utils/format-date";
import { addDays } from "date-fns";
import { IEnvironment } from "@core/dto/environment";

type IRequest = {
  environment: IEnvironment;
  BB_API_KEY: string;
  BB_BASIC_CREDENTIALS: string;
  BB_CONVENIO: string;
  BB_WALLET: string;
  BB_WALLET_VARIATION: string;
  BB_AGENCIA: string;
  BB_CONTA: string;
  BB_OAUTH_URL: string;
  BB_API_URL: string;
  BB_APP_KEY: string;
  nomeComprador: string;
  cpfComprador: string;
  cepCliente: string;
  enderecoComprador: string;
  bairroComprador: string;
  cidadeComprador: string;
  estadoComprador: string;
  total: number;
}
type IResponse = Either<NotFoundError, IBoleto>;

@injectable()
export class CreateBoleto {
  constructor(
    @inject('BoletoRepository')
    private boletoRepository: IBoletoRepository
  ) { }

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
    total,
  }: IRequest): Promise<IResponse> {
    const lastBoleto = await this.boletoRepository.findLastBoleto(
      BB_AGENCIA,
      BB_API_KEY,
      BB_BASIC_CREDENTIALS,
      BB_CONTA,
      BB_OAUTH_URL,
      BB_API_URL,
      BB_APP_KEY
    );
    if (!lastBoleto) {
      return left(new NotFoundError("Último boleto não encontrado"));
    }

    // size of numero do boleto must be 10 characters (get the last 10 characters and add 1 for take next boleto)
    console.log('Executando em modo: ' + environment);
    let numeroBoleto;
    if (environment === 'dev') {
      numeroBoleto = String(crypto.randomInt(10000, 1000000)).padStart(10, '0');
    } else {
      numeroBoleto = String(Number(lastBoleto.numeroBoletoBB.substring(10)) + 1).padStart(10, '0');
    }

    const data = await this.boletoRepository.createBoleto({
      environment,
      BB_API_KEY,
      BB_BASIC_CREDENTIALS,
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
      total,
    })
    if (!data) {
      return left(new NotFoundError("Boleto não encontrado"));
    }

    // generate PDF
    const linkBoleto = generateBoleto({
      environment,
      agencia: BB_AGENCIA,
      conta: BB_CONTA,
      bbConvenio: BB_CONVENIO,
      bbWallet: BB_WALLET,
      cepCliente,
      cidadeComprador,
      codigoBarraNumerico: data.codigoBarraNumerico,
      dataVencimento: formatDate(addDays(new Date(), 1), 'dd/MM/yyyy'),
      enderecoComprador,
      estadoComprador,
      nomeComprador,
      numeroBoleto: data.numero,
      total,
    });

    // create boleto
    const boleto = Boleto.create({
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

    return right(BoletoMapper.toDto(boleto));
  }
}