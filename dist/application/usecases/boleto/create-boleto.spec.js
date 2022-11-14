"use strict";

require("dotenv/config");
var _createBoleto = require("./create-boleto");
var _boletoInMemory = require("../../../tests/repositories/boleto-in-memory.repository");
var _notFound = require("../../../errors/not-found.error");
describe('Create Boleto', () => {
  let boletoRepository;
  beforeEach(() => {
    boletoRepository = new _boletoInMemory.BoletoInMemoryRepository();
  });
  it('last boleto dont find', async () => {
    const createBoleto = new _createBoleto.CreateBoleto(boletoRepository);
    const result = await createBoleto.run({
      environment: 'dev',
      BB_API_KEY: '1111111111222222222233333333334444444444',
      BB_BASIC_CREDENTIALS: 'Basic key',
      BB_CONVENIO: '1234567',
      BB_WALLET: '12',
      BB_WALLET_VARIATION: '12',
      BB_AGENCIA: '1',
      BB_API_URL: 'https://api.hm.bb.com.br/cobrancas/v2',
      BB_APP_KEY: 'gw-dev-app-key',
      BB_CONTA: '123456',
      BB_OAUTH_URL: '1',
      // informando agencia 1 ele vai dar o erro para cair nesse teste
      bairroComprador: 'Mocambinho',
      cepCliente: '77458000',
      cidadeComprador: 'Teresina',
      cpfComprador: '96050176876',
      enderecoComprador: 'Avenida Jusipio Lustosa',
      estadoComprador: 'PI',
      nomeComprador: 'Filipe A. Sampaio',
      total: 1000
    });
    expect(result.isLeft()).toBeTruthy();
    expect(result.value).toEqual(new _notFound.NotFoundError('Último boleto não encontrado'));
  });
  it('Create Boleto', async () => {
    const createBoleto = new _createBoleto.CreateBoleto(boletoRepository);
    const result = await createBoleto.run({
      environment: 'dev',
      BB_API_KEY: '1111111111222222222233333333334444444444',
      BB_BASIC_CREDENTIALS: 'Basic key',
      BB_CONVENIO: '1234567',
      BB_WALLET: '12',
      BB_WALLET_VARIATION: '12',
      BB_AGENCIA: '123',
      BB_API_URL: 'https://api.hm.bb.com.br/cobrancas/v2',
      BB_APP_KEY: 'gw-dev-app-key',
      BB_CONTA: '123456',
      BB_OAUTH_URL: 'https://oauth.sandbox.bb.com.br/oauth/token',
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
});