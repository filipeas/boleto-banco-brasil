import 'dotenv/config';
import { IBoletoRepository } from "@application/repositories/boleto/boleto.repository";
import { BoletoRepository } from "@infra/repositories/boleto/boleto.repository";
import { CreateBoleto } from './create-boleto';

describe('Create Boleto', () => {
  let boletoRepository: IBoletoRepository;

  beforeEach(() => {
    jest.setTimeout(30000);
    boletoRepository = new BoletoRepository();
  });

  it('Create Boleto', async () => {
    const createBoleto = new CreateBoleto(boletoRepository);
    const result = await createBoleto.run(
      {
        environment: 'dev',
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

    expect(result.isRight()).toBeTruthy();
    expect(result.value).toHaveProperty('numeroBoletoBB');
  });
})