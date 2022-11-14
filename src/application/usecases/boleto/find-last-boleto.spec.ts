import 'dotenv/config';
import { IBoletoRepository } from "@application/repositories/boleto/boleto.repository";
import { FindLastBoleto } from "./find-last-boleto";
import { BoletoInMemoryRepository } from '@tests/repositories/boleto-in-memory.repository';
import { NotFoundError } from '@errors/not-found.error';

describe('Find Last Boleto', () => {
  let boletoRepository: IBoletoRepository;

  beforeEach(() => {
    boletoRepository = new BoletoInMemoryRepository();
  });

  it('failed to find last boleto', async () => {
    const findLastBoleto = new FindLastBoleto(boletoRepository);
    const result = await findLastBoleto.run(
      {
        BB_AGENCIA: '123',
        BB_API_KEY: '1111111111222222222233333333334444444444',
        BB_BASIC_CREDENTIALS: 'Basic key',
        BB_CONTA: '123456',
        BB_OAUTH_URL: '1',// informando agencia 1 ele vai dar o erro para cair nesse teste
        BB_API_URL: 'https://api.hm.bb.com.br/cobrancas/v2',
        BB_APP_KEY: 'gw-dev-app-key'
      });

    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toEqual(
      new NotFoundError('Último boleto não encontrado'),
    );
  });

  it('find last boleto', async () => {
    const findLastBoleto = new FindLastBoleto(boletoRepository);
    const result = await findLastBoleto.run(
      {
        BB_AGENCIA: '123',
        BB_API_KEY: '1111111111222222222233333333334444444444',
        BB_BASIC_CREDENTIALS: 'Basic key',
        BB_CONTA: '123456',
        BB_OAUTH_URL: 'https://oauth.sandbox.bb.com.br/oauth/token',
        BB_API_URL: 'https://api.hm.bb.com.br/cobrancas/v2',
        BB_APP_KEY: 'gw-dev-app-key'
      });

    expect(result.isRight()).toBeTruthy();
    expect(result.value).toHaveProperty('numeroBoletoBB');
  });
})