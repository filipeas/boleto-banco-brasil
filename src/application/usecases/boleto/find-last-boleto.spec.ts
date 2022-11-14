import 'dotenv/config';
import { IBoletoRepository } from "@application/repositories/boleto/boleto.repository";
import { BoletoRepository } from "@infra/repositories/boleto/boleto.repository";
import { FindLastBoleto } from "./find-last-boleto";

describe('Find Last Boleto', () => {
  let boletoRepository: IBoletoRepository;

  beforeEach(() => {
    boletoRepository = new BoletoRepository();
  });

  it('find last boleto', async () => {
    const findLastBoleto = new FindLastBoleto(boletoRepository);
    const result = await findLastBoleto.run(
      {
        BB_AGENCIA: String(process.env.BB_AGENCIA),
        BB_API_KEY: String(process.env.BB_API_KEY),
        BB_BASIC_CREDENTIALS: String(process.env.BB_BASIC_CREDENTIALS),
        BB_CONTA: String(process.env.BB_CONTA),
        BB_OAUTH_URL: String(process.env.BB_OAUTH_URL),
        BB_API_URL: String(process.env.BB_API_URL),
        BB_APP_KEY: String(process.env.BB_APP_KEY)
      });

    expect(result.isRight()).toBeTruthy();
    expect(result.value).toHaveProperty('numeroBoletoBB');
  });
})