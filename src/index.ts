import 'dotenv/config';
import 'reflect-metadata';
import { BoletoRepository } from "@infra/repositories/boleto/boleto.repository";
import { CreateBoleto } from '@application/usecases/boleto/create-boleto';
import { IEnvironment } from '@core/dto/environment';
import { FindLastBoleto } from '@application/usecases/boleto/find-last-boleto';

export async function createBoleto(
  environment: IEnvironment,
  BB_API_KEY: string,
  BB_BASIC_CREDENTIALS: string,
  BB_CONVENIO: string,
  BB_WALLET: string,
  BB_WALLET_VARIATION: string,
  BB_AGENCIA: string,
  BB_API_URL: string,
  BB_APP_KEY: string,
  BB_CONTA: string,
  BB_OAUTH_URL: string,
  bairroComprador: string,
  cepCliente: string,
  cidadeComprador: string,
  cpfComprador: string,
  enderecoComprador: string,
  estadoComprador: string,
  nomeComprador: string,
  total: number,
) {
  const boletoRepository = new BoletoRepository();
  const createBoleto = new CreateBoleto(boletoRepository);

  const result = await createBoleto.run(
    {
      environment,
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
      bairroComprador,
      cepCliente,
      cidadeComprador,
      cpfComprador,
      enderecoComprador,
      estadoComprador,
      nomeComprador,
      total,
    });

  return result;
}

export async function findLastBoleto(
  BB_AGENCIA: string,
  BB_API_KEY: string,
  BB_BASIC_CREDENTIALS: string,
  BB_CONTA: string,
  BB_OAUTH_URL: string,
  BB_API_URL: string,
  BB_APP_KEY: string,
) {
  const boletoRepository = new BoletoRepository();
  const findLastBoleto = new FindLastBoleto(boletoRepository);
  const result = findLastBoleto.run(
    {
      BB_AGENCIA,
      BB_API_KEY,
      BB_BASIC_CREDENTIALS,
      BB_CONTA,
      BB_OAUTH_URL,
      BB_API_URL,
      BB_APP_KEY,
    });

  return result;
}