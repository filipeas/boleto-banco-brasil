import 'dotenv/config';
import 'reflect-metadata';
import { BoletoRepository } from "@infra/repositories/boleto/boleto.repository";
import { CreateBoleto } from '@application/usecases/boleto/create-boleto';

const boletoRepository = new BoletoRepository();
const createBoleto = new CreateBoleto(boletoRepository);
const result = createBoleto.run(
  {
    BB_API_KEY: String(process.env.BB_API_KEY),
    BB_BASIC_CREDENTIALS: String(process.env.BB_BASIC_CREDENTIALS),
    BB_CONVENIO: String(process.env.BB_CONVENIO),
    BB_WALLET: String(process.env.BB_WALLET),
    BB_WALLET_VARIATION: String(process.env.BB_WALLET_VARIATION),
    BB_AGENCIA: String(process.env.BB_AGENCIA),
    BB_API_URL: String(process.env.BB_API_URL),
    BB_APP_KEY: String(process.env.BB_APP_KEY),
    BB_CONTA: String(process.env.BB_CONTA),
    BB_OAUTH_URL: String(process.env.BB_OAUTH_URL),
    bairroComprador: 'Mocambinho',
    cepCliente: '77458000',
    cidadeComprador: 'Teresina',
    cpfComprador: '96050176876',
    enderecoComprador: 'Avenida Jusipio Lustosa',
    estadoComprador: 'PI',
    nomeComprador: 'Filipe A. Sampaio',
    total: 1000
  });

console.log(result);