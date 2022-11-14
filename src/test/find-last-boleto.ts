import 'dotenv/config';
import 'reflect-metadata';
import { BoletoRepository } from "@infra/repositories/boleto/boleto.repository";
import { FindLastBoleto } from "@application/usecases/boleto/find-last-boleto";

const boletoRepository = new BoletoRepository();
const findLastBoleto = new FindLastBoleto(boletoRepository);
const result = findLastBoleto.run(
  {
    BB_AGENCIA: String(process.env.BB_AGENCIA),
    BB_API_KEY: String(process.env.BB_API_KEY),
    BB_BASIC_CREDENTIALS: String(process.env.BB_BASIC_CREDENTIALS),
    BB_CONTA: String(process.env.BB_CONTA),
    BB_OAUTH_URL: String(process.env.BB_OAUTH_URL),
    BB_API_URL: String(process.env.BB_API_URL),
    BB_APP_KEY: String(process.env.BB_APP_KEY)
  });

console.log(result);