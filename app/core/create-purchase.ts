import { BBClient } from '../adapters/bb-client';

/**
 * Esse ponto é bem importante, como o usuário não vai ter acesso ao código, essas variáveis ambiente não podem estar aqui,
 * como é uma lib, a gente vai esperar que ele informe pela aplicação dele
 */
const bbClient = new BBClient({
  BB_API_KEY: 'api key',
  BB_BASIC_CREDENTIALS: 'Basic Auth',
  BB_CONVENIO: 'convenio',
  BB_WALLET: 'wallet',
  BB_WALLET_VARIATION: 'variation',
  BB_AGENCIA: '123',
  BB_API_URL: 'http://localhost:333/app/api',
  BB_APP_KEY: 'app key',
  BB_CONTA: '123456',
  BB_OAUTH_URL: 'http://localhost:333/app/oauth',
})


bbClient.createPurchase({
  customerNeighborhood: 'Piçarreira',
  customerZipCode: '64000000',
  customerCity: 'Teresina',
  customerCPF: '00000000000',
  customerAddress: 'Rua beco da paz, 2064',
  customerStateCode: 'PI',
  customerName: 'Rennan Oliveira',
  purchaseValue: 12
}).then(response => console.log(response));
