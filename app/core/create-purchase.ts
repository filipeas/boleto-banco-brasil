import { BBClient, ICreateBBPurchase } from '../adapters/bb-client';

/**
 * Esse ponto é bem importante, como o usuário não vai ter acesso ao código, essas variáveis ambiente não podem estar aqui,
 * como é uma lib, a gente vai esperar que ele informe pela aplicação dele
 */
const bbClient = new BBClient({
  BB_API_KEY: 'lasldhskldhsadjksahdjsa',
  BB_BASIC_CREDENTIALS: 'adsadshadklsahdksajhdksahdsajkdhjsa',
  BB_CONVENIO: '495878',
  BB_WALLET: '4687654',
  BB_WALLET_VARIATION: '17',
  BB_AGENCIA: '789456',
  BB_API_URL: 'https://localhost:3333/api-url',
  BB_APP_KEY: 'api key',
  BB_CONTA: '7875465',
  BB_OAUTH_URL: 'https://localshot:3333/oauth-url',
})


bbClient.createPurchase<ICreateBBPurchase, {}>({
  bairroComprador: 'Piçarreira',
  cepCliente: '64000-000',
  cidadeComprador: 'Teresina',
  cpfComprador: '000.000.000-00',
  enderecoComprador: 'Rua de teste',
  estadoComprador: 'PI',
  nomeComprador: 'Rennan Oliveira',
  total: 12
}).then();