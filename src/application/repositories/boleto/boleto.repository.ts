import { AsyncMaybe } from "@core/logic/maybe";
import { IBoleto } from "@domain/boleto/dto/boleto.dto";
import { IResponseCreateBoleto } from "@infra/utils/bb";

export type ICreateBoleto = {
    BB_API_KEY: string;
    BB_BASIC_CREDENTIALS: string;
    BB_CONVENIO: string;
    BB_WALLET: string;
    BB_WALLET_VARIATION: string;
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
    numeroBoleto: string;
    total: number;
};

export interface IBoletoRepository {
    createBoleto({
        BB_API_KEY,
        BB_BASIC_CREDENTIALS,
        BB_CONVENIO,
        BB_WALLET,
        BB_WALLET_VARIATION,
        BB_API_URL,
        BB_APP_KEY,
        BB_OAUTH_URL,
        nomeComprador,
        cpfComprador,
        cepCliente,
        enderecoComprador,
        bairroComprador,
        cidadeComprador,
        estadoComprador,
        numeroBoleto,
        total,
    }: ICreateBoleto
    ): Promise<IResponseCreateBoleto>;
    findLastBoleto(agencia: string, apiKey: string, basicCredentials: string, conta: string, BB_OAUTH_URL: string, BB_API_URL: string, BB_APP_KEY: string): AsyncMaybe<IBoleto>;
    findBoletosByConta(conta: string): Promise<IBoleto[]>;
}